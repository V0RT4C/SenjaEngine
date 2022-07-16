import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import players from "Game/Player/Players.class.ts";
import { PROTOCOL_SEND, SPEAK_TYPE } from "Constants";
import { IPosition } from "Types";

export class SendCreatureSpeakOperation implements OutgoingSendOperation {
    constructor(
        private readonly _message : string,
        private readonly _speakType : SPEAK_TYPE,
        private readonly _speakerName : string,
        private readonly _position : IPosition
    ){}

    public static messageSize = 1000;

    public static writeToNetworkMessage(message: string, speakType : SPEAK_TYPE, position: IPosition, speakerName: string, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.CREATURE_SPEAK);
        msg.writeString(speakerName);
        msg.writeUint8(speakType);

        switch(speakType){
            case SPEAK_TYPE.SAY:
            case SPEAK_TYPE.WHISPER:
            case SPEAK_TYPE.YELL:
                msg.writePosition(position);
                break;
        }

        msg.writeString(message);
    }

    public async execute(){
        if (this._speakType !== SPEAK_TYPE.YELL){
            const msg = new OutgoingNetworkMessage(SendCreatureSpeakOperation.messageSize);
            SendCreatureSpeakOperation.writeToNetworkMessage(this._message, this._speakType, this._position, this._speakerName, msg);
            await msg.sendToPlayersInAwareRange(this._position);
        }else{
            //Is yell, send to more players in vicitinity than regular aware range
            const spectators = players.getPlayersInYellAwareRange(this._position);

            for (const player of spectators){
                const msg = OutgoingNetworkMessage.withClient(player.client, SendCreatureSpeakOperation.messageSize);
                SendCreatureSpeakOperation.writeToNetworkMessage(this._message, this._speakType, this._position, this._speakerName, msg);
                await msg.send();
            }
        }
    }
}