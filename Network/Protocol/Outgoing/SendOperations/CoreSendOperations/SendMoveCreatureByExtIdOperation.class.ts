import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";

export class SendMoveCreatureByExtIdOperation implements OutgoingSendOperation {
    constructor(
        private readonly _oldPosition : IPosition,
        private readonly _newPosition : IPosition,
        private readonly _creatureExtId : number
    ){}

    public static messageSize = 12;

    public static writeToNetworkMessage(newPos: IPosition, creatureExtId: number, msg : OutgoingNetworkMessage) : void {
        msg.writeUint8(PROTOCOL_SEND.MOVE_CREATURE);
        msg.writeUint16LE(0xFFFF);
        msg.writeInt32LE(creatureExtId);
        msg.writePosition(newPos);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendMoveCreatureByExtIdOperation.messageSize);
        SendMoveCreatureByExtIdOperation.writeToNetworkMessage(this._newPosition, this._creatureExtId, msg);
        await msg.sendToPlayersInAwareRange(this._oldPosition, this._newPosition);
    }
}