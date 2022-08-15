import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { CLIENT_VIEWPORT, PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";
import map from "Map";
import { Player } from "../../../../../Game/Player/Player.class.ts";

export class SendLeftRowMapDescriptionOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _player : Player
    ){}

    public static messageSize = 2500;

    public static writeToNetworkMessage(position: IPosition, player : Player, msg : OutgoingNetworkMessage, custom = false){
        msg.writeUint8(PROTOCOL_SEND.MAP_WEST_ROW);

        const { x, y, z } = position;

        map.getMapDescriptionAsBytes({
                x: custom ? x : x - CLIENT_VIEWPORT.MAX_X,
                y: custom ? y : y - CLIENT_VIEWPORT.MAX_Y,
                z
            },
            1,
            (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
            player,
            msg
        );
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendLeftRowMapDescriptionOperation.messageSize);
        SendLeftRowMapDescriptionOperation.writeToNetworkMessage(this._position, this._player, msg);
        await msg.send();
    }
}