import log from 'Logger';
import players from "Game/Player/Players.class.ts";
import { SendDeleteFromContainerOperation } from "CoreSendOperations/SendDeleteFromContainerOperation.class.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendUpdateInventoryOperation } from "Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendUpdateInventoryOperation.class.ts";
import { AddThingToContainerOP } from "Network/Protocol/Outgoing/SendOperations/CoreSendOperations/AddThingToContainerOP.class.ts";
import { SendCancelMessageOperation } from "Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendCancelMessageOperation.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from "Game/Player/Player.class.ts";
import { Container } from "Game/Container.class.ts";
import { RETURN_MESSAGE } from "Constants/Game.const.ts";
import { Item } from "Game/Item.class.ts";

export class MoveItemFromContainerToInventorySlotOp extends GameOperation {
    constructor(
        private _player : Player,
        private _fromContainerId : number,
        private _fromContainerSlotId : number,
        private _toInventorySlotId : number
    ){ super(); }

    private _cancelMessage : string | undefined;
    private _fromContainer! : Container;
    private _itemIdAtInventorySlot : number | undefined;
    private _itemIdInContainer! : number;

    protected _internalOperations(): void {
        log.debug(`MoveItemFromContainerToInventorySlotOp`);
        log.debug(`[MoveItemFromContainerToInventorySlotOp] - From containerId: ${this._fromContainerId}, slotId: ${this._fromContainerSlotId}, To inventory slotId: ${this._toInventorySlotId}`);
        return this._playerMoveItemFromContainerToInventorySlot();
    }

    protected async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined){
            const fromContainerSpectators = players.getPlayersFromIds(this._fromContainer.getPlayerSpectatorIds());
            
            for (const p of fromContainerSpectators){
                if (p.containerIsOpen(this._fromContainer)){
                    const containerId = p.getContainerIdByContainer(this._fromContainer);
                    const deleteFromContainerOp = new SendDeleteFromContainerOperation(containerId, this._fromContainerSlotId, p.client);
                    await deleteFromContainerOp.execute();
                }
            }
            
            const msg = OutgoingNetworkMessage.withClient(this._player.client);
            SendUpdateInventoryOperation.writeToNetworkMessage(this._toInventorySlotId, this._itemIdInContainer, msg);
    
            if (this._itemIdAtInventorySlot !== undefined){
                const containerSpectators = players.getPlayersFromIds(this._fromContainer.getPlayerSpectatorIds());
    
                for (const p of containerSpectators){
                    if (p.containerIsOpen(this._fromContainer)){
                        const containerId = p.getContainerIdByContainer(this._fromContainer);
                        const addThingToContainerOp = new AddThingToContainerOP(containerId, this._itemIdAtInventorySlot, p.client);
                        await addThingToContainerOp.execute();
                    }
                }
            }
    
            await msg.send();
        }else{
            const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsgOp.execute();
        }
    }

    public _playerMoveItemFromContainerToInventorySlot(){
        const container : Container | null = this._player.getContainerById(this._fromContainerId);

        if (container === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }
        this._fromContainer = container;

        const itemAtInventorySlot : Item | null = this._player.inventory.getItemReferenceFromInventory(this._toInventorySlotId);

        if (itemAtInventorySlot !== null && this._fromContainer.isFull()){
            this._cancelMessage = RETURN_MESSAGE.CONTAINER_IS_FULL;
            return;
        }

        const itemInContainer = container.removeItemBySlotId(this._fromContainerSlotId);

        if (itemInContainer === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        this._itemIdInContainer = itemInContainer.thingId;

        if (itemAtInventorySlot !== null){
            const containerAddSuccess = container.addItem(itemAtInventorySlot);

            if (!containerAddSuccess){
                log.warning(`[MoveItemFromContainerToInventorySlotOp] - Failed to add item ${itemAtInventorySlot.thingId} to container. Item ${itemAtInventorySlot} was removed from inventorySlot ${this._toInventorySlotId} and not returned to player ${this._player.name}`);
                this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
                return;
            }else{
                itemAtInventorySlot.onMove();
                this._itemIdAtInventorySlot = itemAtInventorySlot.thingId;
            }
        }

        if (this._player.inventory.addItem(itemInContainer, this._toInventorySlotId)){
            itemInContainer.onMove();
            this._itemIdInContainer = itemInContainer.thingId;
            return;
        }else{
            return;
        }
    }
}