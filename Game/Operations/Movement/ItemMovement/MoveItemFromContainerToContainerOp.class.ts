import log from 'Logger';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from "Game/Player/Player.class.ts";
import { Container } from 'Game/Container.class.ts';
import { RETURN_MESSAGE } from 'Constants/Game.const.ts';
import players from 'Game/Player/Players.class.ts';
import { SendDeleteFromContainerOperation } from 'CoreSendOperations/SendDeleteFromContainerOperation.class.ts';
import { AddThingToContainerOP } from 'CoreSendOperations/AddThingToContainerOP.class.ts';
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';

export class MoveItemFromContainerToContainerOp extends GameOperation {
    constructor(
        private readonly _player : Player,
        private readonly _fromContainerId : number,
        private readonly _fromContainerSlotId : number,
        private readonly _toContainerId : number
    ){super();}

    private _cancelMessage : string | undefined;
    private _fromContainer! : Container;
    private _toContainer! : Container;
    private _itemId! : number;

    protected _internalOperations(): void {
        log.debug(`MoveItemFromContainerToInventoryOp`);
        this._playerMoveItemFromContainerToContainer();
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
    
            const toContainerSpectators = players.getPlayersFromIds(this._toContainer.getPlayerSpectatorIds());
    
            for (const p of toContainerSpectators){
                if (p.containerIsOpen(this._toContainer)){
                    const containerId = p.getContainerIdByContainer(this._toContainer);
                    const addThingToContainerOp = new AddThingToContainerOP(containerId, this._itemId, p.client);
                    await addThingToContainerOp.execute();
                }
            }
        }else{
            const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsgOp.execute();
        }
    }

    protected _playerMoveItemFromContainerToContainer(){
        const fromContainer : Container | null = this._player.getContainerById(this._fromContainerId);

        if (fromContainer === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        this._fromContainer = fromContainer;

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

        const item = fromContainer.removeItemBySlotId(this._fromContainerSlotId);

        if (item === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        this._itemId = item.thingId;

        const addItemSuccess = toContainer.addItem(item);

        if (!addItemSuccess){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }else{
            return;
        }

    }
}