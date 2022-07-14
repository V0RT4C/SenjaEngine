import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendCreatureDirectionOperation } from "OutgoingSendOperations/CoreSendOperations/SendCreatureDirectionOperation.class.ts";
import players from "Game/Player/Players.class.ts";
import { Player } from "Game/Player/Player.class.ts";
import { CREATURE_DIRECTION } from "Constants";

export abstract class IncomingTurnOperation extends IncomingGameOperation {
    //public static operationCode = PROTOCOL_RECEIVE.TURN_EAST;
    protected _player! : Player;
    protected _turnDirection! : CREATURE_DIRECTION;

    protected abstract _doTurn() : CREATURE_DIRECTION;

    protected _internalOperations(): boolean {
        const player = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (player === null){
            return false;
        }

        this._player = player;
        this._turnDirection = this._doTurn();
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        let msg = new OutgoingNetworkMessage(SendCreatureDirectionOperation.messageSize);

        SendCreatureDirectionOperation.writeToNetworkMessage(this._player.extId, this._turnDirection, msg);

        await msg.sendToPlayersInAwareRange(this._player.position);
        return true;
    }
}