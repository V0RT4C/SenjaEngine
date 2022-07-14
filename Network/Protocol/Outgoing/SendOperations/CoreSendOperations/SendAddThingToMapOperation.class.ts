import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { IPosition } from "Types";
import { PROTOCOL_SEND } from "Constants";


export class SendAddThingToMapOperation implements OutgoingSendOperation {
    constructor(
        private readonly _thingId : number,
        private readonly _position : IPosition
    ){}

    public static messageSize = 8;

    public static writeToNetworkMessage(thingId: number, position : IPosition, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAP_ADD_THING);
        msg.writePosition(position);
        msg.writeUint16LE(thingId);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendAddThingToMapOperation.messageSize);
        SendAddThingToMapOperation.writeToNetworkMessage(this._thingId, this._position, msg);
        await msg.sendToPlayersInAwareRange(this._position);
    }
}