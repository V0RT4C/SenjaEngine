import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { CLIENT_VIEWPORT, PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";
import map from "Map";

export class SendLeftRowMapDescriptionOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 2500;

    public static writeToNetworkMessage(position: IPosition, msg : OutgoingNetworkMessage, custom = false){
        msg.writeUint8(PROTOCOL_SEND.MAP_WEST_ROW);

        const { x, y, z } = position;

        map.getMapDescriptionAsBytes({
                x: custom ? x : x - CLIENT_VIEWPORT.MAX_X,
                y: custom ? y : y - CLIENT_VIEWPORT.MAX_Y,
                z
            },
            1,
            (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
            msg
        );
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendLeftRowMapDescriptionOperation.messageSize);
        SendLeftRowMapDescriptionOperation.writeToNetworkMessage(this._position, msg);
        await msg.send();
    }
}