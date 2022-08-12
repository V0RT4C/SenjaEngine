import log from 'Logger';
import map from "../../../Map/Map.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { IPosition } from "../../../../@types/App.d.ts";
import { RETURN_MESSAGE } from "../../../../Constants/Game.const.ts";
import { MapTile } from "../../../Map/MapTile.class.ts";
import { Player } from "../../../Player/Player.class.ts";
import { Thing } from "../../../Thing.class.ts";
import { AddThingToMapOP } from '../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/AddThingToMapOP.class.ts';
import { SendRemoveThingFromTileOperation } from '../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendRemoveThingFromTileOperation.class.ts';
import { OutgoingNetworkMessage } from '../../../../Network/Lib/OutgoingNetworkMessage.class.ts';
import { Item } from '../../../Item.class.ts';
import { SendCancelMessageOperation } from '../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendCancelMessageOperation.class.ts';
import { THING_FLAG } from '../../../../Constants/Things.const.ts';

export class MoveThingFromTileToTileOp extends GameOperation {
    constructor(
        private readonly _player : Player,
        private readonly _fromPosition : IPosition,
        private readonly _fromStackPosition : number,
        private _toPosition : IPosition
    ){ super(); }

    private _cancelMessage : string | undefined;
    private _movingThing! : Thing;

    protected _internalOperations(): void {
        log.debug(`MoveItemFromTileToTile`);
        this._playerMoveThingFromTileToTile();
    }

    protected async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined){
            console.log("HLLO")
            const msg = new OutgoingNetworkMessage(SendRemoveThingFromTileOperation.messageSize + AddThingToMapOP.messageSize + 100);
            SendRemoveThingFromTileOperation.writeToNetworkMessage(this._fromPosition, this._fromStackPosition, msg);
            SendRemoveThingFromTileOperation.updateContainerSpectators(this._movingThing, this._fromPosition, this._player);
            AddThingToMapOP.writeToNetworkMessage(this._movingThing.thingId, this._toPosition, msg);
            await msg.sendToPlayersInAwareRange(this._fromPosition, this._toPosition);
        }else{
            const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsgOp.execute();
        }
    }

    protected _playerMoveThingFromTileToTile(){
        const fromTile : MapTile | null = map.getTileAt(this._fromPosition);

        if (fromTile === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        const toTile : MapTile | null = map.getTileAt(this._toPosition);

        if (toTile === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        const thing : Thing | null = fromTile.getThingByStackPos(this._fromStackPosition);

        if (thing === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        this._movingThing = thing;

        if (thing.isItem()){
            if (!(thing as Item).isMovable()){
                this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
                return;
            }
            
            if (toTile.isFloorChange()){
                let toPosition : IPosition = { ...this._toPosition };

                if (toTile.hasFlag(THING_FLAG.FLOOR_CHANGE_DOWN)){
                    toPosition.y++;
                    toPosition.z++;
                }
                else if (toTile.hasFlag(THING_FLAG.FLOOR_CHANGE_UP_NORTH)){
                    toPosition.y--;
                    toPosition.z--;
                }

                const teleportSuccess = map.teleportThing(this._fromPosition, this._fromStackPosition, toPosition);

                if (!teleportSuccess){
                    this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
                    return;
                }else{
                    this._toPosition = toPosition;
                    return;
                }
            }
        }


        if (map.moveThing(this._fromPosition, this._fromStackPosition, this._toPosition)) {
            this._player.closeDistantContainers();
            return;
        } else {
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }
    }
}