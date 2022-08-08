import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";
import { ScheduledPlayerWalkTask } from "../../../../../../Game/Tasks/ScheduledTasks/PlayerAutoWalkTask/ScheduledPlayerWalkTask.class.ts";
import game from "../../../../../../Game/Game.class.ts";
import { WALK_DIRECTION } from "../../../../../../Constants/Map.const.ts";

@StaticImplements<StaticOperationCode>()
export class MoveNorthOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_NORTH;

    protected _doMove(): boolean {
        game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.NORTH, this._player.getNextAllowedWalkInGameTicks()));
        return true;
    }
}