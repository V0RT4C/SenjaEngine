import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendEditOutfitOperation } from "CoreSendOperations/SendEditOutfitOperation.class.ts";

import { StaticOperationCode } from "Types";
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";

@StaticImplements<StaticOperationCode>()
export class IncomingChangeOutfitRequestOp extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.REQUEST_CHANGE_OUTFIT;

    protected _internalOperations(): boolean {
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        const op = new SendEditOutfitOperation(this._player);
        await op.execute();
        return true;
    }
}