import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { CLIENT_VIEWPORT, PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";
import map from "Map";
import { Player } from "../../../../../Game/Player/Player.class.ts";

export class SendRightRowMapDescriptionOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _player : Player
    ){}

    public static messageSize = 2500;

    public static writeToNetworkMessage(position: IPosition, player : Player, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.MAP_EAST_ROW);

        const { x, y, z } = position;

        map.getMapDescriptionAsBytes({
                x: x + (CLIENT_VIEWPORT.MAX_X + 1),
                y: y - CLIENT_VIEWPORT.MAX_Y,
                z
            },
            1,
            (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
            player,
            msg
        );
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendRightRowMapDescriptionOperation.messageSize);
        SendRightRowMapDescriptionOperation.writeToNetworkMessage(this._position, this._player, msg);
        await msg.send();
    }
}