import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { SendLeftRowMapDescriptionOperation } from "CoreSendOperations/SendLeftRowMapDescriptionOperation.class.ts";
import { SendTopRowMapDescriptionOperation } from "CoreSendOperations/SendTopRowMapDescriptionOperation.class.ts";
import { TCP } from 'Dependencies';
import { CLIENT_VIEWPORT, MAP, NETWORK_MESSAGE_SIZES, PROTOCOL_SEND } from "Constants";
import { IPosition } from "Types";
import map from "Map";

export class SendPlayerFloorChangeUpOperation implements OutgoingSendOperation {
    constructor(
        private readonly _oldPosition : IPosition,
        private readonly _newPosition : IPosition,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = NETWORK_MESSAGE_SIZES.BUFFER_MAXSIZE;

    public static writeToNetworkMessage(oldPosition : IPosition, newPosition : IPosition, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.FLOOR_CHANGE_UP);

        //Above surface, going up
        if (newPosition.z === MAP.SEA_FLOOR){
            let skip = -1;

            for (let i = 5; i >= 0; i--){
                skip = map.getFloorDescriptionAsBytes({
                    x: oldPosition.x - CLIENT_VIEWPORT.MAX_X,
                    y: oldPosition.y - CLIENT_VIEWPORT.MAX_Y,
                    z: i
                },
                    (CLIENT_VIEWPORT.MAX_X * 2) + 2,
                    (CLIENT_VIEWPORT.MAX_Y * 2) + 2,
                    8 - i,
                    skip,
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
                msg
            );

            if (skip >= 0){
                msg.writeUint8(skip);
                msg.writeUint8(0xFF);
            }
        }

        //When walking up map is out of sync
        SendTopRowMapDescriptionOperation.writeToNetworkMessage({ x: oldPosition.x, y: newPosition.y + 1, z: oldPosition.z }, msg);
        SendTopRowMapDescriptionOperation.writeToNetworkMessage({ x: oldPosition.x, y: newPosition.y, z: oldPosition.z }, msg);
        SendLeftRowMapDescriptionOperation.writeToNetworkMessage({ x: oldPosition.x - 1, y: newPosition.y, z: oldPosition.z }, msg);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendPlayerFloorChangeUpOperation.messageSize);
        SendPlayerFloorChangeUpOperation.writeToNetworkMessage(this._oldPosition, this._newPosition, msg);
        await msg.send();
    }
}