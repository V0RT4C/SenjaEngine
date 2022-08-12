import log from 'Logger';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { INVENTORY_SLOT } from "../../../../Constants/Player.const.ts";
import { Player } from "../../../Player/Player.class.ts";
import { Item } from '../../../Item.class.ts';
import { OutgoingNetworkMessage } from '../../../../Network/Lib/OutgoingNetworkMessage.class.ts';
import { SendDeleteFromInventoryOperation } from '../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendDeleteFromInventoryOperation.class.ts';
import { SendUpdateInventoryOperation } from '../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendUpdateInventoryOperation.class.ts';

export class MoveItemFromInventorySlotToInventorySlot extends GameOperation {
    constructor(
        private readonly _player : Player,
        private readonly _fromInventorySlot : INVENTORY_SLOT,
        private readonly _toInventorySlot : INVENTORY_SLOT
    ){super();}

    private _fromInventorySlotItemId! : number;
    private _toInventorySlotItemId : number | undefined;

    protected _internalOperations(): void {
        log.debug(`MoveItemFromInventorySlotToInventorySlotOp`);
        this._playerMoveItemFromInventorySlotToInventorySlot();
    }

    protected async _networkOperations(): Promise<void> {
        const msg = OutgoingNetworkMessage.withClient(this._player.client);
        SendUpdateInventoryOperation.writeToNetworkMessage(this._toInventorySlot, this._fromInventorySlotItemId, msg);

        if (this._toInventorySlotItemId !== undefined){
            SendUpdateInventoryOperation.writeToNetworkMessage(this._fromInventorySlot, this._toInventorySlotItemId, msg);
        }

        await msg.send();
    }

    protected _playerMoveItemFromInventorySlotToInventorySlot(){
        const itemAtFromSlot : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._fromInventorySlot);
        const itemAtToSlot : Item | null = this._player.inventory.getItemAndRemoveFromInventory(this._toInventorySlot);

        if (itemAtFromSlot !== null){
            this._fromInventorySlotItemId = itemAtFromSlot.thingId;
            this._player.inventory.addItem(itemAtFromSlot, this._toInventorySlot);
        }

        if (itemAtToSlot !== null){
            this._toInventorySlotItemId = itemAtToSlot.thingId;
            this._player.inventory.addItem(itemAtToSlot, this._fromInventorySlot);
        }

        return;
    }
}