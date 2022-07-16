import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { INVENTORY_SLOT, PROTOCOL_SEND } from "Constants";

export class SendDeleteFromInventoryOperation implements OutgoingSendOperation {
    constructor(
        private readonly _inventorySlot : INVENTORY_SLOT,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 2;

    public static writeToNetworkMessage(inventoryslot : INVENTORY_SLOT, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.DELETE_INVENTORY);
        msg.writeUint8(inventoryslot);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendDeleteFromInventoryOperation.messageSize);
        SendDeleteFromInventoryOperation.writeToNetworkMessage(this._inventorySlot, msg);
        await msg.send();
    }
}