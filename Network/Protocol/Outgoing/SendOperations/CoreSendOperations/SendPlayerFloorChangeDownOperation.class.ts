import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import map from "Map";
import { TCP } from 'Dependencies';
import { IPosition } from "Types";
import { CLIENT_VIEWPORT, MAP, NETWORK_MESSAGE_SIZES, PROTOCOL_SEND } from "Constants";
import { SendBottomRowMapDescriptionOperation } from "./SendBottomRowMapDescriptionOperation.class.ts";
import { SendRightRowMapDescriptionOperation } from "./SendRightRowMapDescriptionOperation.class.ts";

export class SendPlayerFloorChangeDownOperation implements OutgoingSendOperation {
    constructor(
        private readonly _oldPosition : IPosition,
        private readonly _newPosition : IPosition,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = NETWORK_MESSAGE_SIZES.BUFFER_MAXSIZE;

    public static writeToNetworkMessage(oldPosition : IPosition, newPosition : IPosition, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.FLOOR_CHANGE_DOWN);

        if (newPosition.z === (MAP.SEA_FLOOR + 1)){
            let skip = -1;

            for (let i=0; i < 3; ++i){
                skip = map.getFloorDescriptionAsBytes({
                    x: oldPosition.x - CLIENT_VIEWPORT.MAX_X,
                    y: oldPosition.y - CLIENT_VIEWPORT.MAX_Y,
                    z: newPosition.z + i
                },
                    (CLIENT_VIEWPORT.MAX_X * 2) + 2,
                    (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
                    -i - 1,
                    skip,
                    msg
                );
            }
            if (skip >= 0){
                msg.writeUint8(skip);
                msg.writeUint8(0xFF);
            }
        }
        else if(newPosition.z > oldPosition.z && newPosition.z > 8 && newPosition.z < 14){
            let skip = -1;
            skip = map.getFloorDescriptionAsBytes({
                    x: oldPosition.x - CLIENT_VIEWPORT.MAX_X,
                    y: oldPosition.y - CLIENT_VIEWPORT.MAX_Y,
                    z: newPosition.z + 2
                },
                (CLIENT_VIEWPORT.MAX_X * 2) + 2,
                (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
                -3,
                skip,
                msg
            );

            if (skip >= 0){
                msg.writeUint8(skip);
                msg.writeUint8(0xFF);
            }
        }


        SendRightRowMapDescriptionOperation.writeToNetworkMessage({ x: oldPosition.x, y: newPosition.y, z: newPosition.z }, msg);
        SendBottomRowMapDescriptionOperation.writeToNetworkMessage({ x: oldPosition.x, y: newPosition.y - 1, z: newPosition.z }, msg);
        // map.getMapDescriptionAsBytes(
        //     {
        //         x: oldPosition.x + (CLIENT_VIEWPORT.MAX_X + 1),
        //         y: oldPosition.y - (CLIENT_VIEWPORT.MAX_Y + 1),
        //         z: newPosition.z
        //     },
        //     1,
        //     (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
        //     msg
        //     );

        // map.getMapDescriptionAsBytes(
        //     {
        //         x: oldPosition.x - (CLIENT_VIEWPORT.MAX_X),
        //         y: oldPosition.y + (CLIENT_VIEWPORT.MAX_Y + 2),
        //         z: newPosition.z
        //     },
        //     (CLIENT_VIEWPORT.MAX_X * 2) + 2,
        //     2,
        //     msg
        // );
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendPlayerFloorChangeDownOperation.messageSize);
        SendPlayerFloorChangeDownOperation.writeToNetworkMessage(this._oldPosition, this._newPosition, msg);
        await msg.send();
    }
}