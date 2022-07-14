import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { Creature } from "Creature";
import { PROTOCOL_SEND } from "Constants";

export class SendCreatureLightOperation implements OutgoingSendOperation {
    constructor(
        private readonly creature : Creature,
        private readonly level? : number,
        private readonly color? : number
    ){}

    public static messageSize = 7;

    public static writeToNetworkMessage(lightLevel: number, lightColor: number, creatureExtId : number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.CREATURE_LIGHT);
        msg.writeUint32LE(creatureExtId);
        msg.writeUint8(lightLevel);
        msg.writeUint8(lightColor);
    }

    async execute(): Promise<void> {
        const msg = new OutgoingNetworkMessage(SendCreatureLightOperation.messageSize);
        SendCreatureLightOperation.writeToNetworkMessage(
            this.level ? this.level : this.creature.lightInfo.level,
            this.color ? this.color : this.creature.lightInfo.color,
            this.creature.extId,
            msg);

        await msg.sendToPlayersInAwareRange(this.creature.position);
    }
}