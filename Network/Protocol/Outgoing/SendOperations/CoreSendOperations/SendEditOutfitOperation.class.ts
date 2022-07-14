import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { PLAYER_SEX, PROTOCOL_SEND } from "Constants";
import { Player } from "Player";

export class SendEditOutfitOperation implements OutgoingSendOperation {
    constructor(
        private readonly _player : Player
    ){}

    public static messageSize = 8;

    public static writeToNetworkMessage(player : Player, msg : OutgoingNetworkMessage) : void {
        msg.writeUint8(PROTOCOL_SEND.EDIT_OUTFIT);
        msg.writeUint8(player.outfit.lookType);
        msg.writeUint8(player.outfit.lookHead);
        msg.writeUint8(player.outfit.lookBody);
        msg.writeUint8(player.outfit.lookLegs);
        msg.writeUint8(player.outfit.lookFeet);
        if (player.sex === PLAYER_SEX.MALE){
            //Outfit lookType start
            msg.writeUint8(128);
            //Outfit lookType end
            msg.writeUint8(134);
        }else{
            msg.writeUint8(136);
            msg.writeUint8(142);
        }
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendEditOutfitOperation.messageSize);
        SendEditOutfitOperation.writeToNetworkMessage(this._player, msg);
        await msg.send();
    }
}