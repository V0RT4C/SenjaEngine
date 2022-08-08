import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import game from "../../../../../../Game/Game.class.ts";
import { ScheduledPlayerWalkTask } from "../../../../../../Game/Tasks/ScheduledTasks/PlayerAutoWalkTask/ScheduledPlayerWalkTask.class.ts";
import { WALK_DIRECTION } from "../../../../../../Constants/Map.const.ts";

@StaticImplements<StaticOperationCode>()
export class MoveWestOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_WEST;

    protected _doMove(): boolean {
        game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.WEST, this._player.getNextAllowedWalkInGameTicks()));
        return true;
    }
}