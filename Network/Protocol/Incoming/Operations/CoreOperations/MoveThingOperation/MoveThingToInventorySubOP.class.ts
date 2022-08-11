import log from 'Logger';
import map from "Map";
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendRemoveThingFromTileOperation } from "CoreSendOperations/SendRemoveThingFromTileOperation.class.ts";
import { SendUpdateInventoryOperation } from "CoreSendOperations/SendUpdateInventoryOperation.class.ts";
import { AddThingToMapOP } from "CoreSendOperations/AddThingToMapOP.class.ts";
import { AddThingToContainerOP } from "CoreSendOperations/AddThingToContainerOP.class.ts";
import { TCP } from 'Dependencies';
import { IPosition } from "Types";
import { MapTile } from "MapTile";
import { Thing } from "Thing";
import { Item } from "Item";
import { Container } from "Game/Container.class.ts";
import players from '../../../../../../Game/Player/Players.class.ts';


export class MoveThingToInventorySubOP extends IncomingGameOperation {
    constructor(
        protected _msg : IncomingNetworkMessage,
        private _fromPosition : IPosition,
        private _toPosition : IPosition,
        private _stackPos : number,
        private _thingId : number,
        private _count : number
    ) { super(_msg); }

    private _slotId! : number;
    private _containerId! : number;
    private _container! : Container;
    private _toInventory = false;

    private _itemAddedToGround = false;
    private _itemAddToGroundId : number | undefined;

    protected _internalOperations() : boolean {
        log.debug(`MoveThingToInventorySubOP`);
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
            const toContainerSpectators = players.getPlayersFromIds(this._container.getPlayerSpectatorIds());

            for (const p of toContainerSpectators){
                if (p.containerIsOpen(this._container)){
                    const containerId = p.getContainerIdByContainer(this._container);
                    const addThingToContainerOp = new AddThingToContainerOP(containerId, this._thingId, p.client);
                    await addThingToContainerOp.execute();
                }
            }
        }

        if (this._itemAddedToGround){
            const op = new AddThingToMapOP(this._itemAddToGroundId as number, this._fromPosition);
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
                thing.onMove();

                if (itemAtInventorySpot !== null){
                    //Ok, now we need to add item that was at the inventory spot to ground
                    fromTile.addDownThing(itemAtInventorySpot);
                    itemAtInventorySpot.onMove();
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

            this._container = container;

            if (container.addItem(thing as Item)){
                thing.onMove();
                return true;
            }else{
                return false;
            }
        }
    }
}