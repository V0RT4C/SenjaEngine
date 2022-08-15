import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { PARTY_SHIELD, PROTOCOL_SEND, SKULL, THING_ID } from "Constants";
import { Creature } from "Creature";
import game from "../../../../../Game/Game.class.ts";
import { Player } from "../../../../../Game/Player/Player.class.ts";

export class AddCreatureToMapOP implements OutgoingSendOperation {
    constructor(
        private readonly _creature : Creature,
        private readonly _player : Player
    ){}

    public static messageSize = 200;

    public static writeToNetworkMessage(creature: Creature, player : Player, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAP_ADD_THING);
        msg.writePosition(creature.position);

        //const known = player.checkCreatureAsKnown(creature.extId);
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
        const msg = OutgoingNetworkMessage.withClient(this._player.client, AddCreatureToMapOP.messageSize);
        AddCreatureToMapOP.writeToNetworkMessage(this._creature, this._player, msg);
        await msg.send();
    }
}