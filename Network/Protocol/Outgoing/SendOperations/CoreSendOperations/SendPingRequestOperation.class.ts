import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { PROTOCOL_SEND } from "Constants";

export class SendPingRequestOperation implements OutgoingSendOperation {
    constructor(private readonly _client : TCP.Client){}

    public static messageSize = 1;

    public static writeToNetworkMessage(msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.REQUEST_PING_BACK_OTCLIENT);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendPingRequestOperation.messageSize);
        SendPingRequestOperation.writeToNetworkMessage(msg);
        await msg.send();
    }
}