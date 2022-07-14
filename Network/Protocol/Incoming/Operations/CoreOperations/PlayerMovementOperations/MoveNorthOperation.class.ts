import { IncomingMoveOperation } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/IncomingMoveOperation.abstract.ts";

import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class MoveNorthOperation extends IncomingMoveOperation {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_NORTH;

    protected _doMove(): boolean {
        return this._player.moveNorth();
    }
}