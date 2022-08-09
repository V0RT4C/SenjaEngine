import { PROTOCOL_RECEIVE } from "Constants";
import { IIncomingGameOperation, StaticOperationCode } from "Types";
import { StaticImplements, IncomingGameOperation } from "Decorators";
import { SetOutfitOp } from "Game/Operations/SetOutfitOp.class.ts";

@IncomingGameOperation()
@StaticImplements<StaticOperationCode>()
export class IncomingSetOutfitOp extends SetOutfitOp {
    public static operationCode = PROTOCOL_RECEIVE.REQUEST_SET_OUTFIT;

    public parseMessage() {
        this._lookType = this._msg.readUint8();
        this._lookHead = this._msg.readUint8();
        this._lookBody = this._msg.readUint8();
        this._lookLegs = this._msg.readUint8();
        this._lookFeet = this._msg.readUint8();
    }
}

export interface IncomingSetOutfitOp extends IIncomingGameOperation {};