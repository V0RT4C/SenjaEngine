import { IncomingMoveOperation } from "CoreOperations/PlayerMovementOperations/IncomingMoveOperation.abstract.ts";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";

@StaticImplements<StaticOperationCode>()
export class MoveEastOperation extends IncomingMoveOperation {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_EAST;

    protected _doMove(): boolean {
        return this._player.moveEast();
    }
}