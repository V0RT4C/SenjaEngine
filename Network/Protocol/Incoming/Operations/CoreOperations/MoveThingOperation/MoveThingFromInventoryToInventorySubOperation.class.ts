import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendDeleteFromContainerOperation } from "CoreSendOperations/SendDeleteFromContainerOperation.class.ts";
import { SendAddThingToContainerOperation } from "CoreSendOperations/SendAddThingToContainerOperation.class.ts";
import { SendUpdateInventoryOperation } from "CoreSendOperations/SendUpdateInventoryOperation.class.ts";
import { SendDeleteFromInventoryOperation } from "CoreSendOperations/SendDeleteFromInventoryOperation.class.ts";

import { Player } from "Player";
import { Container } from "Container";

import players from "Game/Player/Players.class.ts";

import { IPosition } from "Types";
import { Item } from "Item";

export class MoveThingFromInventoryToInventorySubOperation extends IncomingGameOperation {
    constructor(
        protected _msg : IncomingNetworkMessage,
        private _fromPosition : IPosition,
        private _toPosition : IPosition,
        private _stackPos : number,
        private _thingId : number,
        private _count : number
    ) { super(_msg); }

    private _player! : Player;
    private _fromContainerId! : number;
    private _fromSlotId! : number;
    private _fromInventory = false;
    private _toContainerId! : number;
    private _toSlotId! : number;
    private _toInventory = false;
    private _itemId! : number;
    private _itemIdAtInventorySpot : number | undefined;

    private _moveFromContainerToContainer = false;
    private _moveFromContainerToInventory = false;
    private _moveFromInventoryToContainer = false;
    private _moveFromInventoryToInventory = false;

    protected _internalOperations() : boolean {
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

        const player : Player | null = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (player === null){
            return false;
        }

        this._player = player;

        console.log(`From ${!this._fromInventory ? 'Container id: ' : 'Inventory slot: '}${this._fromContainerId}, SlotId: ${this._fromSlotId}`);
        console.log(`To ${!this._toInventory ? 'Container id: ' : 'Inventory slot: '}${this._toContainerId}, SlotId: ${this._toSlotId}`);
        return this._handlePlayerMoveThing();
    }

    protected async _networkOperations() : Promise<boolean> {
        if (this._moveFromContainerToContainer){
            const msg = OutgoingNetworkMessage.withClient(this._player.client);
            SendDeleteFromContainerOperation.writeToNetworkMessage(this._fromContainerId, this._fromSlotId, msg);
            SendAddThingToContainerOperation.writeToNetworkMessage(this._toContainerId, this._thingId, msg);
            await msg.send();
        }
        else if(this._moveFromContainerToInventory){
            const msg = OutgoingNetworkMessage.withClient(this._player.client);
            SendDeleteFromContainerOperation.writeToNetworkMessage(this._fromContainerId, this._fromSlotId, msg);
            SendUpdateInventoryOperation.writeToNetworkMessage(this._toContainerId, this._itemId, msg);

            if (this._itemIdAtInventorySpot !== undefined){
                SendAddThingToContainerOperation.writeToNetworkMessage(this._fromContainerId, this._itemIdAtInventorySpot, msg);
            }

            await msg.send();
        }
        else if(this._moveFromInventoryToContainer){
            const msg = OutgoingNetworkMessage.withClient(this._player.client);
            SendDeleteFromInventoryOperation.writeToNetworkMessage(this._fromContainerId, msg);
            SendAddThingToContainerOperation.writeToNetworkMessage(this._toContainerId, this._itemId, msg);
            await msg.send();
        }
        else if (this._moveFromInventoryToInventory){
            const msg = OutgoingNetworkMessage.withClient(this._player.client);
            SendDeleteFromInventoryOperation.writeToNetworkMessage(this._fromContainerId, msg);
            SendUpdateInventoryOperation.writeToNetworkMessage(this._toContainerId, this._itemId, msg);

            if (this._itemIdAtInventorySpot !== undefined){
                SendUpdateInventoryOperation.writeToNetworkMessage(this._fromContainerId, this._itemIdAtInventorySpot, msg);
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

            if (container.isFull() || (this._toSlotId < this._fromSlotId)){
                return false;
            }

            const item : Item | null = container.removeItemBySlotId(this._fromSlotId);

            if (item === null){
                return false;
            }

            container.addItem(item);
            return true;
        }else{
            const fromContainer : Container | null = this._player.getContainerById(this._fromContainerId);

            if (fromContainer === null){
                return false;
            }

            const toContainer : Container | null = this._player.getContainerById(this._toContainerId);

            if (toContainer === null || toContainer?.isFull()){
                return false;
            }

            const item = fromContainer.removeItemBySlotId(this._fromSlotId);

            if (item === null){
                return false;
            }

            toContainer.addItem(item);
            this._moveFromContainerToContainer = true;
            return true;
        }
    }

    protected _playerMoveThingFromContainerToInventory() : boolean {
        const container : Container | null = this._player.getContainerById(this._fromContainerId);

        if (container === null){
            return false;
        }

        const item = container.removeItemBySlotId(this._fromSlotId);

        if (item === null){
            return false;
        }
        const itemAtInventorySpot : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._toContainerId);

        if (itemAtInventorySpot !== null){
            this._itemIdAtInventorySpot = itemAtInventorySpot.thingId;
            container.addItem(itemAtInventorySpot);
        }

        this._player.inventory.addItem(item, this._toContainerId);
        this._itemId = item.thingId;
        this._moveFromContainerToInventory = true;

        return true;
    }

    protected _playerMoveThingFromInventoryToContainer() : boolean {
        const toContainer : Container | null = this._player.getContainerById(this._toContainerId);

        if (toContainer === null || toContainer?.isFull()){
            return false;
        }

        const removedItem : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._fromContainerId);

        if (removedItem === null){
            return false;
        }

        toContainer.addItem(removedItem);
        this._itemId = removedItem.thingId;
        this._moveFromInventoryToContainer = true;
        return true;
    }

    protected _playerMoveThingFromInventoryToInventory() : boolean {
        const removedItem1 : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._fromContainerId);

        if (removedItem1 === null){
            return false;
        }

        const removedItem2 : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._toContainerId);

        if (removedItem2 !== null){
            this._itemIdAtInventorySpot = removedItem2.thingId;
            this._player.inventory.addItem(removedItem2, this._fromContainerId);
        }

        this._player.inventory.addItem(removedItem1, this._toContainerId);
        this._moveFromInventoryToInventory = true;
        this._itemId = removedItem1.thingId;
        return true;
    }
}