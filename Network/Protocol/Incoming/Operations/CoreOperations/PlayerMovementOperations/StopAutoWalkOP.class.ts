import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class StopAutoWalkOP extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.STOP_AUTO_WALK;

    protected _internalOperations(): boolean {
        if (!this._player.isAutoWalking){
            return false;
        }

        return this._player.stopAutoWalk();
    }

    protected _networkOperations(): boolean {
        return true;
    }
}