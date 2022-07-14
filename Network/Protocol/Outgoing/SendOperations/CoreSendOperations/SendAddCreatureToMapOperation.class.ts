import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { PARTY_SHIELD, PROTOCOL_SEND, SKULL, THING_ID } from "Constants";
import { Creature } from "Creature";

export class SendAddCreatureToMapOperation implements OutgoingSendOperation {
    constructor(
        private readonly _creature : Creature
    ){}

    public static messageSize = 200;

    public static writeToNetworkMessage(creature: Creature, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAP_ADD_THING);
        msg.writePosition(creature.position);

        const known = false;
        if (known){
            msg.writeUint16LE(THING_ID.KNOWN_CREATURE);
            msg.writeUint32LE(creature.extId);
        }
        else {
            msg.writeUint16LE(THING_ID.UNKNOWN_CREATURE);
            msg.writeUint32LE(creature.extId); //Update this later
            msg.writeUint32LE(creature.extId);
            msg.writeString(creature.name);
        }

        msg.writeUint8(creature.getHealthPercent());

        msg.writeUint8(creature.direction);

        msg.writeUint8(creature.outfit.lookType);
        if (creature.outfit.lookType !== 0){
            msg.writeUint8(creature.outfit.lookHead);
            msg.writeUint8(creature.outfit.lookBody);
            msg.writeUint8(creature.outfit.lookLegs);
            msg.writeUint8(creature.outfit.lookFeet);
        }else{
            //add void sprite for now
            msg.writeUint16LE(100);
        }

        msg.writeUint8(creature.lightInfo.level); //Light intensity
        msg.writeUint8(creature.lightInfo.color);
        msg.writeUint16LE(creature.speed);
        msg.writeUint8(SKULL.NONE);
        msg.writeUint8(PARTY_SHIELD.SHIELD_NONE);
    }

    async execute(): Promise<void> {
        const msg = new OutgoingNetworkMessage(SendAddCreatureToMapOperation.messageSize);
        SendAddCreatureToMapOperation.writeToNetworkMessage(this._creature, msg);
        await msg.sendToPlayersInAwareRange(this._creature.position);
    }
}