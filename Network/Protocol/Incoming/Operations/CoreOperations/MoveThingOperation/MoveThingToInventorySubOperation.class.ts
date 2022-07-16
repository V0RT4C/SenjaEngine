import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendRemoveThingFromTileOperation } from "CoreSendOperations/SendRemoveThingFromTileOperation.class.ts";
import { SendUpdateInventoryOperation } from "CoreSendOperations/SendUpdateInventoryOperation.class.ts";
import { SendAddThingToContainerOperation } from "CoreSendOperations/SendAddThingToContainerOperation.class.ts";
import { SendAddThingToMapOperation } from "CoreSendOperations/SendAddThingToMapOperation.class.ts";
import { Player } from "Player";
import { TCP } from 'Dependencies';
import { IPosition } from "Types";
import { MapTile } from "MapTile";
import { Thing } from "Thing";
import { Item } from "Item";
import { Container } from "Game/Container.class.ts";

import players from "Game/Player/Players.class.ts";
import map from "Map";

export class MoveThingToInventorySubOperation extends IncomingGameOperation {
    constructor(
        protected _msg : IncomingNetworkMessage,
        private _fromPosition : IPosition,
        private _toPosition : IPosition,
        private _stackPos : number,
        private _thingId : number,
        private _count : number
    ) { super(_msg); }

    private _player! : Player;
    private _slotId! : number;
    private _containerId! : number;
    private _toInventory = false;

    private _itemAddedToGround = false;
    private _itemAddToGroundId : number | undefined;

    protected _internalOperations() : boolean {
        if (this._toPosition.x === 0xFFFF && this._fromPosition.x !== 0xFFFF) {

            if (0x40 & this._toPosition.y){
                this._containerId = this._toPosition.y & 0x0F;
            }else{
                this._containerId = this._toPosition.y;
                this._toInventory = true;

                if (this._containerId > 11) {
                    //Not an inventory slot
                    return false;
                }

                if (this._containerId == 0) {
                    //Special condition, player drops an item to the "capacity window" when the inventory is minimized,
                    //we should add this item to the most appropriate slot/container
                    return false;
                }
            }


            this._slotId = this._toPosition.z;

            const player : Player | null = players.getPlayerById(this._msg.client?.conn?.rid as number);

            if (player === null){
                return false;
            }
            this._player = player;

            return this._playerMoveThingFromGroundToInventory();
        } else {
            return false;
        }
    }

    protected async _networkOperations() : Promise<boolean> {
        const removeThingFromMapMessage = new SendRemoveThingFromTileOperation(this._fromPosition, this._stackPos);
        await removeThingFromMapMessage.execute();

        if (this._toInventory){
            const updateInventoryMessage = new SendUpdateInventoryOperation(this._containerId, this._thingId, this._msg.client as TCP.Client);
            await updateInventoryMessage.execute();
        }else{
            //To container
            const msg = OutgoingNetworkMessage.withClient(this._player.client, SendAddThingToContainerOperation.messageSize);
            SendAddThingToContainerOperation.writeToNetworkMessage(this._containerId, this._thingId, msg);
            await msg.send();
        }

        if (this._itemAddedToGround){
            const op = new SendAddThingToMapOperation(this._itemAddToGroundId as number, this._fromPosition);
            await op.execute();
        }

        return true;
    }

    protected _playerMoveThingFromGroundToInventory() : boolean {
        const fromTile : MapTile | null = map.getTileAt(this._fromPosition);

        if (fromTile === null){
            return false;
        }

        const thing : Thing | null = fromTile.getThingByStackPos(this._stackPos);

        if (thing === null){
            return false;
        }

        const removeSuccess = fromTile.removeDownThingByThing(thing);
        if (!removeSuccess){
            return false;
        }

        if (this._toInventory){
            const itemAtInventorySpot : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._containerId);

            if (this._player.inventory.addItem(thing as Item, this._containerId)){

                if (itemAtInventorySpot !== null){
                    //Ok, now we need to add item that was at the inventory spot to ground
                    fromTile.addDownThing(itemAtInventorySpot);
                    this._itemAddedToGround = true;
                    this._itemAddToGroundId = itemAtInventorySpot.thingId;
                }

                return true;
            }else{
                return false;
            }
        }else{
            //Add item to container
            const container : Container | null = this._player.getContainerById(this._containerId);

            if (container === null){
                return false;
            }

            if (container.addItem(thing as Item)){
                return true;
            }else{
                return false;
            }
        }
    }
}