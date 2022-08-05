import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from 'Player';
import players from "Players";

export abstract class IncomingGameOperation extends GameOperation {
    constructor(msg : IncomingNetworkMessage){
        super();
        this._msg = msg;
        const player = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (player === null){
            throw new Error('Player cant be null');
        }

        this._player = player;
    }

    protected _msg : IncomingNetworkMessage;
    protected _player : Player;

    public parseMessage?() : void;

    public async execute(): Promise<void> {
        const internalOperationsIsAsync = this._internalOperations.constructor.name === 'AsyncFunction';

        if (internalOperationsIsAsync){
            if (await this._internalOperations()){
                await this._networkOperations();
            }
        }else{
            if (this._internalOperations()){
                await this._networkOperations();
            }
        }
    }
}

