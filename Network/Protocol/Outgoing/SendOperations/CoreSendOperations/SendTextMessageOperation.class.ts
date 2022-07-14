import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { MESSAGE_TYPE, PROTOCOL_SEND } from "Constants";
import { TCP } from 'Dependencies';

export class SendTextMessageOperation implements OutgoingSendOperation {
    constructor(
        private readonly _message : string,
        private readonly _messageType : MESSAGE_TYPE,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 1000;

    public static writeToNetworkMessage(message: string, messageType : MESSAGE_TYPE, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.TEXT_MESSAGE);
        msg.writeUint8(messageType);
        msg.writeString(message);
    }

    public async execute() : Promise<void> {
        const msg = OutgoingNetworkMessage.withClient(this._client, SendTextMessageOperation.messageSize);
        SendTextMessageOperation.writeToNetworkMessage(this._message, this._messageType, msg);
        await msg.send();
    }
}