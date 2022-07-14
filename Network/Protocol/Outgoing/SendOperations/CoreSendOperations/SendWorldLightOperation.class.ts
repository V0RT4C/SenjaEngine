import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";

import game from "Game";

import { PROTOCOL_SEND } from "Constants";
import { TCP } from 'Dependencies';

export class SendWorldLightOperation implements OutgoingSendOperation {
    constructor(private readonly _client : TCP.Client){}

    static messageSize = 3;

    static writeToNetworkMessage(level: number, color: number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.WORLD_LIGHT);
        msg.writeUint8(level);
        msg.writeUint8(color);
    }

    public async execute() : Promise<void> {
        const lightInfo = game.worldLight;
        const msg = OutgoingNetworkMessage.withClient(this._client, SendWorldLightOperation.messageSize);
        SendWorldLightOperation.writeToNetworkMessage(lightInfo.level, lightInfo.color, msg);
        await msg.send();
    }
}