import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class MoveSouthOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_SOUTH;

    protected _doMove(): boolean {
        return this._player.moveSouth();
    }
}