import { IncomingGameOp } from '../IncomingGameOp.abstract.ts';
import { LeaveGameOp } from 'Game/Operations/LeaveGameOp.class.ts';
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class IncomingLeaveGameOp extends IncomingGameOp {
    public static operationCode = PROTOCOL_RECEIVE.LEAVE_GAME;

    public async execute(): Promise<void> {
        const op = new LeaveGameOp(this._player);
        await op.execute();
    }
}