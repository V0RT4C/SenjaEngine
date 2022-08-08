import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import game from "../../../../../../Game/Game.class.ts";
import { ScheduledPlayerWalkTask } from "../../../../../../Game/Tasks/ScheduledTasks/PlayerAutoWalkTask/ScheduledPlayerWalkTask.class.ts";
import { WALK_DIRECTION } from "../../../../../../Constants/Map.const.ts";

@StaticImplements<StaticOperationCode>()
export class MoveEastOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_EAST;

    protected _doMove(): boolean {
        game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.EAST, this._player.getNextAllowedWalkInGameTicks()));
        return true;
    }
}