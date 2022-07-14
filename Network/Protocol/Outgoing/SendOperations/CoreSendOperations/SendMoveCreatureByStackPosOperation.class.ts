import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";

export class SendMoveCreatureByStackPosOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _stackPosition : number
    ){}

    public static messageSize = 7;

    public static writeToNetworkMessage(position : IPosition, stackPosition: number, msg : OutgoingNetworkMessage) : void {
        msg.writeUint8(PROTOCOL_SEND.MOVE_CREATURE);
        msg.writePosition(position);
        msg.writeUint8(stackPosition);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendMoveCreatureByStackPosOperation.messageSize);
        SendMoveCreatureByStackPosOperation.writeToNetworkMessage(this._position, this._stackPosition, msg);
        await msg.sendToPlayersInAwareRange(this._position);
    }
}