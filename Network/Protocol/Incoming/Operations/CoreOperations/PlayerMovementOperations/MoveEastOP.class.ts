import { IncomingMoveOP } from "CoreOperations/PlayerMovementOperations/IncomingMoveOP.abstract.ts";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import game from "../../../../../../Game/Game.class.ts";
import { ScheduledPlayerWalkTask } from "../../../../../../Game/Tasks/ScheduledTasks/PlayerAutoWalkTask/ScheduledPlayerWalkTask.class.ts";
import { WALK_DIRECTION } from "../../../../../../Constants/Map.const.ts";
import { MapTile } from "../../../../../../Game/Map/MapTile.class.ts";
import { SendCancelWalkOperation } from "../../../../Outgoing/SendOperations/CoreSendOperations/SendCancelWalkOperation.class.ts";

@StaticImplements<StaticOperationCode>()
export class MoveEastOP extends IncomingMoveOP {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_EAST;

    protected _doMove(): boolean {
        //TRY TOMORROW if totile is floorchange
        if ((this._player.getCurrentTile() as MapTile).isFloorChange()){
            const cancelOp = new SendCancelWalkOperation(this._player);
            cancelOp.execute();
        }

        if (this._player.hasActiveWalkTask()){
            console.log('Active walk scheduled');
            return false;
        }

        //if (!this._player.isAllowedToWalk()){
            game.addScheduledTask(new ScheduledPlayerWalkTask(this._player, WALK_DIRECTION.EAST, this._player.getNextAllowedWalkInGameTicks()));
            return false;
        //}

        //return this._player.moveEast();
    }
}