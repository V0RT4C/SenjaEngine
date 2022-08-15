import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { PROTOCOL_SEND } from "Constants/Network.const.ts";
import { OutgoingSendOperation } from "../OutgoingSendOperation.abtract.ts"
import { IPosition } from "Types";

export class SendUpdateTileItemOp implements OutgoingSendOperation {
    constructor(
        private _position : IPosition,
        private _stackPosition : number,
        private _itemId : number
    ){}

    public static messageSize = 9;

    public static writeToNetworkMessage(position : IPosition, stackPosition: number, itemId: number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAP_UPDATE_THING);
        msg.writePosition(position);
        msg.writeUint8(stackPosition);
        msg.writeUint16LE(itemId);
    }

    public async execute(): Promise<void> {
        const msg = new OutgoingNetworkMessage(SendUpdateTileItemOp.messageSize);
        SendUpdateTileItemOp.writeToNetworkMessage(this._position, this._stackPosition, this._itemId, msg);
        await msg.sendToPlayersInAwareRange(this._position);
    }
}