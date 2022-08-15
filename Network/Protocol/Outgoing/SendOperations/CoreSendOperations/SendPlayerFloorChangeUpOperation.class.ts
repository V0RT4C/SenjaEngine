import map from "Map";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { SendLeftRowMapDescriptionOperation } from "CoreSendOperations/SendLeftRowMapDescriptionOperation.class.ts";
import { SendTopRowMapDescriptionOperation } from "CoreSendOperations/SendTopRowMapDescriptionOperation.class.ts";
import { CLIENT_VIEWPORT, MAP, NETWORK_MESSAGE_SIZES, PROTOCOL_SEND } from "Constants";
import { Player } from "Game/Player/Player.class.ts";
import { IPosition } from "Types";

export class SendPlayerFloorChangeUpOperation implements OutgoingSendOperation {
    constructor(
        private readonly _oldPosition : IPosition,
        private readonly _newPosition : IPosition,
        private readonly _player : Player
    ){}

    public static messageSize = NETWORK_MESSAGE_SIZES.BUFFER_MAXSIZE;

    public static writeToNetworkMessage(oldPosition : IPosition, newPosition : IPosition, player : Player, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.FLOOR_CHANGE_UP);

        //Above surface, going up
        if (newPosition.z === MAP.SEA_FLOOR){
            let skip = -1;

            for (let i = 5; i >= 0; --i){
                skip = map.getFloorDescriptionAsBytes({
                    x: oldPosition.x - CLIENT_VIEWPORT.MAX_X,
                    y: oldPosition.y - CLIENT_VIEWPORT.MAX_Y,
                    z: i
                },
                    (CLIENT_VIEWPORT.MAX_X * 2) + 2,
                    (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
                    8 - i,
                    skip,
                    player,
                    msg
                );
            }

            if (skip >= 0){
                msg.writeUint8(skip);
                msg.writeUint8(0xFF);
            }
        }
        else if (newPosition.z > MAP.SEA_FLOOR) {
            //Underground, going up
            let skip = -1;
            skip = map.getFloorDescriptionAsBytes({
                    x: oldPosition.x - CLIENT_VIEWPORT.MAX_X,
                    y: oldPosition.y - CLIENT_VIEWPORT.MAX_Y,
                    z: oldPosition.z - 3
                },
                (CLIENT_VIEWPORT.MAX_X * 2) + 2,
                (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
                3,
                skip,
                player,
                msg
            );

            if (skip >= 0){
                msg.writeUint8(skip);
                msg.writeUint8(0xFF);
            }
        }

        //When walking up map is out of sync
        //SendTopRowMapDescriptionOperation.writeToNetworkMessage({ x: oldPosition.x, y: newPosition.y + 1, z: oldPosition.z }, msg);
        SendLeftRowMapDescriptionOperation.writeToNetworkMessage({ x: oldPosition.x, y: newPosition.y+2, z: newPosition.z }, player, msg);
        SendTopRowMapDescriptionOperation.writeToNetworkMessage({ x: oldPosition.x, y: newPosition.y+1, z: newPosition.z }, player, msg);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendPlayerFloorChangeUpOperation.messageSize);
        SendPlayerFloorChangeUpOperation.writeToNetworkMessage(this._oldPosition, this._newPosition, this._player, msg);
        await msg.send();
    }
}