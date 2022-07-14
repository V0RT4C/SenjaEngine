import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { SendUpdateInventoryOperation } from "OutgoingSendOperations/CoreSendOperations/SendUpdateInventoryOperation.class.ts";
import { TCP } from 'Dependencies';
import { INVENTORY_SLOT, PROTOCOL_SEND } from "Constants";
import { Player } from "Player";

export class SendFullInventoryOperation implements OutgoingSendOperation {
    constructor(
        private readonly _player : Player,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = (SendUpdateInventoryOperation.messageSize * 10) + 2;

    public static writeToNetworkMessage(player : Player, msg : OutgoingNetworkMessage) : void {
        if (player.inventory.amulet !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.AMULET, player.inventory.amulet.thingId, msg);
        }

        if (player.inventory.helmet !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.HELMET, player.inventory.helmet.thingId, msg);
        }

        if (player.inventory.backpack !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.BACKPACK, player.inventory.backpack.thingId, msg);
        }

        if (player.inventory.weapon !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.WEAPON, player.inventory.weapon.thingId, msg);
        }

        if (player.inventory.armor !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.ARMOR, player.inventory.armor.thingId, msg);
        }

        if (player.inventory.shield !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.SHIELD, player.inventory.shield.thingId, msg);
        }

        if (player.inventory.ring !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.RING, player.inventory.ring.thingId, msg);
        }

        if (player.inventory.legs !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.LEGS, player.inventory.legs.thingId, msg);
        }

        if (player.inventory.ammunition !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.AMMUNITION, player.inventory.ammunition.thingId, msg);
        }

        if (player.inventory.boots !== null){
            SendUpdateInventoryOperation.writeToNetworkMessage(INVENTORY_SLOT.BOOTS, player.inventory.boots.thingId, msg);
        }
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendFullInventoryOperation.messageSize);
        SendFullInventoryOperation.writeToNetworkMessage(this._player, msg);
        await msg.send();
    }
}