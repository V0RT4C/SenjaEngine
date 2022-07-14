import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { PROTOCOL_SEND } from "Constants";
import { TCP } from 'Dependencies';

export class SendDeleteFromContainerOperation implements OutgoingSendOperation {
    constructor(
        private readonly _containerId : number,
        private readonly _slotId : number,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 3;

    public static writeToNetworkMessage(containerId : number, slotId: number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.DELETE_FROM_CONTAINER);
        msg.writeUint8(containerId);
        msg.writeUint8(slotId);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendDeleteFromContainerOperation.messageSize);
        SendDeleteFromContainerOperation.writeToNetworkMessage(this._containerId, this._slotId, msg);
        await msg.send();
    }
}