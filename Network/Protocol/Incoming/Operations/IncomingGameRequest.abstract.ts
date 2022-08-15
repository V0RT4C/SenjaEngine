import players from "Game/Player/Players.class.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { PROTOCOL_RECEIVE } from "Constants/Network.const.ts";
import { Player } from "Game/Player/Player.class.ts";

export abstract class IncomingGameRequest {
    constructor(msg : IncomingNetworkMessage){
        this._msg = msg;
        const player = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (player === null){
            throw new Error('Player cant be null');
        }

        this._player = player;
    }

    protected _msg : IncomingNetworkMessage;
    protected _player : Player;

    static operationCode : PROTOCOL_RECEIVE;

    public parseMessage?() : void;
    public abstract execute() : void | Promise<void>;
}