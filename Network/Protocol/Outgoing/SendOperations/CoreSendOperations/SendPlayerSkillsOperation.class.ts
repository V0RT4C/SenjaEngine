import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { PROTOCOL_SEND } from "Constants";
import { Player } from "Game/Player/Player.class.ts";

export class SendPlayerSkillsOperation implements OutgoingSendOperation {
    constructor(private readonly _player : Player){}

    public static messageSize = 15;

    public static writeToNetworkMessage(player : Player, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.PLAYER_SKILLS);
        msg.writeUint8(player.skills.fist.level);
        msg.writeUint8(player.skills.fist.percent);
        msg.writeUint8(player.skills.club.level);
        msg.writeUint8(player.skills.club.percent);
        msg.writeUint8(player.skills.sword.level);
        msg.writeUint8(player.skills.sword.percent);
        msg.writeUint8(player.skills.axe.level);
        msg.writeUint8(player.skills.axe.percent);
        msg.writeUint8(player.skills.distance.level);
        msg.writeUint8(player.skills.distance.percent);
        msg.writeUint8(player.skills.shielding.level);
        msg.writeUint8(player.skills.shielding.percent);
        msg.writeUint8(player.skills.fishing.level);
        msg.writeUint8(player.skills.fishing.percent);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendPlayerSkillsOperation.messageSize);
        SendPlayerSkillsOperation.writeToNetworkMessage(this._player, msg);
        await msg.send();
    }
}