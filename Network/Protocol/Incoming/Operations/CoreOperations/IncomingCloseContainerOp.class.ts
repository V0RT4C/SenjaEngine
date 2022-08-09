import { PROTOCOL_RECEIVE } from "Constants";
import { CloseContainerOp } from 'Game/Operations/CloseContainerOp.class.ts';
import { StaticImplements, IncomingGameOperation } from "Decorators";
import { IIncomingGameOperation, StaticOperationCode } from 'Types';


@IncomingGameOperation()
@StaticImplements<StaticOperationCode>()
export class IncomingCloseContainerOp extends CloseContainerOp {

    public static operationCode : PROTOCOL_RECEIVE = PROTOCOL_RECEIVE.CLOSE_CONTAINER;

    public parseMessage() {
        this._containerId = this._msg.readUint8();
    }
}

export interface IncomingCloseContainerOp extends IIncomingGameOperation {}

