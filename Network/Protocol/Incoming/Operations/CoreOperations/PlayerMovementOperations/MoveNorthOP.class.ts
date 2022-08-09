import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";
import { WALK_DIRECTION } from "~/Constants/Map.const.ts";

@StaticImplements<StaticOperationCode>()
export class MoveNorthOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_NORTH;

    protected _doMove(): boolean {
        //game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.NORTH, this._player.getNextAllowedWalkInGameTicks()));
        this._player.addWalkTask(WALK_DIRECTION.NORTH);
        return true;
    }
}