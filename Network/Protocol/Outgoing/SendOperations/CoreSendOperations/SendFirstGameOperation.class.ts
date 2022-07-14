import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { PROTOCOL_SEND } from "Constants";

export class SendFirstGameOperation implements OutgoingSendOperation {
    constructor(private readonly _client : TCP.Client){}

    public static messageSize = 4;

    public static writeToNetworkMessage(msg : OutgoingNetworkMessage) : void {
        msg.writeUint8(PROTOCOL_SEND.FIRST_GAME);
        msg.writeUint8(0);
        msg.writeUint8(0);
        msg.writeUint8(0);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendFirstGameOperation.messageSize);
        SendFirstGameOperation.writeToNetworkMessage(msg);
        await msg.send();
    }
}