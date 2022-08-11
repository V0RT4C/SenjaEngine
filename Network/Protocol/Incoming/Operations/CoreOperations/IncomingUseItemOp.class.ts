import log from 'Logger';
import map from "Game/Map/Map.class.ts";
import { IPosition, StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { UseItemOP } from "Game/Operations/ItemUse/UseItemOp.class.ts";
import { IncomingGameOp } from "../IncomingGameOp.abstract.ts";
import { MapTile } from "Game/Map/MapTile.class.ts";
import { stringifyPosition } from "Game/Lib/string.lib.ts";
import { Thing } from 'Game/Thing.class.ts';
import { Item } from 'Game/Item.class.ts';
import { UseItemInContainerOp } from '../../../../../Game/Operations/ItemUse/UseItemInContainerOp.class.ts';
import { UseItemInInventorySlotOp } from '../../../../../Game/Operations/ItemUse/UseItemInInventorySlotOp.class.ts';

@StaticImplements<StaticOperationCode>()
export class IncomingUseItemOp extends IncomingGameOp {
    public static operationCode = PROTOCOL_RECEIVE.USE_ITEM;

    protected _position!: IPosition;
    protected _itemId!: number;
    protected _stackPosition!: number;
    protected _index!: number;

    public parseMessage() {
        this._position = this._msg.readPosition();
        this._itemId = this._msg.readUint16LE();
        this._stackPosition = this._msg.readUint8();
        this._index = this._msg.readUint8();
        this._msg.seek(this._msg.byteLength);
    }

    public async execute(): Promise<void> {
        const { x, y, z } = this._position;

        if (x === 0xFFFF){
            if (y & 0x40){
                const containerId = (y & 0x0F);
                const slotId = z;
                const op = new UseItemInContainerOp(this._player, containerId, slotId, this._itemId);
                await op.execute();
            }else{
                const intentorySlotId = y;
                const op = new UseItemInInventorySlotOp(this._player, intentorySlotId);
                await op.execute();
            }
        }else{
            //Use item on ground
        }
        // const tile : MapTile | null = map.getTileAt(this._position);

        // if (tile === null){
        //     log.warning(`[IncomingUseItemOp] - Tile is null at position ${stringifyPosition(this._position)}`);
        //     return;
        // }

        // const item : Thing | null = tile.getThingByStackPos(this._stackPosition);

        // if (item === null){
        //     log.warning(`[IncomingUseItemOp] - Failed to get item to use from position ${stringifyPosition(this._position)}, stackPosition: ${this._stackPosition}`);
        //     return;
        // }

        // if (!item.isItem()){
        //     log.warning(`[IncomingUseItemOp] - Thing from tile at ${stringifyPosition(this._position)}, stackPosition: ${this._stackPosition} was not an item.`);
        //     return;
        // }

        // const op = new UseItemOP(this._player, item as Item);
        // await op.execute();
    }
}