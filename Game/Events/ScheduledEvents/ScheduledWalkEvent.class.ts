import { WALK_DIRECTION } from "Constants/Map.const.ts";
import { IPosition } from "../../../@types/App.d.ts";
import { SendMoveCreatureOperation } from "../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendMoveCreatureOperation.class.ts";
import map from "../../Map/Map.class.ts";
import { MapTile } from "../../Map/MapTile.class.ts";
import { Player } from "../../Player/Player.class.ts";
import { ScheduledEvent } from "./ScheduledEvent.abstract.ts";

export class ScheduledWalkEvent extends ScheduledEvent {
    constructor(
        private readonly _player : Player,
        private readonly _direction : WALK_DIRECTION
    ){ super(); }

    private _oldPosition! : IPosition;
    private _oldStackPosition! : number;

    public get player() : Player {
        return this._player;
    }

    protected _internalOperations(): boolean {
        if (!this._player.canWalk()){
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
                walkSuccess = this._player.moveNorth();
                break;
            case WALK_DIRECTION.EAST:
                walkSuccess = this._player.moveEast();
                break;
            case WALK_DIRECTION.SOUTH_EAST:
                walkSuccess = this._player.moveSouth();
                break;
            case WALK_DIRECTION.SOUTH:
                walkSuccess = this._player.moveSouth();
                break;
            case WALK_DIRECTION.SOUTH_WEST:
                walkSuccess = this._player.moveSouth();
                break;
            case WALK_DIRECTION.WEST:
                walkSuccess = this._player.moveWest();
                break;
        }

        return walkSuccess;
    }

    protected async _networkOperations(): Promise<boolean> {
        const op = new SendMoveCreatureOperation(this._player, this._oldPosition, this._player.position, this._oldStackPosition);
        await op.execute();
        return true;
    }
}