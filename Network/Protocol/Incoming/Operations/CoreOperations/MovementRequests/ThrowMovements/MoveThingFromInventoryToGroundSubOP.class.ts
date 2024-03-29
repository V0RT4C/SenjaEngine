import log from 'Logger';
import map from "Map";
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { AddThingToMapOP } from "CoreSendOperations/AddThingToMapOP.class.ts";
import { SendDeleteFromInventoryOperation } from "CoreSendOperations/SendDeleteFromInventoryOperation.class.ts";
import { SendDeleteFromContainerOperation } from "CoreSendOperations/SendDeleteFromContainerOperation.class.ts";
import { MapTile } from "MapTile";
import { Container } from "Game/Container.class.ts";
import { Item } from "Item";
import { INVENTORY_SLOT } from "Constants";
import { IPosition } from "Types";
import players from 'Game/Player/Players.class.ts';



export class MoveThingFromInventoryToGroundSubOP extends IncomingGameOperation {
    constructor(
        protected _msg : IncomingNetworkMessage,
        private _fromPosition : IPosition,
        private _toPosition : IPosition,
        private _stackPos : number,
        private _thingId : number,
        private _count : number
    ) { super(_msg); }

    private _containerId! : INVENTORY_SLOT;
    private _container! : Container;
    private _slotId! : number;
    private _fromInventory = false;

    protected _internalOperations() : boolean {
        log.debug('MoveThingFromInventoryToGroundSubOP');
        if (this._fromPosition.x === 0xFFFF && this._toPosition.x !== 0xFFFF){

            if(0x40 & this._fromPosition.y) {
                this._containerId = (this._fromPosition.y & 0x0F);
            }
            else {
                this._fromInventory = true;
                this._containerId = this._fromPosition.y;

                if (this._containerId > 11) {
                    //Not an inventory slot
                    log.debug('Not from inventory')
                    return false;
                }

                if (this._containerId == 0) {
                    //Special condition, player drops an item to the "capacity window" when the inventory is minimized,
                    //we should add this item to the most appropriate slot/container
                    return false;
                }
            }

            this._slotId = this._fromPosition.z;
            return this._playerMoveThingFromInventoryToGround();
        }else{
            return false;
        }
    }

    protected async _networkOperations() : Promise<boolean> {

        if (this._fromInventory){
            const sendDeleteFromInventoryOp = new SendDeleteFromInventoryOperation(this._containerId, this._player.client);
            await sendDeleteFromInventoryOp.execute();
        }else{
            //From container
            const fromContainerSpectators = players.getPlayersFromIds(this._container.getPlayerSpectatorIds());

            for (const p of fromContainerSpectators){
                if (p.containerIsOpen(this._container)){
                    const containerId = p.getContainerIdByContainer(this._container);
                    const deleteFromContainerOp = new SendDeleteFromContainerOperation(containerId, this._slotId, p.client);
                    await deleteFromContainerOp.execute();
                }
            }
        }

        const addThingToMapOp = new AddThingToMapOP(this._thingId, this._toPosition);
        await addThingToMapOp.execute();
        return true;
    }

    protected _playerMoveThingFromInventoryToGround() : boolean {
        //Remove from player inventory
        let item : Item | null;

        if (this._fromInventory){
            item = this._player.inventory.getItemAndRemoveFromInventory(this._containerId);
        }else{
            //From container
            const container : Container | null = this._player.getContainerById(this._containerId);

            if (container === null){
                return false;
            }

            this._container = container;

            item = container.removeItemBySlotId(this._slotId);
        }

        if (item === null){
            return false;
        }

        const toTile : MapTile | null = map.getTileAt(this._toPosition);
        if (toTile === null){
            return false;
        }

        toTile.addDownThing(item);
        item.onMove();
        this._player.closeDistantContainers();
        return true;
    }
}