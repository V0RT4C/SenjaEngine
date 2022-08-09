import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import { WALK_DIRECTION } from "~/Constants/Map.const.ts";

@StaticImplements<StaticOperationCode>()
export class MoveEastOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_EAST;

    protected _doMove(): boolean {
        //game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.EAST, this._player.getNextAllowedWalkInGameTicks()));
        this._player.addWalkTask(WALK_DIRECTION.EAST);
        return true;
    }
}