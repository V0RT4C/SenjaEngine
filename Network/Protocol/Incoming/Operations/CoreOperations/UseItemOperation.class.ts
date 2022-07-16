import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendCloseContainerOperation } from "CoreSendOperations/SendCloseContainerOperation.class.ts";
import { SendOpenContainerOperation } from "CoreSendOperations/SendOpenContainerOperation.class.ts";
import { SendCancelMessageOperation } from "CoreSendOperations/SendCancelMessageOperation.class.ts";
import { MapTile } from "MapTile";
import { Thing } from "Thing";
import { Container } from "Game/Container.class.ts";
import { Player } from "Game/Player/Player.class.ts";

import players from "Game/Player/Players.class.ts";
import map from "Map";

import { IPosition, StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import { TCP } from 'Dependencies';
import { StaticImplements } from "Decorators";

@StaticImplements<StaticOperationCode>()
export class UseItemOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.USE_ITEM;

    private _player! : Player;
    private _position! : IPosition;
    private _itemId! : number;
    private _stackPosition! : number;
    private _index! : number;
    private _containerId! : number;
    private _useItemInInventory = false;
    private _itemIsContainer = false;
    private _closeContainer = false;

    public parseMessage() {
        this._position = this._msg.readPosition();
        this._itemId = this._msg.readUint16LE();
        this._stackPosition = this._msg.readUint8();
        this._index = this._msg.readUint8();
        this._msg.seek(this._msg.byteLength);
        console.log({ pos: this._position, itemId: this._itemId, stackPos: this._stackPosition, index: this._index });
    }

    protected _internalOperations(): boolean {
        const { x, y, z } = this._position;
        const player : Player | null = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (this._player === null){
            return false;
        }

        this._player = player as Player;

        if (x === 0xFFFF){
            if (y & 0x40){
                this._containerId = (y & 0x0F);
                console.log(`Use item in container id: ${this._containerId}. Slot: ${z}`);
                return false;
            }else{
                this._containerId = y;
                this._useItemInInventory = true;
                console.log(`Use item in inventory. Slot: ${this._containerId}.`);
                return false;
            }
        }else{
            console.log(`Use item on ground.`);
            return this._playerUseItemOnGround();
        }
    }

    protected async _networkOperations(): Promise<boolean> {
        if (this._itemIsContainer){
            if (this._closeContainer){
                const closeContainerOp = new SendCloseContainerOperation(this._containerId, this._player.client);
                await closeContainerOp.execute();
                console.log('Close container');
            }else{
                const container = this._player.getLastOpenedContainer();
                const containerId = this._player.getLastOpenedContainerId();

                const msg = OutgoingNetworkMessage.withClient(this._msg.client as TCP.Client, SendOpenContainerOperation.messageSize);
                SendOpenContainerOperation.writeToNetworkMessage(containerId, container, msg);
                await msg.send();
            }
        }else{
            const cancelMsg = new SendCancelMessageOperation('You cannot use that item.', this._player.client);
            await cancelMsg.execute();
        }
        return true;
    }

    protected _playerUseItemOnGround(){
        if (this._itemId === 2854){
            this._itemIsContainer = true;
            console.log('Open backpack');
            const tile : MapTile | null = map.getTileAt(this._position);

            if (tile === null){
                return false;
            }

            const item : Thing | null = tile.getThingByStackPos(this._stackPosition);

            if (item === null || item.thingId !== this._itemId){
                return false;
            }

            const openSuccess = this._player.addOpenContainer(item as Container);
            console.log('Player opened container');

            if (!openSuccess){
                //If not open success then container is already open
                //We close it
                this._closeContainer = true;
                this._containerId = this._player.getContainerIdByContainer(item as Container);
                this._player.closeContainerById(this._containerId);
            }

            return true;
        }else{
            return false;
        }
    }

    protected _playerUseItemInInventory(){
        return true;
    }

    protected _playerUseItemInContainer(){

    }
}