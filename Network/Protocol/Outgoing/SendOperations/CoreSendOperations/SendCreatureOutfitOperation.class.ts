import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";

export class SendCreatureOutfitOperation implements OutgoingSendOperation {
    constructor(
        private _creatureExtId : number,
        private _creaturePosition : IPosition,
        private _lookType : number,
        private _lookHead : number,
        private _lookBody : number,
        private _lookLegs : number,
        private _lookFeet : number
    ){}

    public static messageSize = 10;

    public static writeToNetworkMessage(creatureExtId : number, lookType : number, lookHead: number, lookBody : number, lookLegs: number, lookFeet: number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.CREATURE_OUTFIT);
        msg.writeUint32LE(creatureExtId);
        msg.writeUint8(lookType);
        msg.writeUint8(lookHead);
        msg.writeUint8(lookBody);
        msg.writeUint8(lookLegs);
        msg.writeUint8(lookFeet);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendCreatureOutfitOperation.messageSize);
        SendCreatureOutfitOperation.writeToNetworkMessage(
            this._creatureExtId,
            this._lookType,
            this._lookHead,
            this._lookBody,
            this._lookLegs,
            this._lookFeet,
            msg
        );
        await msg.sendToPlayersInAwareRange(this._creaturePosition);
    }
}