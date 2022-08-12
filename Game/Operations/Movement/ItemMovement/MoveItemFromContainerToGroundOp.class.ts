import log from 'Logger';
import map from 'Game/Map/Map.class.ts';
import players from 'Game/Player/Players.class.ts';
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';
import { SendDeleteFromContainerOperation } from 'CoreSendOperations/SendDeleteFromContainerOperation.class.ts';
import { IPosition } from "Types";
import { Player } from "Game/Player/Player.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Container } from 'Game/Container.class.ts';
import { RETURN_MESSAGE } from 'Constants/Game.const.ts';
import { MapTile } from 'Game/Map/MapTile.class.ts';
import { AddThingToMapOP } from 'CoreSendOperations/AddThingToMapOP.class.ts';
import { Item } from 'Game/Item.class.ts';
import { THING_FLAG } from '../../../../Constants/Things.const.ts';

export class MoveItemFromContainerToGroundOp extends GameOperation {
    constructor(
        private _player : Player,
        private _fromContainerId : number,
        private _fromContainerSlotId : number,
        private _toGroundPosition : IPosition
    ){ super(); }

    private _cancelMessage : string | undefined;
    private _container! : Container;
    private _item! : Item;

    protected _internalOperations(): void {
        log.debug(`MoveItemFromContainerToGroundOp`);
        return this._playerMoveItemFromContainerToGround();
    }

    protected async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined){
            const fromContainerSpectators = players.getPlayersFromIds(this._container.getPlayerSpectatorIds());
    
            for (const p of fromContainerSpectators){
                if (p.containerIsOpen(this._container)){
                    const containerId = p.getContainerIdByContainer(this._container);
                    const deleteFromContainerOp = new SendDeleteFromContainerOperation(containerId, this._fromContainerSlotId, p.client);
                    await deleteFromContainerOp.execute();
                }
            }
    
            const addThingToMapOp = new AddThingToMapOP(this._item.thingId, this._toGroundPosition);
            await addThingToMapOp.execute();
        }else{
            const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsgOp.execute();
        }
    }

    protected _playerMoveItemFromContainerToGround(){
        const container : Container | null = this._player.getContainerById(this._fromContainerId);
        
        if (container === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        this._container = container;

        const item = container.getItemBySlotId(this._fromContainerSlotId);
        
        if (item === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        this._item = item;

        let tile : MapTile | null = map.getTileAt(this._toGroundPosition);
        
        if (tile === null){
            this._cancelMessage = RETURN_MESSAGE.THERE_IS_NO_WAY;
            return;
        }

        const removeFromContainerSuccess = container.removeItemBySlotId(this._fromContainerSlotId);

        if (removeFromContainerSuccess !== null){

            if (tile.isFloorChange()){
                let toPosition : IPosition = { ...this._toGroundPosition };
    
                if (tile.hasFlag(THING_FLAG.FLOOR_CHANGE_DOWN)){
                    toPosition.y++;
                    toPosition.z++;
                }
                else if (tile.hasFlag(THING_FLAG.FLOOR_CHANGE_UP_NORTH)){
                    toPosition.y--;
                    toPosition.z--;
                }
    
                tile = map.getTileAt(toPosition);
    
                if (tile === null){
                    this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
                    return;
                }else{
                    this._toGroundPosition = toPosition;
                }
            }

            tile.addDownThing(item);
            item.onMove();
        }else{
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }
    }
}