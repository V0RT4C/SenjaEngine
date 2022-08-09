import log from 'Logger';
import { WALK_DIRECTION } from "../../Constants/Map.const.ts";
import { FloorChangeOP } from '../../Network/Protocol/Incoming/Operations/CoreOperations/PlayerMovementOperations/FloorChangeOP.class.ts';
import { SendCancelWalkOperation } from '../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendCancelWalkOperation.class.ts';
import { SendMoveCreatureOperation } from "../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendMoveCreatureOperation.class.ts";
import game from '../Game.class.ts';
import map from '../Map/Map.class.ts';
import { MapTile } from '../Map/MapTile.class.ts';
import { Player } from '../Player/Player.class.ts';

export class CreatureMovementTasks {
    public static async processPlayerWalk(player : Player){
        if (player.scheduledWalkTasks.length > 0 && player.isAllowedToWalk()){
            let walkSuccess = false;

            const oldStackPosition = player.getStackPosition();

            switch(player.scheduledWalkTasks.pop()){
                case WALK_DIRECTION.NORTH:
                    walkSuccess = player.moveNorth();
                    break;
                case WALK_DIRECTION.NORTH_EAST:
                    walkSuccess = player.moveNorthEast();
                    break;
                case WALK_DIRECTION.NORTH_WEST:
                    walkSuccess = player.moveNorthWest();
                    break;
                case WALK_DIRECTION.EAST:
                    walkSuccess = player.moveEast();
                    break;
                case WALK_DIRECTION.SOUTH_EAST:
                    walkSuccess = player.moveSouthEast();
                    break;
                case WALK_DIRECTION.SOUTH:
                    walkSuccess = player.moveSouth();
                    break;
                case WALK_DIRECTION.SOUTH_WEST:
                    walkSuccess = player.moveSouthWest();
                    break;
                case WALK_DIRECTION.WEST:
                    walkSuccess = player.moveWest();
                    break;
                case WALK_DIRECTION.FLOOR_DOWN:
                    walkSuccess = player.moveDown();
                    break;
                case WALK_DIRECTION.FLOOR_UP_NORTH:
                    walkSuccess = player.moveUpNorth();
                    break;
            }

            const newTile : MapTile | null = map.getTileAt(player.position);
        
            if (newTile !== null){
                if (newTile.isFloorChange()){
                    game.addOperation(new FloorChangeOP(player));
                }
            }

            if (walkSuccess){
                const moveOp = new SendMoveCreatureOperation(player, player.previousPosition, player.position, oldStackPosition);
                await moveOp.execute();
            }else{
                log.debug(`Failed to move player`);
                const cancelWalk = new SendCancelWalkOperation(player);
                await cancelWalk.execute();

                if (player.scheduledWalkTasks.length > 0){
                    player.stopAutoWalk();
                }
            }
        }
    }
}