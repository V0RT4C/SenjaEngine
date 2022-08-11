import log from 'Logger';
import map from 'Map';
import players from 'Players';
import worldTime from './WorldTime.class.ts';
import db from '../DB/index.ts';
import { ILightInfo } from "Types";
import { Loop } from "Game/Lib/GameLoop.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from "./Player/Player.class.ts";
import { SendMagicEffectOperation } from '../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendMagicEffectOperation.class.ts';
import { SendRemoveThingFromTileOperation } from '../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendRemoveThingFromTileOperation.class.ts';
import { GAME_BEAT_MS } from 'Constants/Game.const.ts';
import { CreatureMovementTasks } from './Tasks/CreatureMovementTasks.class.ts';
import { PingTask } from './Tasks/PingTask.class.ts';
import { IncomingGameOp } from '../Network/Protocol/Incoming/Operations/IncomingGameOp.abstract.ts';


class Game {
    private _map = map;
    private _players = players;
    private _worldTime = worldTime;
    private _knownCreatures : Set<number> = new Set();
    private _operationsCache : Array<GameOperation | IncomingGameOp> = [];
    private _loop : Loop = new Loop(this._mainloopLogic.bind(this), 1000 / GAME_BEAT_MS);
    private _ticks = 0;
    private _gameBeatMs = GAME_BEAT_MS;
    private _averageExecutionTime = 0;

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
        return this._worldTime.worldLight;
    }

    public getHumanReadableTime() : string {
        return this._worldTime.getHumanReadableTime();
    }

    private _mainloopLogic() : void {
        const start = Date.now();
        while(this._operationsCache.length > 0){
            const nextOperation = this._operationsCache.pop() as GameOperation;
            if (nextOperation !== undefined){
                nextOperation.execute();
            }
        }

        for (const key in players.list){
            CreatureMovementTasks.processPlayerWalk(players.list[key]);
            PingTask.processPlayerPing(players.list[key], this._ticks);
            worldTime.updatePlayer(players.list[key], this._ticks);
        }

        worldTime.processWorldTime(this._ticks);

        this._ticks++;
        const end = Date.now();
        this._averageExecutionTime += (end - start);

        if (this._ticks % 10000 === 0){
            log.info(`Average execution time: ${this._averageExecutionTime / 10000}ms.`);
            this._averageExecutionTime = 0;
        }
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