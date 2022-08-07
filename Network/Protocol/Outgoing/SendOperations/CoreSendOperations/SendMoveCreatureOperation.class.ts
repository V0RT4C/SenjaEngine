import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { SendRemoveCreatureFromTileOperation } from "CoreSendOperations/SendRemoveCreatureFromTileOperation.class.ts";
import { SendMoveCreatureByStackPosOperation } from "CoreSendOperations/SendMoveCreatureByStackPosOperation.class.ts";
import { SendMoveCreatureByExtIdOperation } from "CoreSendOperations/SendMoveCreatureByExtIdOperation.class.ts";
import { SendTopRowMapDescriptionOperation } from "CoreSendOperations/SendTopRowMapDescriptionOperation.class.ts";
import { SendBottomRowMapDescriptionOperation } from "CoreSendOperations/SendBottomRowMapDescriptionOperation.class.ts";
import { SendLeftRowMapDescriptionOperation } from "CoreSendOperations/SendLeftRowMapDescriptionOperation.class.ts";
import { SendRightRowMapDescriptionOperation } from "CoreSendOperations/SendRightRowMapDescriptionOperation.class.ts";

import players from "Game/Player/Players.class.ts";

import { Creature } from "Creature";
import { IPosition } from "Types";
import { NETWORK_MESSAGE_SIZES } from "Constants";
import { SendPlayerFloorChangeUpOperation } from "CoreSendOperations/SendPlayerFloorChangeUpOperation.class.ts";
import { SendPlayerFloorChangeDownOperation } from "./SendPlayerFloorChangeDownOperation.class.ts";
import { AddCreatureToMapOP } from "./AddCreatureToMapOP.class.ts";

export class SendMoveCreatureOperation implements OutgoingSendOperation {
    constructor(
        private readonly _creature : Creature,
        private readonly _oldPosition : IPosition,
        private readonly _newPosition : IPosition,
        private readonly _oldStackPosition : number
    ){}

    public async execute(){
        const spectators = players.getPlayersInAwareRange(this._oldPosition, this._newPosition);

        for (const player of spectators){
            if (!player.client.isOpen){ continue; }
            
            const msg = OutgoingNetworkMessage.withClient(player.client, NETWORK_MESSAGE_SIZES.BUFFER_MAXSIZE);

            if (player === this._creature){
                //If teleport
                //  TODO
                //

                if ((this._oldPosition.z === 7 && this._newPosition.z >= 8)){
                    const removeOp = new SendRemoveCreatureFromTileOperation(this._oldPosition, this._oldStackPosition, this._creature);
                    removeOp.execute();
                }
                else if (this._oldPosition.z === 8 && this._newPosition.z === 7){
                    AddCreatureToMapOP.writeToNetworkMessage(this._creature, msg);
                }
                else{
                    if (this._oldStackPosition < 10){
                        SendMoveCreatureByStackPosOperation.writeToNetworkMessage(this._oldPosition, this._oldStackPosition, msg);
                        msg.writePosition(this._newPosition);
                    }else{
                        SendMoveCreatureByExtIdOperation.writeToNetworkMessage(this._newPosition, this._creature.extId, msg);
                    }

                }

                if (this._newPosition.z > this._oldPosition.z){
                    const op = new SendPlayerFloorChangeDownOperation(this._oldPosition, this._newPosition, player.client);
                    await op.execute();
                }
                else if (this._newPosition.z < this._oldPosition.z){
                    const op = new SendPlayerFloorChangeUpOperation(this._oldPosition, this._newPosition, player.client);
                    await op.execute();
                }

                if (this._oldPosition.y > this._newPosition.y){
                    const position = { x: this._oldPosition.x, y: this._newPosition.y, z: this._newPosition.z };
                    const op = new SendTopRowMapDescriptionOperation(position, player.client);
                    await op.execute();
                }
                else if (this._oldPosition.y < this._newPosition.y){
                    const position = { x: this._oldPosition.x, y: this._newPosition.y, z: this._newPosition.z };
                    const op = new SendBottomRowMapDescriptionOperation(position, player.client);
                    await op.execute();
                }

                if (this._oldPosition.x < this._newPosition.x){
                    const op = new SendRightRowMapDescriptionOperation(this._newPosition, player.client);
                    await op.execute();
                }
                else if (this._oldPosition.x > this._newPosition.x){
                    const op = new SendLeftRowMapDescriptionOperation(this._newPosition, player.client);
                    await op.execute();
                }
            }
            else if (player.canSee(this._oldPosition) && player.canSee(this._newPosition)){
                if (this._oldPosition.z === 7 && this._newPosition.z >= 8){
                    SendRemoveCreatureFromTileOperation.writeToNetworkMessage(this._oldPosition, this._oldStackPosition, this._creature, msg);
                    AddCreatureToMapOP.writeToNetworkMessage(this._creature, msg);
                }else{
                    if (this._oldStackPosition < 10){
                        SendMoveCreatureByStackPosOperation.writeToNetworkMessage(this._oldPosition, this._oldStackPosition, msg);
                        msg.writePosition(this._newPosition);
                    }else{
                        SendMoveCreatureByExtIdOperation.writeToNetworkMessage(this._newPosition, this._creature.extId, msg);
                    }

                }
            }
            else if (player.canSee(this._oldPosition)) {
                SendRemoveCreatureFromTileOperation.writeToNetworkMessage(this._oldPosition, this._oldStackPosition, this._creature, msg);
            }
            else if (player.canSee(this._newPosition)){
                AddCreatureToMapOP.writeToNetworkMessage(this._creature, msg);
            }

            await msg.send();
        }
    }
}