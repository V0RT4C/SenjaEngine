import log from 'Logger';
import { RETURN_MESSAGE } from 'Constants/Game.const.ts';
import { INVENTORY_SLOT } from "Constants/Player.const.ts";
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';
import { SendCloseContainerOperation } from 'CoreSendOperations/SendCloseContainerOperation.class.ts';
import { SendOpenContainerOperation } from 'CoreSendOperations/SendOpenContainerOperation.class.ts';
import { Container } from 'Game/Container.class.ts';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Item } from "Game/Item.class.ts";
import { Player } from "Game/Player/Player.class.ts";

export class UseItemInInventorySlotOp extends GameOperation {
    constructor(
        private readonly _player : Player,
        private readonly _inventorySlotId : INVENTORY_SLOT
    ){ super(); }

    private _cancelMessage : string | undefined;
    private _closeContainer = false;
    private _useItemIsContainer = false;
    private _useItemId! : number;

    protected _internalOperations(): void {
        log.debug(`UseItemInInventoryOp`);
        log.debug(`Use item in inventory. Slot: ${this._inventorySlotId}.`);
        return this._playerUseItemInInventorySlot();
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

    protected _playerUseItemInInventorySlot(){
        const item : Item | null = this._player.inventory.getItemReferenceFromInventory(this._inventorySlotId);

        if (item === null){
            log.warning(`[UseItemInInventorySlotOp] - Item at inventorySlotId: ${this._inventorySlotId} is null`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        if (item.isContainer()){
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
            log.debug(`[UseItemInInventorySlotOp] - Item is not a container`);
            this._cancelMessage = RETURN_MESSAGE.FEATURE_NOT_IMPLEMENTED;
            return;
        }
    }
}