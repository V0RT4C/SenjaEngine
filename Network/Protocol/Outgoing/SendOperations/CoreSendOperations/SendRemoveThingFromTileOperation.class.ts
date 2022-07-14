import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { IPosition } from "Types";
import { PROTOCOL_SEND } from "Constants";

export class SendRemoveThingFromTileOperation implements OutgoingSendOperation {
    constructor(
        private _position : IPosition,
        private _stackPosition : number
    ){}

    public static messageSize = 7;

    public static writeToNetworkMessage(position: IPosition, stackPosition: number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.REMOVE_THING_FROM_TILE);
        msg.writePosition(position);
        msg.writeUint8(stackPosition);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendRemoveThingFromTileOperation.messageSize);
        SendRemoveThingFromTileOperation.writeToNetworkMessage(this._position, this._stackPosition, msg);
        await msg.sendToPlayersInAwareRange(this._position);
    }
}