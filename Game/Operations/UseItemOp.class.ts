import log from 'Logger';
import map from "Map";
import rawItems from "RawItems";
import { GameOperation } from '../GameOperation.abstract.ts';
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendCloseContainerOperation } from "CoreSendOperations/SendCloseContainerOperation.class.ts";
import { SendOpenContainerOperation } from "CoreSendOperations/SendOpenContainerOperation.class.ts";
import { SendCancelMessageOperation } from "CoreSendOperations/SendCancelMessageOperation.class.ts";
import { MapTile } from "MapTile";
import { Thing } from "Thing";
import { Container } from "Game/Container.class.ts";
import { IPosition } from "Types";
import { TCP } from 'Dependencies';
import { Player } from '../Player/Player.class.ts';
import { Item } from 'Game/Item.class.ts';
import { RETURN_MESSAGE } from '../../Constants/Game.const.ts';

export class UseItemOP extends GameOperation {
    constructor(protected readonly _player : Player, item : Item){
        super();

        if (item !== undefined){
            this._position = item.position;
            this._itemId = item.thingId;
            this._stackPosition = item.getStackPosition();
        }
    }

    protected _position! : IPosition;
    protected _itemId! : number;
    protected _rawItem! : any;
    protected _stackPosition! : number;
    protected _index! : number;
    protected _containerId! : number;
    protected _useItemInInventory = false;
    protected _itemIsContainer = false;
    protected _closeContainer = false;
    protected _cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;


    protected _internalOperations(): boolean {
        log.debug('UseItemOP');
        log.debug({ pos: this._position, itemId: this._itemId, stackPos: this._stackPosition, index: this._index });
        this._rawItem = rawItems.getItemById(this._itemId);
        const { x, y, z } = this._position;

        if (x === 0xFFFF){
            if (y & 0x40){
                this._containerId = (y & 0x0F);
                log.debug(`Use item in container id: ${this._containerId}. Slot: ${z}`);
                return this._playerUseItemInContainer();
            }else{
                this._containerId = y;
                this._useItemInInventory = true;
                log.debug(`Use item in inventory. Slot: ${this._containerId}.`);
                return this._playerUseItemInInventory();
            }
        }else{
            log.debug(`Use item on ground.`);
            return this._playerUseItemOnGround();
        }
    }

    protected async _networkOperations(): Promise<boolean> {
        if (this._itemIsContainer){
            if (this._closeContainer){
                const closeContainerOp = new SendCloseContainerOperation(this._containerId, this._player.client);
                await closeContainerOp.execute();
                log.debug('Close container');
            }else{
                const container = this._player.getContainerById(this._containerId);
                const msg = OutgoingNetworkMessage.withClient(this._player.client as TCP.Client, SendOpenContainerOperation.messageSize);
                SendOpenContainerOperation.writeToNetworkMessage(container as Container, this._player, msg);
                await msg.send();
            }
        }else{
            const cancelMsg = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsg.execute();
        }
        return true;
    }

    protected _playerUseItemOnGround(){
        if (
            Math.abs(this._player.position.x - this._position.x) > 1 ||
            Math.abs(this._player.position.y - this._position.y) > 1 ||
            this._player.position.z !== this._position.z
        ){
            log.debug(`Player is too far away.`);
            this._cancelMessage = RETURN_MESSAGE.TOO_FAR_AWAY;
            return true;
        }

        if (this._rawItem !== null && this._rawItem.group === 'container'){
            this._itemIsContainer = true;
            log.debug('Open container');
            const tile : MapTile | null = map.getTileAt(this._position);

            if (tile === null){
                return false;
            }

            const item : Thing | null = tile.getThingByStackPos(this._stackPosition);

            if (item === null || item.thingId !== this._itemId){
                return false;
            }

            const openSuccess = this._player.addOpenContainer(item as Container);
            log.debug('Player opened container');
            this._containerId = (item as Container).getContainerId(this._player);

            if (!openSuccess){
                //If not open success then container is already open
                //We close it
                this._closeContainer = true;
                this._player.closeContainerById(this._containerId);
            }

            return true;
        }else{
            this._cancelMessage = RETURN_MESSAGE.CANNOT_USE_THIS_OBJECT;
            return false;
        }
    }

    protected _playerUseItemInInventory(){
        if (this._rawItem !== null && this._rawItem.group === 'container'){
            log.debug('Item being used is a container.');
            this._itemIsContainer = true;
            const item = this._player.inventory.getItemReferenceFromInventory(this._containerId);
            const openSuccess = this._player.addOpenContainer(item as Container);
            this._containerId = (item as Container).getContainerId(this._player);

            if (!openSuccess){
                this._closeContainer = true;
                this._player.closeContainerById(this._containerId);
            }

            return true;
        }else{
            log.debug('Item being used is not a container.');
        }
        return false;
    }

    protected _playerUseItemInContainer(){
        if (this._rawItem !== null && this._rawItem.group === 'container'){
            const container : Container | null = this._player.getContainerById(this._containerId);
            
            if (container === null){
                log.debug(`Container not found`);
                this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
                return true;
            }
            
            const itemBeingUsed : Item | null = container.getItemBySlotId(this._position.z);
            
            if (itemBeingUsed === null){
                log.debug(`No item found at container id ${this._containerId}, slot ${this._position.z}`);
                this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
                return true;
            }
            
            if (itemBeingUsed.rawItem !== null && itemBeingUsed.rawItem.group === 'container'){
                log.debug('Item being used is a container.');
                this._itemIsContainer = true;
                const openSuccess = this._player.addOpenContainer(itemBeingUsed as Container);
                this._containerId = (itemBeingUsed as Container).getContainerId(this._player);
                console.log(this._containerId);
                console.log(openSuccess);
                if (!openSuccess){
                    this._closeContainer = true;
                    this._player.closeContainerById(this._containerId);
                }

                return true;
            }else{
                log.debug('Item being used is not a container.');
            }

            return false;
        }else{
            log.debug('Item being used is not a container.');
            return false;
        }
    }
}