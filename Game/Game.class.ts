import { SendPingRequestOperation } from "OutgoingSendOperations/CoreSendOperations/SendPingRequestOperation.class.ts";

import map from 'Map';
import players from 'Players';

import { ILightInfo, IPosition } from "Types";
import { Loop } from "Game/Lib/GameLoop.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";

import Mutex from 'https://deno.land/x/await_mutex@v1.0.1/mod.ts';

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
                const ping = new SendPingRequestOperation(players.list[playerId].client);
                await ping.execute();
            }
        }

        while(this._operationsCache.length > 0){
            const id = await mutex.acquire();
            const nextOperation = this._operationsCache.pop() as GameOperation;
            await nextOperation.execute();
            mutex.release(id);
        }

        this._ticks++;
    }
}

const game = new Game();
(globalThis as any).game = game;
export default game;