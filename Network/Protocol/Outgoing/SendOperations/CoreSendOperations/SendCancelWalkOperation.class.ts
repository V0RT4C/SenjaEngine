import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { Player } from "Player";
import { CREATURE_DIRECTION, PROTOCOL_SEND } from "Constants";

export class SendCancelWalkOperation implements OutgoingSendOperation {
    constructor(
        private readonly _player : Player
    ){}

    public static messageSize = 2;

    public static writeToNetworkMessage(direction : CREATURE_DIRECTION, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.CANCEL_WALK);
        msg.writeUint8(direction);
    }

    async execute(): Promise<void> {
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendCancelWalkOperation.messageSize);
        SendCancelWalkOperation.writeToNetworkMessage(this._player.direction, msg);
        await msg.send();
    }
}