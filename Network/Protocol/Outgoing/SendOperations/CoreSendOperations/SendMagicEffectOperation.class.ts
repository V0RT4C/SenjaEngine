import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";

export class SendMagicEffectOperation implements OutgoingSendOperation {
    constructor(
        private readonly _effect : number,
        private readonly _position : IPosition
    ){}

    public static messageSize = 7;

    public static writeToNetworkMessage(effect : number, position : IPosition, msg: OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAGIC_EFFECT);
        msg.writePosition(position);
        msg.writeUint8(effect);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendMagicEffectOperation.messageSize);
        SendMagicEffectOperation.writeToNetworkMessage(this._effect, this._position, msg);
        await msg.sendToPlayersInAwareRange(this._position);
    }
}