import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import game from "../../../../../../Game/Game.class.ts";
import { ScheduledPlayerWalkTask } from "../../../../../../Game/Tasks/ScheduledTasks/PlayerAutoWalkTask/ScheduledPlayerWalkTask.class.ts";
import { WALK_DIRECTION } from "../../../../../../Constants/Map.const.ts";
import map from "../../../../../../Game/Map/Map.class.ts";
import { SendCancelWalkOperation } from "../../../../Outgoing/SendOperations/CoreSendOperations/SendCancelWalkOperation.class.ts";
import { MapTile } from "../../../../../../Game/Map/MapTile.class.ts";

@StaticImplements<StaticOperationCode>()
export class MoveWestOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_WEST;

    protected _doMove(): boolean {
        if ((this._player.getCurrentTile() as MapTile).isFloorChange()){
            const cancelOp = new SendCancelWalkOperation(this._player);
            cancelOp.execute();
        }

        if (this._player.hasActiveWalkTask()){
            console.log('Active walk scheduled');
            return false;
        }

        //if (!this._player.isAllowedToWalk()){
            game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.WEST, this._player.getNextAllowedWalkInGameTicks()));
            return false;
        //}

        //return this._player.moveWest();
    }
}