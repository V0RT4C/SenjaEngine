import log from 'Logger';
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { IncomingGameRequest } from '../IncomingGameRequest.abstract.ts';

@StaticImplements<StaticOperationCode>()
export class PingRequest extends IncomingGameRequest {
    public static operationCode = PROTOCOL_RECEIVE.PING;

    public execute(): void {
        log.debug('IncomingPingOp');
        return;
    }
}