import { IIncomingGameOperation, StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements, IncomingGameOperation } from "Decorators";
import { UseItemOP } from "Game/Operations/UseItemOp.class.ts";

@IncomingGameOperation()
@StaticImplements<StaticOperationCode>()
export class IncomingUseItemOp extends UseItemOP {
    public static operationCode = PROTOCOL_RECEIVE.USE_ITEM;

    public parseMessage() {
        this._position = this._msg.readPosition();
        this._itemId = this._msg.readUint16LE();
        this._stackPosition = this._msg.readUint8();
        this._index = this._msg.readUint8();
        this._msg.seek(this._msg.byteLength);
    }
}

export interface IncomingUseItemOp extends IIncomingGameOperation {};