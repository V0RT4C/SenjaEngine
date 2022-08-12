import log from 'Logger';
import map from 'Game/Map/Map.class.ts';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from 'Game/Player/Player.class.ts';
import { IPosition } from 'Types';
import { RETURN_MESSAGE } from 'Constants/Game.const.ts';
import { MapTile } from 'Game/Map/MapTile.class.ts';
import { stringifyPosition } from 'Game/Lib/string.lib.ts';
import { Item } from 'Game/Item.class.ts';
import { Container } from '../../Container.class.ts';
import { SendCloseContainerOperation } from 'CoreSendOperations/SendCloseContainerOperation.class.ts';
import { SendOpenContainerOperation } from 'CoreSendOperations/SendOpenContainerOperation.class.ts';
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';

export class UseItemOnGroundOp extends GameOperation {
    constructor(
        private readonly _player : Player,
        private readonly _itemPosition : IPosition,
        private readonly _itemStackPosition : number,
        private readonly _itemId : number
    ){ super(); }

    private _cancelMessage : string | undefined;
    private _useItemId! : number;
    private _closeContainer = false;
    private _useItemIsContainer = false;

    protected _internalOperations(): void {
        log.debug(`UseItemOnGroundOp`);
        return this._playerUseItemOnGround();
    }

    protected async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined && this._useItemIsContainer){
            if (this._closeContainer){
                const closeContainerOp = new SendCloseContainerOperation(this._useItemId, this._player.client);
                await closeContainerOp.execute();
                log.debug('Close container');
            }else{
                const container = this._player.getContainerById(this._useItemId);
                const op = new SendOpenContainerOperation(container as Container, this._player);
                await op.execute();
            }
        }else{
            if (this._cancelMessage){
                const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
                await cancelMsgOp.execute();
            }
        }
    }

    protected _playerUseItemOnGround() : void {
        if (
            Math.abs(this._player.position.x - this._itemPosition.x) > 1 ||
            Math.abs(this._player.position.y - this._itemPosition.y) > 1 ||
            this._player.position.z !== this._itemPosition.z
        ){
            log.debug(`[UseItemOnGroundOp] - Player is too far away.`);
            this._cancelMessage = RETURN_MESSAGE.TOO_FAR_AWAY;
            return;
        }

        const tile : MapTile | null = map.getTileAt(this._itemPosition);

        if (tile === null){
            log.warning(`[UseItemOnGroundOp] - Tile at ${stringifyPosition(this._itemPosition)} is null`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        const item : Item | null = tile.getThingByStackPos(this._itemStackPosition) as Item;

        if (item === null){
            log.warning(`[UseItemOnGroundOp] - Item could not be found on tile at ${stringifyPosition(this._itemPosition)}, stackPosition: ${this._itemStackPosition}`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        if (item.isItem() && item.isContainer()){
            if (item.thingId !== this._itemId){
                log.warning(`[UseItemOnGroundOp] - Item found at stackPosition ${this._itemStackPosition}, is not the same id as the itemId passed in the constructor.`);
                this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
                return;
            }

            this._useItemIsContainer = true;
            const openSuccess = this._player.addOpenContainer(item as Container);
            const containerId = (item as Container).getContainerId(this._player);
            this._useItemId = containerId;

            if (containerId === -1){
                log.warning(`[UseItemInInventorySlotOp] - Container not found or is not an open container for player: ${this._player.name}`);
                this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
                return;
            }

            if (!openSuccess){
                log.debug(`[UseItemInInventorySlotOp] - Closing containerId: ${this._useItemId}`);
                this._closeContainer = true;
                this._player.closeContainerById(containerId);
                return;
            }else{
                return;
            }
        }else{
            log.debug(`[UseItemOnGroundOp] - Item is not a container`);
            this._cancelMessage = RETURN_MESSAGE.FEATURE_NOT_IMPLEMENTED;
            return;
        }
    }
}