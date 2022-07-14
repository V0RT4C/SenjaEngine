import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendTextMessageOperation } from "OutgoingSendOperations/CoreSendOperations/SendTextMessageOperation.class.ts";
import { MESSAGE_TYPE } from "Constants";
import { TCP } from 'Dependencies';

export class SendCancelMessageOperation implements OutgoingSendOperation {
    constructor(
        private readonly _message : string,
        private readonly _client : TCP.Client
    ){}

    public async execute() : Promise<void> {
        const msg = OutgoingNetworkMessage.withClient(this._client, SendTextMessageOperation.messageSize);
        SendTextMessageOperation.writeToNetworkMessage(this._message, MESSAGE_TYPE.WHITE_MESSAGE_SCREEN_BOTTOM, msg);
        await msg.send();
    }
}