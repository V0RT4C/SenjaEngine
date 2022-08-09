import { PROTOCOL_RECEIVE } from "Constants";
import { IIncomingGameOperation, StaticOperationCode } from "Types";
import { CreatureSpeakOp } from "Game/Operations/CreatureSpeakOp.class.ts";
import { StaticImplements, IncomingGameOperation } from "Decorators";

@IncomingGameOperation()
@StaticImplements<StaticOperationCode>()
export class IncomingCreatureSpeakOp extends CreatureSpeakOp {
    public static operationCode = PROTOCOL_RECEIVE.SPEAK;

    public parseMessage() : void {
        this._speakType = this._msg.readUint8();
        this._speakMessage = this._msg.readString();
    }
}

export interface IncomingCreatureSpeakOp extends IIncomingGameOperation {};