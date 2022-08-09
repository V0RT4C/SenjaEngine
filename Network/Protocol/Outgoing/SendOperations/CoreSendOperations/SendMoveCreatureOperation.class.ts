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
import { SendWaitWalkOP } from "./SendWaitWalkOP.class.ts";

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
            
            if (player.extId === this._creature.extId){
                const msg = OutgoingNetworkMessage.withClient(player.client, NETWORK_MESSAGE_SIZES.BUFFER_MAXSIZE);
                console.log(player.name + ' Is player.');
                console.log(this._creature.name + ' Is creature')
                //If teleport
                //  TODO
                //

                if ((this._oldPosition.z === 7 && this._newPosition.z >= 8)){
                    const removeOp = new SendRemoveCreatureFromTileOperation(this._oldPosition, this._oldStackPosition, this._creature, player);
                    await removeOp.execute();
                    //AddCreatureToMapOP.writeToNetworkMessage(this._creature, player, msg);
                }
                else if (this._oldPosition.z >= 8 && this._newPosition.z === 7){
                    // const removeOp = new SendRemoveCreatureFromTileOperation(this._oldPosition, this._oldStackPosition, this._creature, player);
                    // await removeOp.execute();
                    AddCreatureToMapOP.writeToNetworkMessage(this._creature, player, msg);
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
                    const op = new SendPlayerFloorChangeDownOperation(this._oldPosition, this._newPosition, player);
                    await op.execute();
                }
                else if (this._newPosition.z < this._oldPosition.z){
                    const op = new SendPlayerFloorChangeUpOperation(this._oldPosition, this._newPosition, player);
                    await op.execute();
                }

                if (this._oldPosition.y > this._newPosition.y){
                    const position = { x: this._oldPosition.x, y: this._newPosition.y, z: this._newPosition.z };
                    const op = new SendTopRowMapDescriptionOperation(position, player);
                    await op.execute();
                }
                else if (this._oldPosition.y < this._newPosition.y){
                    const position = { x: this._oldPosition.x, y: this._newPosition.y, z: this._newPosition.z };
                    const op = new SendBottomRowMapDescriptionOperation(position, player);
                    await op.execute();
                }

                if (this._oldPosition.x < this._newPosition.x){
                    const op = new SendRightRowMapDescriptionOperation(this._newPosition, player);
                    await op.execute();
                }
                else if (this._oldPosition.x > this._newPosition.x){
                    const op = new SendLeftRowMapDescriptionOperation(this._newPosition, player);
                    await op.execute();
                }

                if (player.lastMoveWasDiagonal() || player.lastMoveWasFloorChange()){
                    const ops = new SendWaitWalkOP(player.getCurrentTileStepTimeWithCostsMS(), player.client);
                    await ops.execute();
                }

                await msg.send();
            }
            else {
                const msg = OutgoingNetworkMessage.withClient(player.client, NETWORK_MESSAGE_SIZES.BUFFER_MAXSIZE);
                if (player.canSee(this._oldPosition) && player.canSee(this._newPosition)){
                    console.log(player.name + ' Can see old position and new position')
                    if (this._oldPosition.z === 7 && this._newPosition.z >= 8){
                        const removeOp = new SendRemoveCreatureFromTileOperation(this._oldPosition, this._oldStackPosition, this._creature, player);
                        removeOp.execute();
                        const addOp = new AddCreatureToMapOP(this._creature, player);
                        await addOp.execute();
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
                    console.log(player.name + ' Can see old position')
                    const removeOp = new SendRemoveCreatureFromTileOperation(this._oldPosition, this._oldStackPosition, this._creature, player);
                    removeOp.execute();
                    //SendRemoveCreatureFromTileOperation.writeToNetworkMessage(this._oldPosition, this._oldStackPosition, this._creature, msg);
                }
                else if (player.canSee(this._newPosition)){
                    console.log(player.name + ' Can see new position');
                    const addOp = new AddCreatureToMapOP(this._creature, player);
                    await addOp.execute();
                    //AddCreatureToMapOP.writeToNetworkMessage(this._creature, player, msg);
                }

                await msg.send();
            }
        }
    }
}