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
import { CreatureMovementTasks } from './Tasks/CreatureMovementTasks.class.ts';
import { PingTask } from './Tasks/PingTask.class.ts';

const mutex = new Mutex();
const mutex2 = new Mutex();

class Game {
    private _map = map;
    private _players = players;
    private _worldLight : ILightInfo = { color: 0xD7, level: 40 };
    private _knownCreatures : Set<number> = new Set();
    private _operationsCache : Array<GameOperation> = [];
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

    public get worldLight() : ILightInfo {
        return this._worldLight;
    }


    private async _mainloopLogic() : Promise<void> {
        while(this._operationsCache.length > 0){
            const id = await mutex.acquire();
            const nextOperation = this._operationsCache.pop() as GameOperation;
            if (nextOperation !== undefined){
                await nextOperation.execute();
            }
            mutex.release(id);
        }

        for (const key in players.list){
            CreatureMovementTasks.processPlayerWalk(players.list[key]);

            if (this._ticks % 200 === 0){
                PingTask.processPlayerPing(players.list[key]);
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

    public addKnownCreature(extId : number){
        if (this._knownCreatures.has(extId)){
            return true;
        }else{
            this._knownCreatures.add(extId);
            return false;
        }
    }
}

const game = new Game();
(globalThis as any).game = game;
export default game;