import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";

export class SendRemoveCreatureByExtIdOperation implements OutgoingSendOperation {
    constructor(
        private readonly _creatureExtId : number,
        private readonly _creaturePosition : IPosition
    ){}

    public static messageSize = 7;

    public static writeToNetworkMessage(creatureExtId : number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.REMOVE_THING_FROM_TILE);
        msg.writeUint16LE(0xFFFF);
        msg.writeUint32LE(creatureExtId);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendRemoveCreatureByExtIdOperation.messageSize);
        SendRemoveCreatureByExtIdOperation.writeToNetworkMessage(this._creatureExtId, msg);
        await msg.sendToPlayersInAwareRange(this._creaturePosition);
    }
}