import log from 'Logger';
import { SendPingRequestOperation } from "OutgoingSendOperations/CoreSendOperations/SendPingRequestOperation.class.ts";

import map from 'Map';
import players from 'Players';

import { ILightInfo, IPosition } from "Types";
import { Loop } from "Game/Lib/GameLoop.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";

import Mutex from 'https://deno.land/x/await_mutex@v1.0.1/mod.ts';
import { Player } from "./Player/Player.class.ts";
import { SendMagicEffectOperation } from '../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendMagicEffectOperation.class.ts';
import { SendRemoveThingFromTileOperation } from '../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendRemoveThingFromTileOperation.class.ts';
import db from '../DB/index.ts';
import { GAME_BEAT_MS } from 'Constants/Game.const.ts';
import { ScheduledTask } from './Tasks/ScheduledTasks/ScheduledTask.abstract.ts';
import { ScheduledTaskGroup } from './Tasks/ScheduledTasks/ScheduledTaskGroup.abstract.ts';
import { ScheduledPlayerWalkTask } from './Tasks/ScheduledTasks/PlayerAutoWalkTask/ScheduledPlayerWalkTask.class.ts';

const mutex = new Mutex();

class Game {
    private _map = map;
    private _players = players;
    private _worldLight : ILightInfo = { color: 0xD7, level: 40 };
    private _operationsCache : Array<GameOperation> = [];
    private _scheduledTasksCache : Array<ScheduledTask | ScheduledTaskGroup> = [];
    private _loop : Loop = new Loop(this._mainloopLogic.bind(this), 1000 / GAME_BEAT_MS);
    private _ticks = 0;
    private _gameBeatMs = GAME_BEAT_MS;

    public get loop() : Loop {
        return this._loop;
    }

    public get ticks() : number {
        return this._ticks;
    }

    public get gameBeatMS() : number {
        return this._gameBeatMs;
    }

    public addOperation(op : GameOperation) : void {
        this._operationsCache.unshift(op);
    }

    public addScheduledTask(task : ScheduledTask | ScheduledTaskGroup) : void {
        this._scheduledTasksCache.unshift(task);
    }

    public removeScheduledTaskById(id : number) : boolean {
        let idx = -1;

        for (let i=0; i < this._scheduledTasksCache.length; i++){
            if (this._scheduledTasksCache[i].id === id){
                idx = i;
                break;
            }
        }

        if (idx !== -1){
            const task = this._scheduledTasksCache[idx];

            if (task instanceof ScheduledTaskGroup){
                task.onAbort();
            }
            
            this._scheduledTasksCache.splice(idx, 1);
            return true;
        }else{
            return false;
        }
    }

    public get worldLight() : ILightInfo {
        return this._worldLight;
    }


    private async _mainloopLogic() : Promise<void> {
        if (this._ticks % 200 === 0){
            for (const playerId in this._players.list){
                const p = players.list[playerId];
                if (p.client.isOpen){
                    const ping = new SendPingRequestOperation(p.client);
                    await ping.execute();
                    p.lastPing = Date.now();
                }else{
                    if ((Date.now() - p.lastPing) > 60000){
                        this.removePlayerFromGame(p);
                    }
                }
            }
        }

        while(this._operationsCache.length > 0){
            const id = await mutex.acquire();
            const nextOperation = this._operationsCache.pop() as GameOperation;
            if (nextOperation !== undefined){
                await nextOperation.execute();
            }
            mutex.release(id);
        }

        if(this._scheduledTasksCache.length > 0){
            for (let i=this._scheduledTasksCache.length - 1; i >= 0; i--){
                const nextTask = this._scheduledTasksCache[i];
    
                if (nextTask !== undefined){
                    if (nextTask instanceof ScheduledTaskGroup){
                        if (nextTask.canExecuteNextTask()){
                            const next = await nextTask.executeNextTask();
                            if (next === false){
                                this._scheduledTasksCache.splice(i, 1);
                            }
                        }
                    }else{
                        if (game.ticks >= nextTask.scheduledAtGameTick){
                            const success = await nextTask.execute();
                            if (!success){
                                log.debug(`Scheduled event failed`);
                                this._scheduledTasksCache.pop();
                            }else{
                                this._scheduledTasksCache.pop();
                            }
                        }
                    }
                }
            }
        }

        this._ticks++;
    }

    public removePlayerFromGame(player : Player){
        log.debug('RemovePlayerFromGame');
        const tile = map.getTileAt(player.position);

        if (tile === null){
            log.error(`Tile at player position { x: ${player.position.x}, y: ${player.position.y}, z: ${player.position.z} } is null.`);
            players.removePlayer(player.id);
            return;
        }else{
            const playerStackPos = tile.getThingStackPos(player);

            db.savePlayer(player);

            if (!players.removePlayer(player.id)){
                log.error(`Failed to remove player ${player.name} from players list`);
            }

            if (!tile.removeCreature(player.extId)){
                log.error(`Failed to remove player ${player.name} from map`);
            }

            const removeCreatureOp = new SendRemoveThingFromTileOperation(player.position, playerStackPos);
            removeCreatureOp.execute();
            const magicEffectOp = new SendMagicEffectOperation(3, player.position);
            magicEffectOp.execute();
        }
    }

    public playerHasActiveWalkTask(player : Player){
        for (const task of this._scheduledTasksCache){
            if (task instanceof ScheduledPlayerWalkTask){
                if (task.player === player){
                    return true;
                }
            }
        }

        return false;
    }
}

const game = new Game();
(globalThis as any).game = game;
export default game;