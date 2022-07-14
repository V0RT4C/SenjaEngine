import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { TCP } from 'Dependencies';
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { CLIENT_VIEWPORT, PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";
import map from "Map";

export class SendBottomRowMapDescriptionOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 3000;

    public static writeToNetworkMessage(position : IPosition, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAP_BOTTOM_ROW);

        const { x, y, z } = position;

        map.getMapDescriptionAsBytes({
                x: x - CLIENT_VIEWPORT.MAX_X,
                y: y + (CLIENT_VIEWPORT.MAX_Y + 1),
                z
            },
            (CLIENT_VIEWPORT.MAX_X * 2) + 2,
            1,
            msg
        );
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendBottomRowMapDescriptionOperation.messageSize);
        SendBottomRowMapDescriptionOperation.writeToNetworkMessage(this._position, msg);
        await msg.send();
    }
}