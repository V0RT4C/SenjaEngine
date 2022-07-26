import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import map from "Map";
import { TCP } from 'Dependencies';
import { CLIENT_VIEWPORT, PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";

export class SendTopRowMapDescriptionOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 3000;

    public static writeToNetworkMessage(position: IPosition, msg : OutgoingNetworkMessage, custom = false){
        msg.writeUint8(PROTOCOL_SEND.MAP_TOP_ROW);

        let { x, y, z } = position;

        if (!custom){
            x = x - CLIENT_VIEWPORT.MAX_X;
            y = y - CLIENT_VIEWPORT.MAX_Y;
        }

        map.getMapDescriptionAsBytes({ x, y, z },
            (CLIENT_VIEWPORT.MAX_X * 2) + 2,
            1,
            msg
        );
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendTopRowMapDescriptionOperation.messageSize);
        SendTopRowMapDescriptionOperation.writeToNetworkMessage(this._position, msg);
        await msg.send();
    }
}