import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";

import { Player } from "Player";
import { PROTOCOL_SEND } from "Constants";

export class SetPlayerModesOP implements OutgoingSendOperation {
    constructor(private readonly _player : Player){}

    static messageSize = 4;

    static writeToNetworkMessage(player : Player, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.PLAYER_MODES);
        msg.writeUint8(player.fightMode);
        msg.writeUint8(player.chaseMode);
        msg.writeUint8(player.safeFightMode);
    }

    public async execute() : Promise<void> {
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SetPlayerModesOP.messageSize);
        SetPlayerModesOP.writeToNetworkMessage(this._player, msg);
        await msg.send();
    }
}