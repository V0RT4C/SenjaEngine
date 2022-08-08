import { WALK_DIRECTION } from "Constants/Map.const.ts";
import { IPosition } from "../../../../@types/App.d.ts";
import { SendMoveCreatureOperation } from "../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendMoveCreatureOperation.class.ts";
import game from "../../../Game.class.ts";
import map from "../../../Map/Map.class.ts";
import { MapTile } from "../../../Map/MapTile.class.ts";
import { Player } from "../../../Player/Player.class.ts";
import { ScheduledTask } from "./../ScheduledTask.abstract.ts";
import { FloorChangeOP } from 'CoreOperations/PlayerMovementOperations/FloorChangeOP.class.ts';
import { SendTextMessageOperation } from "../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendTextMessageOperation.class.ts";
import { MESSAGE_TYPE } from "../../../../Constants/Network.const.ts";

export class ScheduledPlayerWalkTask extends ScheduledTask {
    constructor(
        private readonly _player : Player,
        private readonly _direction : WALK_DIRECTION,
        scheduledAtGameTick? : number
    ){ super(scheduledAtGameTick ? scheduledAtGameTick : 0); }

    private _oldPosition! : IPosition;
    private _oldStackPosition! : number;
    private _isAllowedToWalk = true;

    public get player() : Player {
        return this._player;
    }

    public get isAllowedToWalk() : boolean {
        return this._isAllowedToWalk;
    }

    protected _internalOperations(): boolean {
        if (!this._player.isAllowedToWalk()){
            this._isAllowedToWalk = false;
            return false;
        }

        this._oldPosition = this._player.position;

        const oldTile : MapTile | null = map.getTileAt(this._oldPosition);

        if (oldTile === null){
            return false;
        }

        this._oldStackPosition = oldTile.getThingStackPos(this._player);

        let walkSuccess = false;

        switch(this._direction){
            case WALK_DIRECTION.NORTH:
                walkSuccess = this._player.moveNorth();
                break;
            case WALK_DIRECTION.NORTH_EAST:
                walkSuccess = this._player.moveNorthEast();
                break;
            case WALK_DIRECTION.NORTH_WEST:
                walkSuccess = this._player.moveNorthWest();
                break;
            case WALK_DIRECTION.EAST:
                walkSuccess = this._player.moveEast();
                break;
            case WALK_DIRECTION.SOUTH_EAST:
                walkSuccess = this._player.moveSouthEast();
                break;
            case WALK_DIRECTION.SOUTH:
                walkSuccess = this._player.moveSouth();
                break;
            case WALK_DIRECTION.SOUTH_WEST:
                walkSuccess = this._player.moveSouthWest();
                break;
            case WALK_DIRECTION.WEST:
                walkSuccess = this._player.moveWest();
                break;
            case WALK_DIRECTION.FLOOR_DOWN:
                walkSuccess = this._player.moveDown();
                break;
            case WALK_DIRECTION.FLOOR_UP_NORTH:
                walkSuccess = this._player.moveUpNorth();
                break;
        }

        const newTile : MapTile | null = map.getTileAt(this._player.position);
            
        if (newTile !== null){
            if (newTile.isFloorChange()){
                game.addOperation(new FloorChangeOP(this._player));
            }
        }

        return walkSuccess;
    }

    protected async _networkOperations(): Promise<boolean> {
        const op = new SendMoveCreatureOperation(this._player, this._oldPosition, this._player.position, this._oldStackPosition);
        await op.execute();
        const posMsgOp = new SendTextMessageOperation(`Position: { x: ${this._player.position.x}, y: ${this._player.position.y}, z: ${this._player.position.z} }`, MESSAGE_TYPE.PURPLE_MESSAGE_CONSOLE, this._player.client);
        await posMsgOp.execute();
        return true;
    }
}