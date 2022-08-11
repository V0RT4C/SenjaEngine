import { PROTOCOL_RECEIVE } from "Constants";
import { IIncomingGameOperation, StaticOperationCode } from "Types";
import { StaticImplements, IncomingGameOperation } from "Decorators";
import { LookAtOp } from "Game/Operations/LookAtOp.class.ts";

@IncomingGameOperation()
@StaticImplements<StaticOperationCode>()
export class IncomingLookAtOp extends LookAtOp {
    public static operationCode = PROTOCOL_RECEIVE.LOOK_AT;

    public parseMessage() {
        this._position = this._msg.readPosition();
        this._thingId = this._msg.readUint16LE();
        this._stackPos = this._msg.readUint8();
        console.log(this._position);
    }
}

export interface IncomingLookAtOp extends IIncomingGameOperation {};