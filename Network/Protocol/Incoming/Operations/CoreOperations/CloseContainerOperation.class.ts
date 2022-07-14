import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendCloseContainerOperation } from "OutgoingSendOperations/CoreSendOperations/SendCloseContainerOperation.class.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import players from "Game/Player/Players.class.ts";
import { Player } from "Game/Player/Player.class.ts";
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";
import { TCP } from 'Dependencies';

@StaticImplements<StaticOperationCode>()
export class CloseContainerOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.CLOSE_CONTAINER;

    private _containerId! : number;
    private _player! : Player;

    public parseMessage() {
        this._containerId = this._msg.readUint8();
    }

    protected _internalOperations(): boolean {
        const player = players.getPlayerById(this._msg.client?.conn?.rid as number);
        if (player === null){
            return false;
        }

        this._player = player;
        return this._player.closeContainerById(this._containerId);
    }

    protected async _networkOperations(): Promise<boolean> {
        const msg = OutgoingNetworkMessage.withClient(this._msg.client as TCP.Client, SendCloseContainerOperation.messageSize);
        SendCloseContainerOperation.writeToNetworkMessage(this._containerId, msg);
        await msg.send();
        return true;
    }

}