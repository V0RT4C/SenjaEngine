import log from 'Logger';
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendCloseContainerOperation } from "CoreSendOperations/SendCloseContainerOperation.class.ts";
import { SendOpenContainerOperation } from "CoreSendOperations/SendOpenContainerOperation.class.ts";
import { SendCancelMessageOperation } from "CoreSendOperations/SendCancelMessageOperation.class.ts";
import { MapTile } from "MapTile";
import { Thing } from "Thing";
import { Container } from "Game/Container.class.ts";
import map from "Map";
import rawItems from "RawItems";

import { IPosition, StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import { TCP } from 'Dependencies';
import { StaticImplements } from "Decorators";

@StaticImplements<StaticOperationCode>()
export class UseItemOP extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.USE_ITEM;

    private _position! : IPosition;
    private _itemId! : number;
    private _rawItem! : any;
    private _stackPosition! : number;
    private _index! : number;
    private _containerId! : number;
    private _useItemInInventory = false;
    private _itemIsContainer = false;
    private _closeContainer = false;

    public parseMessage() {
        this._position = this._msg.readPosition();
        this._itemId = this._msg.readUint16LE();
        this._rawItem = rawItems.getItemById(this._itemId);
        this._stackPosition = this._msg.readUint8();
        this._index = this._msg.readUint8();
        this._msg.seek(this._msg.byteLength);
        log.debug({ pos: this._position, itemId: this._itemId, stackPos: this._stackPosition, index: this._index });
    }

    protected _internalOperations(): boolean {
        log.debug('UseItemOP');
        const { x, y, z } = this._position;

        if (x === 0xFFFF){
            if (y & 0x40){
                this._containerId = (y & 0x0F);
                log.debug(`Use item in container id: ${this._containerId}. Slot: ${z}`);
                return false;
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
                const msg = OutgoingNetworkMessage.withClient(this._msg.client as TCP.Client, SendOpenContainerOperation.messageSize);
                SendOpenContainerOperation.writeToNetworkMessage(container as Container, msg);
                await msg.send();
            }
        }else{
            const cancelMsg = new SendCancelMessageOperation('You cannot use that item.', this._player.client);
            await cancelMsg.execute();
        }
        return true;
    }

    protected _playerUseItemOnGround(){
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
            this._containerId = (item as Container).containerId;

            if (!openSuccess){
                //If not open success then container is already open
                //We close it
                this._closeContainer = true;
                this._player.closeContainerById(this._containerId);
            }

            return true;
        }else{
            return false;
        }
    }

    protected _playerUseItemInInventory(){
        if (this._rawItem !== null && this._rawItem.group === 'container'){
            log.debug('Item being used is a container.');
            this._itemIsContainer = true;
            const item = this._player.inventory.getItemReferenceFromInventory(this._containerId);
            const openSuccess = this._player.addOpenContainer(item as Container);
            this._containerId = (item as Container).containerId;

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

    }
}