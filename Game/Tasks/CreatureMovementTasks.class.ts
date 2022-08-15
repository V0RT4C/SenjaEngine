import log from 'Logger';
import { WALK_DIRECTION } from "../../Constants/Map.const.ts";
import { MESSAGE_TYPE } from '../../Constants/Network.const.ts';
import { FloorChangeOP } from 'Game/Operations/Movement/CreatureMovement/FloorChangeOP.class.ts';
import { SendCancelWalkOperation } from '../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendCancelWalkOperation.class.ts';
import { SendMoveCreatureOperation } from "../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendMoveCreatureOperation.class.ts";
import { SendTextMessageOperation } from '../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendTextMessageOperation.class.ts';
import game from '../Game.class.ts';
import map from '../Map/Map.class.ts';
import { MapTile } from '../Map/MapTile.class.ts';
import { Player } from '../Player/Player.class.ts';
import { TeleportCreatureOp } from '../Operations/Movement/CreatureMovement/TeleportCreatureOp.class.ts';

export class CreatureMovementTasks {
    public static async processPlayerWalk(player : Player){
        if (player.scheduledWalkTasks.length > 0 && player.isAllowedToWalk()){
            let walkSuccess = false;

            const oldStackPosition = player.getStackPosition();
            const task = player.scheduledWalkTasks.pop();

            switch(task?.direction){
                case WALK_DIRECTION.NORTH:
                    walkSuccess = player.moveNorth(task?.force);
                    break;
                case WALK_DIRECTION.NORTH_EAST:
                    walkSuccess = player.moveNorthEast(task?.force);
                    break;
                case WALK_DIRECTION.NORTH_WEST:
                    walkSuccess = player.moveNorthWest(task?.force);
                    break;
                case WALK_DIRECTION.EAST:
                    walkSuccess = player.moveEast(task?.force);
                    break;
                case WALK_DIRECTION.SOUTH_EAST:
                    walkSuccess = player.moveSouthEast(task?.force);
                    break;
                case WALK_DIRECTION.SOUTH:
                    walkSuccess = player.moveSouth(task?.force);
                    break;
                case WALK_DIRECTION.SOUTH_WEST:
                    walkSuccess = player.moveSouthWest(task?.force);
                    break;
                case WALK_DIRECTION.WEST:
                    walkSuccess = player.moveWest(task?.force);
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
                else if (newTile.isTeleport()){
                    game.addOperation(new TeleportCreatureOp(player, { ...player.position }, newTile.getDestination()));
                }
            }

            if (walkSuccess){
                const moveOp = new SendMoveCreatureOperation(player, player.previousPosition, player.position, oldStackPosition);
                await moveOp.execute();
                const posMsgOp = new SendTextMessageOperation(`Position: { x: ${player.position.x}, y: ${player.position.y}, z: ${player.position.z} }`, MESSAGE_TYPE.PURPLE_MESSAGE_CONSOLE, player.client);
                await posMsgOp.execute();
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