import { IPosition, StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { UseItemInContainerOp } from 'Game/Operations/ItemUse/UseItemInContainerOp.class.ts';
import { UseItemInInventorySlotOp } from 'Game/Operations/ItemUse/UseItemInInventorySlotOp.class.ts';
import { UseItemOnGroundOp } from "Game/Operations/ItemUse/UseItemOnGroundOp.class.ts";
import { IncomingGameRequest } from "../IncomingGameRequest.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class UseItemRequest extends IncomingGameRequest {
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
            const op = new UseItemOnGroundOp(this._player, this._position, this._stackPosition, this._itemId);
            await op.execute();
        }
    }
}