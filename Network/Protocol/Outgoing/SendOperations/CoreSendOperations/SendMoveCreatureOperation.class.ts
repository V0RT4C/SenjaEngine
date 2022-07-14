import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { SendTopRowMapDescriptionOperation } from "OutgoingSendOperations/CoreSendOperations/SendTopRowMapDescriptionOperation.class.ts";
import { SendBottomRowMapDescriptionOperation } from "OutgoingSendOperations/CoreSendOperations/SendBottomRowMapDescriptionOperation.class.ts";
import { SendLeftRowMapDescriptionOperation } from "OutgoingSendOperations/CoreSendOperations/SendLeftRowMapDescriptionOperation.class.ts";
import { SendRightRowMapDescriptionOperation } from "OutgoingSendOperations/CoreSendOperations/SendRightRowMapDescriptionOperation.class.ts";
import { SendMoveCreatureByExtIdOperation } from "OutgoingSendOperations/CoreSendOperations/SendMoveCreatureByExtIdOperation.class.ts";
import { SendRemoveCreatureFromTileOperation } from "OutgoingSendOperations/CoreSendOperations/SendRemoveCreatureFromTileOperation.class.ts";
import { SendMoveCreatureByStackPosOperation } from "OutgoingSendOperations/CoreSendOperations/SendMoveCreatureByStackPosOperation.class.ts";
import { SendAddCreatureToMapOperation } from "OutgoingSendOperations/CoreSendOperations/SendAddCreatureToMapOperation.class.ts";

import players from "Game/Player/Players.class.ts";

import { Creature } from "Creature";
import { IPosition } from "Types";

export class SendMoveCreatureOperation implements OutgoingSendOperation {
    constructor(
        private readonly _creature : Creature,
        private readonly _oldPosition : IPosition,
        private readonly _newPosition : IPosition,
        private readonly _oldStackPosition : number,
        private readonly _newStackPosition : number
    ){}

    public async execute(){
        const spectators = players.getPlayersInAwareRange(this._oldPosition, this._newPosition);

        for (const player of spectators){
            const msg = OutgoingNetworkMessage.withClient(player.client,
                SendRemoveCreatureFromTileOperation.messageSize +
                SendMoveCreatureByStackPosOperation.messageSize +
                SendMoveCreatureByExtIdOperation.messageSize +
                SendTopRowMapDescriptionOperation.messageSize +
                SendBottomRowMapDescriptionOperation.messageSize +
                SendLeftRowMapDescriptionOperation.messageSize +
                SendRightRowMapDescriptionOperation.messageSize +
                SendAddCreatureToMapOperation.messageSize
            );

            if (player === this._creature){
                //If teleport
                //  TODO
                //

                if (this._oldPosition.z === 7 && this._newPosition.z >= 8){
                    SendRemoveCreatureFromTileOperation.writeToNetworkMessage(this._oldPosition, this._oldStackPosition, this._creature, msg);
                }else{
                    if (this._oldStackPosition < 10){
                        SendMoveCreatureByStackPosOperation.writeToNetworkMessage(this._oldPosition, this._oldStackPosition, msg);
                        msg.writePosition(this._newPosition);
                    }else{
                        SendMoveCreatureByExtIdOperation.writeToNetworkMessage(this._newPosition, this._creature.extId, msg);
                    }

                }

                if (this._newPosition.z > this._oldPosition.z){
                    console.log('Move down creature: TODO');
                }
                else if (this._newPosition.z < this._oldPosition.z){
                    console.log('Move up creature: TODO');
                }

                if (this._oldPosition.y > this._newPosition.y){
                    const msg = OutgoingNetworkMessage.withClient(player.client);
                    const position = { x: this._oldPosition.x, y: this._newPosition.y, z: this._newPosition.z };
                    SendTopRowMapDescriptionOperation.writeToNetworkMessage(position, msg);
                    await msg.send();
                }
                else if (this._oldPosition.y < this._newPosition.y){
                    const msg = OutgoingNetworkMessage.withClient(player.client);
                    const position = { x: this._oldPosition.x, y: this._newPosition.y, z: this._newPosition.z };
                    SendBottomRowMapDescriptionOperation.writeToNetworkMessage(position, msg);
                    await msg.send();
                }

                if (this._oldPosition.x < this._newPosition.x){
                    const msg = OutgoingNetworkMessage.withClient(player.client);
                    SendRightRowMapDescriptionOperation.writeToNetworkMessage(this._newPosition, msg);
                    await msg.send();
                }
                else if (this._oldPosition.x > this._newPosition.x){
                    const msg = OutgoingNetworkMessage.withClient(player.client);
                    SendLeftRowMapDescriptionOperation.writeToNetworkMessage(this._newPosition, msg);
                    await msg.send();
                }
            }
            else if (player.canSee(this._oldPosition) && player.canSee(this._newPosition)){
                if (this._oldPosition.z === 7 && this._newPosition.z >= 8){
                    SendRemoveCreatureFromTileOperation.writeToNetworkMessage(this._oldPosition, this._oldStackPosition, this._creature, msg);
                    SendAddCreatureToMapOperation.writeToNetworkMessage(this._creature, msg);
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
                SendAddCreatureToMapOperation.writeToNetworkMessage(this._creature, msg);
            }

            await msg.send();
        }
    }
}