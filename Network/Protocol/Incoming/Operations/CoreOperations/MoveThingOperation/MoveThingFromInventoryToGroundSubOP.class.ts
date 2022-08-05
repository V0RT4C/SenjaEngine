import log from 'Logger';
import map from "Map";
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { AddThingToMapOP } from "CoreSendOperations/AddThingToMapOP.class.ts";
import { SendDeleteFromInventoryOperation } from "CoreSendOperations/SendDeleteFromInventoryOperation.class.ts";
import { SendDeleteFromContainerOperation } from "CoreSendOperations/SendDeleteFromContainerOperation.class.ts";
import { MapTile } from "MapTile";
import { Container } from "Game/Container.class.ts";
import { Item } from "Item";
import { TCP } from 'Dependencies';
import { INVENTORY_SLOT } from "Constants";
import { IPosition } from "Types";



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
    private _slotId! : number;
    private _fromInventory = false;

    protected _internalOperations() : boolean {
        log.debug('MoveThingFromInventoryToGround');
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
        const addThingToMapOp = new AddThingToMapOP(this._thingId, this._toPosition);
        await addThingToMapOp.execute();

        const msg = OutgoingNetworkMessage.withClient(this._msg.client as TCP.Client, Math.max(SendDeleteFromInventoryOperation.messageSize, SendDeleteFromContainerOperation.messageSize));
        if (this._fromInventory){
            SendDeleteFromInventoryOperation.writeToNetworkMessage(this._containerId, msg);
        }else{
            //From container
            SendDeleteFromContainerOperation.writeToNetworkMessage(this._containerId, this._slotId, msg);
        }
        await msg.send();
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
        return true;
    }
}