import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { PROTOCOL_SEND } from "Constants";

export class SendUpdateInventoryOperation implements OutgoingSendOperation {
    constructor(
        private _inventorySlot : number,
        private _itemId : number,
        private _client : TCP.Client
    ){}

    public static messageSize = 4;

    public static writeToNetworkMessage(inventorySlot : number, itemId : number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.UPDATE_INVENTORY);
        msg.writeUint8(inventorySlot);
        msg.writeUint16LE(itemId);
    }

    public async execute() {
        const msg = OutgoingNetworkMessage.withClient(this._client, SendUpdateInventoryOperation.messageSize);
        SendUpdateInventoryOperation.writeToNetworkMessage(this._inventorySlot, this._itemId, msg);
        await msg.send();
    }
}