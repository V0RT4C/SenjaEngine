import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { WALK_DIRECTION } from "Constants/Map.const.ts";

@StaticImplements<StaticOperationCode>()
export class MoveSouthOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_SOUTH;

    protected _doMove(): boolean {
        //game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.SOUTH, this._player.getNextAllowedWalkInGameTicks()));
        this._player.addWalkTask(WALK_DIRECTION.SOUTH);
        return true;
    }
}