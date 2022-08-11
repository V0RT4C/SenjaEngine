import log from 'Logger';
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendDeleteFromContainerOperation } from "CoreSendOperations/SendDeleteFromContainerOperation.class.ts";
import { SendUpdateInventoryOperation } from "CoreSendOperations/SendUpdateInventoryOperation.class.ts";
import { SendDeleteFromInventoryOperation } from "CoreSendOperations/SendDeleteFromInventoryOperation.class.ts";
import { AddThingToContainerOP } from "CoreSendOperations/AddThingToContainerOP.class.ts";
import { Item } from "Item";
import { Container } from "Container";
import { IPosition } from "Types";
import players from '../../../../../../Game/Player/Players.class.ts';



export class MoveThingFromInventoryToInventorySubOP extends IncomingGameOperation {
    constructor(
        protected _msg : IncomingNetworkMessage,
        private _fromPosition : IPosition,
        private _toPosition : IPosition,
        private _stackPos : number,
        private _thingId : number,
        private _count : number
    ) { super(_msg); }

    private _fromContainerId! : number;
    private _fromContainer! : Container;
    private _fromSlotId! : number;
    private _fromInventory = false;
    private _toContainerId! : number;
    private _toContainer! : Container;
    private _toSlotId! : number;
    private _toInventory = false;
    private _itemId! : number;
    private _itemIdAtInventorySpot : number | undefined;

    private _moveFromContainerToContainer = false;
    private _moveFromContainerToContainerInContainer = false;
    private _moveFromContainerToInventory = false;
    private _moveFromInventoryToContainer = false;
    private _moveFromInventoryToInventory = false;

    protected _internalOperations() : boolean {
        log.debug('MoveThingFromInventoryToInventorySubOP');
        if (0x40 & this._fromPosition.y){
            this._fromContainerId = this._fromPosition.y & 0x0F;
        }else{
            this._fromContainerId = this._fromPosition.y;
            this._fromInventory = true;
        }

        if (0x40 & this._toPosition.y){
            this._toContainerId = this._toPosition.y & 0x0F;
        }else{
            this._toContainerId = this._toPosition.y;
            this._toInventory = true;
        }

        this._fromSlotId = this._fromPosition.z;
        this._toSlotId = this._toPosition.z;

        log.debug(`From ${!this._fromInventory ? 'Container id: ' : 'Inventory slot: '}${this._fromContainerId}, SlotId: ${this._fromSlotId}`);
        log.debug(`To ${!this._toInventory ? 'Container id: ' : 'Inventory slot: '}${this._toContainerId}, SlotId: ${this._toSlotId}`);
        return this._handlePlayerMoveThing();
    }

