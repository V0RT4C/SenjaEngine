import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { CLIENT_VIEWPORT, NETWORK_MESSAGE_SIZES, PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";
import map from "Map";
import { Player } from "../../../../../Game/Player/Player.class.ts";

export class SendFullMapDescriptionOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _player : Player
    ){}

    public static messageSize = NETWORK_MESSAGE_SIZES.BUFFER_MAXSIZE;

    public static writeToNetworkMessage(playerPosition: IPosition, player : Player, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.FULL_MAP);
        msg.writePosition(playerPosition);
        const { x, y, z } = playerPosition;

        map.getMapDescriptionAsBytes({
                x: x - CLIENT_VIEWPORT.MAX_X,
                y: y - CLIENT_VIEWPORT.MAX_Y,
                z
            },
            (CLIENT_VIEWPORT.MAX_X * 2) + 2,
            (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
            player,
            msg
        );
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendFullMapDescriptionOperation.messageSize);
        SendFullMapDescriptionOperation.writeToNetworkMessage(this._position, this._player, msg);
        await msg.send();
    }
}