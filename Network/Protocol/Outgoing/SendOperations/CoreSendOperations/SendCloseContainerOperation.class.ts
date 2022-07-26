import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { PROTOCOL_SEND } from "Constants";

export class SendCloseContainerOperation implements OutgoingSendOperation {
    constructor(
        private readonly _containerId : number,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 2;

    public static writeToNetworkMessage(containerId : number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.CLOSE_CONTAINER);
        msg.writeUint8(containerId); //Container ID
    }

    public async execute(){
        console.log('Sending close container with id', this._containerId)
        const msg = OutgoingNetworkMessage.withClient(this._client, SendCloseContainerOperation.messageSize);
        SendCloseContainerOperation.writeToNetworkMessage(this._containerId, msg);
        await msg.send();
    }
}