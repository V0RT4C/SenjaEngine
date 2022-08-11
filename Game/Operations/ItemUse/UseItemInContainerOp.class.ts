import log from 'Logger';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from "Game/Player/Player.class.ts";
import { Container } from 'Game/Container.class.ts';
import { Item } from 'Game/Item.class.ts';
import { RETURN_MESSAGE } from 'Constants/Game.const.ts';
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';
import { SendCloseContainerOperation } from 'CoreSendOperations/SendCloseContainerOperation.class.ts';
import { SendOpenContainerOperation } from 'CoreSendOperations/SendOpenContainerOperation.class.ts';

export class UseItemInContainerOp extends GameOperation {
    constructor(
        private readonly _player : Player,
        private readonly _containerId : number,
        private readonly _slotId : number,
        private readonly _itemId : number
    ){ super();}

    private _cancelMessage : string | undefined;
    private _useItemIsContainer = false;
    private _useContainerId! : number;
    private _closeContainer = false;

    protected _internalOperations(): boolean {
        log.debug(`UseItemInContainerOp`);
        log.debug(`Use item in containerId: ${this._containerId}, slotPosition: ${this._slotId}`);
        return this._playerUseItemInContainer();
    }

    protected async _networkOperations(): Promise<boolean> {
        if (this._cancelMessage === undefined && this._useItemIsContainer){
            if (this._closeContainer){
                const closeContainerOp = new SendCloseContainerOperation(this._useContainerId, this._player.client);
                await closeContainerOp.execute();
                log.debug('Close container');
            }else{
                const container = this._player.getContainerById(this._useContainerId);
                const op = new SendOpenContainerOperation(container as Container, this._player);
                await op.execute();
            }
        }else{
            if (this._cancelMessage){
                const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
                await cancelMsgOp.execute();
            }
        }
        return true;
    }

    protected _playerUseItemInContainer(){
        const container : Container | null = this._player.getContainerById(this._containerId);

        if (container === null){
            log.warning(`[UseItemInContainerOp] - No container with id ${this._containerId} open for player ${this._player.name}`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return true;
        }

        const item : Item | null = container.getItemBySlotId(this._slotId);

        if (item === null){
            log.warning(`[UseItemInContainerOp] - No item at slot id ${this._slotId}`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return true;
        }

        if (item.thingId !== this._itemId){
            log.warning(`[UseItemInContainerOp] - Item at slotId: ${this._slotId} is not the same as the itemId sent as a parameter to the constructor`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return true;
        }

        if (item.isContainer()){
            this._useItemIsContainer = true;
            const openSuccess = this._player.addOpenContainer(item as Container);
            const containerId = (item as Container).getContainerId(this._player);
            this._useContainerId = containerId;
            console.log(containerId);
            if (!openSuccess){
                log.debug(`[UseItemInContainerOp] - Failed to open container. Player: ${this._player.name}. Total containers open: ${this._player.openContainers.length}.`);
                this._closeContainer = true;
                this._player.closeContainerById(containerId);
                return true;
            }else{
                return true;
            }
        }else{
            log.debug(`[UseItemInContainerOp] - Item is not a container`);
            this._cancelMessage = RETURN_MESSAGE.FEATURE_NOT_IMPLEMENTED;
            return true;
        }
    }
}