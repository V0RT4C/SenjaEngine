import log from 'Logger';
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendCloseContainerOperation } from "CoreSendOperations/SendCloseContainerOperation.class.ts";
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";
import { TCP } from 'Dependencies';

@StaticImplements<StaticOperationCode>()
export class CloseContainerOP extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.CLOSE_CONTAINER;

    private _containerId! : number;

    public parseMessage() {
        this._containerId = this._msg.readUint8();
        log.debug(`Close container with id ${this._containerId}`);
    }

    protected _internalOperations(): boolean {
        return this._player.closeContainerById(this._containerId);
    }

    protected async _networkOperations(): Promise<boolean> {
        const msg = OutgoingNetworkMessage.withClient(this._msg.client as TCP.Client, SendCloseContainerOperation.messageSize);
        SendCloseContainerOperation.writeToNetworkMessage(this._containerId, msg);
        await msg.send();
        return true;
    }

}