import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { PROTOCOL_SEND } from "Constants";
import { Player } from "Player";

export class SendPlayerStatsOperation implements OutgoingSendOperation {
    constructor(
        private _player : Player,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 21;

    public static writeToNetworkMessage(player : Player, msg : OutgoingNetworkMessage) {
        msg.writeUint8(PROTOCOL_SEND.PLAYER_DATA);
        msg.writeUint16LE(player.health);
        msg.writeUint16LE(player.maxHealth);
        msg.writeUint16LE(player.freeCapacity);
        msg.writeUint32LE(player.experience);
        msg.writeUint16LE(player.level);
        msg.writeUint8(player.levelPercent);
        msg.writeUint16LE(player.mana);
        msg.writeUint16LE(player.maxMana);
        msg.writeUint8(player.magicLevel);
        msg.writeUint8(player.magicLevelPercent);
        msg.writeUint8(player.soulPoints);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendPlayerStatsOperation.messageSize);
        SendPlayerStatsOperation.writeToNetworkMessage(this._player, msg);
        await msg.send();
    }
}