import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { TCP } from 'Dependencies';
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { CREATURE_DIRECTION, PROTOCOL_SEND, THING_ID } from "Constants";
import { Creature } from "Creature";

export class SendCreatureDirectionOperation implements OutgoingSendOperation {
    constructor(
        private readonly _creature : Creature,
        private readonly _direction : CREATURE_DIRECTION
    ){}

    public static messageSize = 14;

    public static writeToNetworkMessage(creatureExtId : number, direction: CREATURE_DIRECTION, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAP_UPDATE_THING);
        msg.writeUint16LE(0xFFFF);
        msg.writeUint32LE(creatureExtId);
        msg.writeUint16LE(THING_ID.CREATURE);
        msg.writeUint32LE(creatureExtId); //Update this later
        msg.writeUint8(direction);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendCreatureDirectionOperation.messageSize);
        SendCreatureDirectionOperation.writeToNetworkMessage(this._creature.extId, this._direction, msg);
        await msg.sendToPlayersInAwareRange(this._creature.position);
    }
}