    protected async _networkOperations() : Promise<boolean> {
        if (this._moveFromContainerToContainer){
            const fromContainerSpectators = players.getPlayersFromIds(this._fromContainer.getPlayerSpectatorIds());

            for (const p of fromContainerSpectators){
                if (p.containerIsOpen(this._fromContainer)){
                    const containerId = p.getContainerIdByContainer(this._fromContainer);
                    const deleteFromContainerOp = new SendDeleteFromContainerOperation(containerId, this._fromSlotId, p.client);
                    await deleteFromContainerOp.execute();
                }
            }

            const toContainerSpectators = players.getPlayersFromIds(this._toContainer.getPlayerSpectatorIds());

            for (const p of toContainerSpectators){
                if (p.containerIsOpen(this._toContainer)){
                    const containerId = p.getContainerIdByContainer(this._toContainer);
                    const addThingToContainerOp = new AddThingToContainerOP(containerId, this._thingId, p.client);
                    await addThingToContainerOp.execute();
                }
            }
        }
        else if(this._moveFromContainerToInventory){
            const fromContainerSpectators = players.getPlayersFromIds(this._fromContainer.getPlayerSpectatorIds());

            for (const p of fromContainerSpectators){
                if (p.containerIsOpen(this._fromContainer)){
                    const containerId = p.getContainerIdByContainer(this._fromContainer);
                    const deleteFromContainerOp = new SendDeleteFromContainerOperation(containerId, this._fromSlotId, p.client);
                    await deleteFromContainerOp.execute();
                }
            }
            
            const msg = OutgoingNetworkMessage.withClient(this._player.client);
            SendUpdateInventoryOperation.writeToNetworkMessage(this._toContainerId, this._itemId, msg);

            if (this._itemIdAtInventorySpot !== undefined){
                const containerSpectators = players.getPlayersFromIds(this._fromContainer.getPlayerSpectatorIds());

                for (const p of containerSpectators){
                    if (p.containerIsOpen(this._fromContainer)){
                        const containerId = p.getContainerIdByContainer(this._fromContainer);
                        const addThingToContainerOp = new AddThingToContainerOP(containerId, this._itemIdAtInventorySpot, p.client);
                        await addThingToContainerOp.execute();
                    }
                }
            }

            await msg.send();
        }
        else if(this._moveFromInventoryToContainer){
            const deleteFromInventoryOp = new SendDeleteFromInventoryOperation(this._fromContainerId, this._player.client);
            await deleteFromInventoryOp.execute();

            const toContainerSpectators = players.getPlayersFromIds(this._toContainer.getPlayerSpectatorIds());

            for (const p of toContainerSpectators){
                if (p.containerIsOpen(this._toContainer)){
                    const containerId = p.getContainerIdByContainer(this._toContainer);
                    const addThingToContainerOp = new AddThingToContainerOP(containerId, this._itemId, p.client);
                    await addThingToContainerOp.execute();
                }
            }
        }
        else if (this._moveFromInventoryToInventory){
            const msg = OutgoingNetworkMessage.withClient(this._player.client);
            SendDeleteFromInventoryOperation.writeToNetworkMessage(this._fromContainerId, msg);
            SendUpdateInventoryOperation.writeToNetworkMessage(this._toContainerId, this._itemId, msg);

            if (this._itemIdAtInventorySpot !== undefined){
                const containerSpectators = players.getPlayersFromIds(this._fromContainer.getPlayerSpectatorIds());

                for (const p of containerSpectators){
                    if (p.containerIsOpen(this._fromContainer)){
                        const containerId = p.getContainerIdByContainer(this._fromContainer);
                        const addThingToContainerOp = new AddThingToContainerOP(containerId, this._itemIdAtInventorySpot, p.client);
                        await addThingToContainerOp.execute();
                    }
                }
            }

            await msg.send();
        }

        return true;
    }

    protected _handlePlayerMoveThing() : boolean {
        if (this._fromInventory === false && this._toInventory === false){
            return this._playerMoveThingFromContainerToContainer();
        }
        else if (this._fromInventory === false && this._toInventory === true){
            return this._playerMoveThingFromContainerToInventory();
        }
        else if (this._fromInventory === true && this._toInventory === false){
            return this._playerMoveThingFromInventoryToContainer();
        }
        else if (this._fromInventory === true && this._toInventory === true){
            return this._playerMoveThingFromInventoryToInventory();
        }
        else{
            return false;
        }
    }

