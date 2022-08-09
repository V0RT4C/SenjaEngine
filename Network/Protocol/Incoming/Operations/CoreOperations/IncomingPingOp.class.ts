import log from 'Logger';
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class IncomingPingOp extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.PING;

    protected _internalOperations(): boolean {
        log.debug('IncomingPingOp');
        return true;
    }

    protected _networkOperations(): boolean {
        return true;
    }
}