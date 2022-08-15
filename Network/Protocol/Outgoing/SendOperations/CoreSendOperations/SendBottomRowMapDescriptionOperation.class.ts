import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import map from "Map";
import { CLIENT_VIEWPORT, PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";
import { Player } from "../../../../../Game/Player/Player.class.ts";

export class SendBottomRowMapDescriptionOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _player : Player
    ){}

    public static messageSize = 3000;

    public static writeToNetworkMessage(position : IPosition, player : Player, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAP_BOTTOM_ROW);

        const { x, y, z } = position;

        map.getMapDescriptionAsBytes({
                x: x - CLIENT_VIEWPORT.MAX_X,
                y: y + (CLIENT_VIEWPORT.MAX_Y + 1),
                z
            },
            (CLIENT_VIEWPORT.MAX_X * 2) + 2,
            1,
            player,
            msg
        );
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendBottomRowMapDescriptionOperation.messageSize);
        SendBottomRowMapDescriptionOperation.writeToNetworkMessage(this._position, this._player, msg);
        await msg.send();
    }
}