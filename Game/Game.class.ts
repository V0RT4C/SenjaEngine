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

const mutex = new Mutex();

class Game {
    private _map = map;
    private _players = players;
    private _worldLight : ILightInfo = { color: 0xD7, level: 40 };
    private _operationsCache : Array<GameOperation> = [];
    private _loop : Loop = new Loop(this._mainloopLogic.bind(this), 20);
    private _ticks : number = 0;

    public get loop() : Loop {
        return this._loop;
    }

    public addOperation(op : GameOperation) : void {
        this._operationsCache.unshift(op);
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
}

const game = new Game();
(globalThis as any).game = game;
export default game;