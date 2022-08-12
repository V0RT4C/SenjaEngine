import log from 'Logger';
import map from "Game/Map/Map.class.ts";
import { SendDeleteFromInventoryOperation } from "CoreSendOperations/SendDeleteFromInventoryOperation.class.ts";
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';
import { AddThingToMapOP } from "CoreSendOperations/AddThingToMapOP.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from "Game/Player/Player.class.ts";
import { INVENTORY_SLOT } from "Constants/Player.const.ts";
import { RETURN_MESSAGE } from "Constants/Game.const.ts";
import { MapTile } from "Game/Map/MapTile.class.ts";
import { IPosition } from "Types";
import { THING_FLAG } from '../../../../Constants/Things.const.ts';

export class MoveItemFromInventoryToGround extends GameOperation {
    constructor(
        private _player : Player,
        private _fromInventorySlot : INVENTORY_SLOT,
        private _toGroundPosition : IPosition
    ){ super(); }

    private _cancelMessage : string | undefined;
    private _itemId! : number;

    protected _internalOperations(): void {
        log.debug(`MoveItemFromInventoryToGroundOp`);
        this._playerMoveItemFromInventoryToGround();
    }

    protected async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined){
            const sendDeleteFromInventoryOp = new SendDeleteFromInventoryOperation(this._fromInventorySlot, this._player.client);
            await sendDeleteFromInventoryOp.execute();

            const addThingToMapOp = new AddThingToMapOP(this._itemId, this._toGroundPosition);
            await addThingToMapOp.execute();
        }else{
            const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsgOp.execute();
        }
    }

    protected _playerMoveItemFromInventoryToGround(){
        const item = this._player.inventory.getItemReferenceFromInventory(this._fromInventorySlot);

        if (item === null){
            this._cancelMessage = RETURN_MESSAGE.NO_ITEM;
            return;
        }

        let toTile : MapTile | null = map.getTileAt(this._toGroundPosition);

        if (toTile === null){
            this._cancelMessage = RETURN_MESSAGE.THERE_IS_NO_WAY;
            return;
        }

        const deleteInventorySuccess = this._player.inventory.deleteItemFromInventory(this._fromInventorySlot);

        if (!deleteInventorySuccess){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        if (toTile.isFloorChange()){
            let toPosition : IPosition = { ...this._toGroundPosition };

            if (toTile.hasFlag(THING_FLAG.FLOOR_CHANGE_DOWN)){
                toPosition.y++;
                toPosition.z++;
            }
            else if (toTile.hasFlag(THING_FLAG.FLOOR_CHANGE_UP_NORTH)){
                toPosition.y--;
                toPosition.z--;
            }

            toTile = map.getTileAt(toPosition);

            if (toTile === null){
                this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
                return;
            }else{
                this._toGroundPosition = toPosition;
            }
        }


        toTile.addDownThing(item);
        item.onMove();
        this._player.closeDistantContainers();

        this._itemId = item.thingId;

        return;
    }
}