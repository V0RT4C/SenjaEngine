import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { PROTOCOL_SEND } from "Constants";

export class SendLoginOrPendingOperation implements OutgoingSendOperation {
    constructor(
        private _playerExtId : number,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 8;

    public static writeToNetworkMessage(playerExtId : number, msg : OutgoingNetworkMessage) : void {
        msg.writeUint8(PROTOCOL_SEND.LOGIN_OR_PENDING);
        msg.writeUint32LE(playerExtId);
        msg.writeUint16LE(50);
        msg.writeUint8(1);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendLoginOrPendingOperation.messageSize);
        SendLoginOrPendingOperation.writeToNetworkMessage(this._playerExtId, msg);
        await msg.send();
    }
}