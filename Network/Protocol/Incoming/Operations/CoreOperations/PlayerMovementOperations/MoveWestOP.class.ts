import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { WALK_DIRECTION } from "../../../../../../Constants/Map.const.ts";

@StaticImplements<StaticOperationCode>()
export class MoveWestOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_WEST;

    protected _doMove(): boolean {
        //game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.WEST, this._player.getNextAllowedWalkInGameTicks()));
        this._player.addWalkTask(WALK_DIRECTION.WEST);
        return true;
    }
}