import log from 'Logger';
import map from "Game/Map/Map.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { MapTile } from "Game/Map/MapTile.class.ts";
import { Player } from "Game/Player/Player.class.ts";
import { IPosition } from "Types";
import { RETURN_MESSAGE } from 'Constants/Game.const.ts';
import { Item } from 'Game/Item.class.ts';
import { stringifyPosition } from 'Game/Lib/string.lib.ts';
import { AddThingToMapOP } from 'CoreSendOperations/AddThingToMapOP.class.ts';
import { SendUpdateInventoryOperation } from 'CoreSendOperations/SendUpdateInventoryOperation.class.ts';
import { SendRemoveThingFromTileOperation } from 'CoreSendOperations/SendRemoveThingFromTileOperation.class.ts';
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';

export class MoveItemFromGroundToInventorySlot extends GameOperation {
    constructor(
        private readonly _player : Player,
        private readonly _fromPosition : IPosition,
        private readonly _stackPosition : number,
        private readonly _toSlotId : number
    ){ super(); }

    private _cancelMessage : RETURN_MESSAGE | undefined;
    private _itemMovedToGroundId : number | undefined;
    private _itemMovedToInventoryId! : number;

    protected _internalOperations(): void  {
        log.debug('MoveItemFromGroundToInventorySlotOp');
        
        if (this._toSlotId > 11) {
            //Not an inventory slot
            this._cancelMessage = RETURN_MESSAGE.THERE_IS_NO_WAY;
            return;
        }

        if (this._toSlotId == 0) {
            //Special condition, player drops an item to the "capacity window" when the inventory is minimized,
            //we should add this item to the most appropriate slot/container
            this._cancelMessage = RETURN_MESSAGE.THERE_IS_NO_WAY;
            return
        }

        return this._playerMoveThingFromGroundToInventory();
    }

    protected async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined){
            const removeThingFromMapMessage = new SendRemoveThingFromTileOperation(this._fromPosition, this._stackPosition);
            await removeThingFromMapMessage.execute();
    
            const updateInventoryMessage = new SendUpdateInventoryOperation(this._toSlotId, this._itemMovedToInventoryId, this._player.client);
            await updateInventoryMessage.execute();
    
            if (this._itemMovedToGroundId !== undefined){
                const op = new AddThingToMapOP(this._itemMovedToGroundId, this._fromPosition);
                await op.execute();
            }
        }else{
            const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsgOp.execute();
        }
    }

    protected _playerMoveThingFromGroundToInventory() : void {
        if (!this._player.canReach(this._fromPosition)){
            this._cancelMessage = RETURN_MESSAGE.TOO_FAR_AWAY;
            return;
        }
        
        const fromTile : MapTile | null = map.getTileAt(this._fromPosition);

        if (fromTile === null){
            log.warning(`[MoveItemFromGroundToInventoryOp] - fromTile at ${stringifyPosition(this._fromPosition)} is null`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        if (fromTile.getTopDownThing() === null){
            this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
            return;
        }
        else {
            const topThing : Item = fromTile.getTopDownThing() as Item;
            if (!topThing.isPickupable()){
                this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
                return;
            }
        }

        const item : Item | null = fromTile.getThingByStackPos(this._stackPosition) as Item;

        if (item === null){
            log.warning(`[MoveItemFromGroundToInventoryOp] - No thing found at stackPosition ${this._stackPosition}, Position: ${stringifyPosition(this._fromPosition)}`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        if (!item.isItem()){
            this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
            return;
        }

        const removeSuccess = fromTile.removeDownThingByThing(item);
        if (!removeSuccess){
            log.warning(`[MoveItemFromGroundToInventoryOp] - Failed to remove item from tile at position ${stringifyPosition(this._fromPosition)}`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        const itemAtInventorySpot : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._toSlotId);
        
        if (this._player.inventory.addItem(item as Item, this._toSlotId)){
            item.onMove();
            this._itemMovedToInventoryId = item.thingId;

            if (itemAtInventorySpot !== null){
                //Ok, now we need to add item that was at the inventory spot to ground
                fromTile.addDownThing(itemAtInventorySpot);
                itemAtInventorySpot.onMove();
                this._itemMovedToGroundId = itemAtInventorySpot.thingId;
            }

            return;
        }else{
            log.warning(`[MoveItemFromGroundToInventoryOp] - Failed to add item with id: ${item.thingId} to ${this._player.name}'s inventory.`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }
    }
}