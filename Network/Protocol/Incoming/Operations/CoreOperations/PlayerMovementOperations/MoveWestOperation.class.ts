import { IncomingMoveOperation } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/IncomingMoveOperation.abstract.ts";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class MoveWestOperation extends IncomingMoveOperation {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_WEST;

    protected _doMove(): boolean {
        return this._player.moveWest();
    }
}