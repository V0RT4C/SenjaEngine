import log from 'Logger';
import players from 'Game/Player/Players.class.ts';
import { RETURN_MESSAGE } from 'Constants/Game.const.ts';
import { AddThingToContainerOP } from 'CoreSendOperations/AddThingToContainerOP.class.ts';
import { SendDeleteFromInventoryOperation } from 'CoreSendOperations/SendDeleteFromInventoryOperation.class.ts';
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';
import { Container } from 'Game/Container.class.ts';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Item } from 'Game/Item.class.ts';
import { Player } from "Game/Player/Player.class.ts";

export class MoveItemFromInventoryToContainerOp extends GameOperation {
    constructor(
        private _player : Player,
        private _fromInventorySlotId : number,
        private _toContainerId : number
    ){ super(); }

    private _cancelMessage : string | undefined;
    private _toContainer! : Container;
    private _movingItem! : Item;

    protected _internalOperations(): void {
        log.debug(`MoveItemFromInventoryToContainerOp`);
        log.debug(`[MoveItemFromInventoryToContainerOp] - from inventory slotId: ${this._fromInventorySlotId}, to containerId: ${this._toContainerId}`);
        return this._playerMoveItemFromInventoryToContainer();
    }

    protected async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined){
            const deleteFromInventoryOp = new SendDeleteFromInventoryOperation(this._fromInventorySlotId, this._player.client);
            await deleteFromInventoryOp.execute();
    
            const toContainerSpectators = players.getPlayersFromIds(this._toContainer.getPlayerSpectatorIds());
    
            for (const p of toContainerSpectators){
                if (p.containerIsOpen(this._toContainer)){
                    const containerId = p.getContainerIdByContainer(this._toContainer);
                    const addThingToContainerOp = new AddThingToContainerOP(containerId, this._movingItem.thingId, p.client);
                    await addThingToContainerOp.execute();
                }
            }
        }else{
            const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsgOp.execute();
        }
    }

    public _playerMoveItemFromInventoryToContainer() : void {
        const toContainer : Container | null = this._player.getContainerById(this._toContainerId);

        if (toContainer === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        if (toContainer.isFull()){
            this._cancelMessage = RETURN_MESSAGE.CONTAINER_IS_FULL;
            return;
        }

        this._toContainer = toContainer;

        const movingItem : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._fromInventorySlotId);

        if (movingItem === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        if (toContainer.addItem(movingItem)){
            movingItem.onMove();
            this._movingItem = movingItem;
            return;
        }else{
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }
    }
}