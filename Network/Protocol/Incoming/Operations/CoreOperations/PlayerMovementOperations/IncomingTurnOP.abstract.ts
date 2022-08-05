import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendCreatureDirectionOperation } from "CoreSendOperations/SendCreatureDirectionOperation.class.ts";
import { CREATURE_DIRECTION } from "Constants";

export abstract class IncomingTurnOP extends IncomingGameOperation {
    //public static operationCode = PROTOCOL_RECEIVE.TURN_EAST;
    protected _turnDirection! : CREATURE_DIRECTION;

    protected abstract _doTurn() : CREATURE_DIRECTION;

    protected _internalOperations(): boolean {
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