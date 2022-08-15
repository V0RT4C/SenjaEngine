import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { PROTOCOL_SEND } from "Constants";

export class SendWaitWalkOP implements OutgoingSendOperation {
    constructor(private readonly _ms : number, private readonly _client : TCP.Client){}

    public static messageSize = 3;

    public static writeToNetworkMessage(ms: number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.WAIT_WALK);
        msg.writeUint16LE(ms);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendWaitWalkOP.messageSize);
        SendWaitWalkOP.writeToNetworkMessage(this._ms, msg);
        await msg.send();
    }
}