    protected _playerMoveThingFromContainerToContainer() : boolean {
        //From container to container
        if (this._fromContainerId === this._toContainerId){
            //Just move item in same container to first position (old tibia behaviour)
            this._moveFromContainerToContainer = true;
            const container = this._player.getContainerById(this._fromContainerId);

            if (container === null){
                return false;
            }

            this._fromContainer = container;
            this._toContainer = container;

            if (container.isFull() || (this._toSlotId < this._fromSlotId)){
                return false;
            }

            const item : Item | null = container.getItemBySlotId(this._fromSlotId);

            if (item === null || item === container){
                return false;
            }

            //Check if toSlotId is container
            const toSlotItem : Item | null = container.getItemBySlotId(this._toSlotId);

            const removeItem : Item | null = container.removeItemBySlotId(this._fromSlotId);

            if (removeItem !== item){
                return false;
            }

            if (toSlotItem !== null && toSlotItem.isContainer()){
                log.warning(`Move item to container when dragging item to container in a slot. Not yet implemented.`);
                if ((toSlotItem as Container).isFull()){
                    return false;
                }else{
                    this._toContainer = toSlotItem as Container;
                    (toSlotItem as Container).addItem(item);
                    item.onMove();
                    this._moveFromContainerToContainerInContainer = true;
                    return true;
                }
            }

            if (container.addItem(item)){
                item.onMove();
                return true;
            }else{
                return false;
            }
        }else{
            const fromContainer : Container | null = this._player.getContainerById(this._fromContainerId);

            if (fromContainer === null){
                return false;
            }

            this._fromContainer = fromContainer;

            const toContainer : Container | null = this._player.getContainerById(this._toContainerId);

            if (toContainer === null || toContainer?.isFull() || fromContainer === toContainer){
                return false;
            }

            this._toContainer = toContainer;

            const item = fromContainer.getItemBySlotId(this._fromSlotId);

            if (item === null || item === toContainer){
                return false;
            }

            const removeItem : Item | null = fromContainer.removeItemBySlotId(this._fromSlotId);

            if (removeItem !== item){
                return false;
            }

            if (toContainer.addItem(item)){
                this._moveFromContainerToContainer = true;
                item.onMove();
                return true;
            }else{
                return false;
            }
        }
    }

    protected _playerMoveThingFromContainerToInventory() : boolean {
        const container : Container | null = this._player.getContainerById(this._fromContainerId);

        if (container === null){
            return false;
        }

        this._fromContainer = container;

        const item = container.removeItemBySlotId(this._fromSlotId);

        if (item === null){
            return false;
        }
        const itemAtInventorySpot : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._toContainerId);

        if (itemAtInventorySpot !== null){
            this._itemIdAtInventorySpot = itemAtInventorySpot.thingId;
            container.addItem(itemAtInventorySpot);
        }

        if (this._player.inventory.addItem(item, this._toContainerId)){
            item.onMove();
            this._itemId = item.thingId;
            this._moveFromContainerToInventory = true;
            return true;
        }else{
            return false;
        }
    }

    protected _playerMoveThingFromInventoryToContainer() : boolean {
        const toContainer : Container | null = this._player.getContainerById(this._toContainerId);

        if (toContainer === null || toContainer?.isFull()){
            return false;
        }

        this._toContainer = toContainer;

        const removedItem : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._fromContainerId);

        if (removedItem === null){
            return false;
        }

        if (toContainer.addItem(removedItem)){
            removedItem.onMove();
            this._itemId = removedItem.thingId;
            this._moveFromInventoryToContainer = true;
            return true;
        }else{
            return false;
        }
    }

    protected _playerMoveThingFromInventoryToInventory() : boolean {
        const removedItem1 : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._fromContainerId);

        if (removedItem1 === null){
            return false;
        }

        const removedItem2 : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._toContainerId);

        if (removedItem2 !== null){
            this._itemIdAtInventorySpot = removedItem2.thingId;
            if (!this._player.inventory.addItem(removedItem2, this._fromContainerId)){
                log.warning(`${this._player.name} removed item ${removedItem2} from inventory slot ${this._toContainerId} but something failed when adding it to inventory slot ${this._fromContainerId}`);
                return false;
            }else{
                removedItem2.onMove();
            }
        }


        if (this._player.inventory.addItem(removedItem1, this._toContainerId)){
            this._moveFromInventoryToInventory = true;
            this._itemId = removedItem1.thingId;
            removedItem1.onMove();
            return true;
        }else{
            log.warning(`${this._player.name} removed item ${removedItem1} from inventory slot ${this._fromContainerId} but something failed when adding it to inventory slot ${this._toContainerId}`);
            return false;
        }
    }
}