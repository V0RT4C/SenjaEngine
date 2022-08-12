import { LeaveGameOp } from 'Game/Operations/LeaveGameOp.class.ts';
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";
import { IncomingGameRequest } from '../IncomingGameRequest.abstract.ts';

@StaticImplements<StaticOperationCode>()
export class LeaveGameRequest extends IncomingGameRequest {
    public static operationCode = PROTOCOL_RECEIVE.LEAVE_GAME;

    public async execute(): Promise<void> {
        const op = new LeaveGameOp(this._player);
        await op.execute();
    }
}