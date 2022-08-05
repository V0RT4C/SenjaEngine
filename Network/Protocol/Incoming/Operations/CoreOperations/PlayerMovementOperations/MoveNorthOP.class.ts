import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class MoveNorthOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_NORTH;

    protected _doMove(): boolean {
        return this._player.moveNorth();
    }
}