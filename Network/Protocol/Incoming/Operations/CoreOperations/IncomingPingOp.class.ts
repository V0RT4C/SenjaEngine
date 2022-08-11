import log from 'Logger';
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { IncomingGameOp } from '../IncomingGameOp.abstract.ts';

@StaticImplements<StaticOperationCode>()
export class IncomingPingOp extends IncomingGameOp {
    public static operationCode = PROTOCOL_RECEIVE.PING;

    public execute(): void {
        log.debug('IncomingPingOp');
        return;
    }
}