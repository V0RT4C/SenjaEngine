import { LeaveGameOp } from 'Game/Operations/LeaveGameOp.class.ts';
import { StaticImplements, IncomingGameOperation } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";

@IncomingGameOperation()
@StaticImplements<StaticOperationCode>()
export class IncomingLeaveGameOp extends LeaveGameOp {
    public static operationCode = PROTOCOL_RECEIVE.LEAVE_GAME;
}