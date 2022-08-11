import log from 'Logger';
import map from "Game/Map/Map.class.ts";
import players from 'Game/Player/Players.class.ts';

import { IPosition } from "Types";
import { RETURN_MESSAGE } from "Constants/Game.const.ts";
import { Container } from "Game/Container.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { stringifyPosition } from "Game/Lib/string.lib.ts";
import { MapTile } from "Game/Map/MapTile.class.ts";
import { Player } from "Game/Player/Player.class.ts";
import { Item } from 'Game/Item.class.ts';
import { AddThingToContainerOP } from 'CoreSendOperations/AddThingToContainerOP.class.ts';
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';
import { SendRemoveThingFromTileOperation } from 'CoreSendOperations/SendRemoveThingFromTileOperation.class.ts';

export class MoveItemFromGroundToContainerOp extends GameOperation {
    constructor(
        private readonly _player : Player,
        private readonly _fromPosition : IPosition,
        private readonly _stackPosition : number,
        private readonly _toContainerId : number
    ){super();}

    private _cancelMessage : string | undefined;
    private _container! : Container;
    private _thingId! : number;

    protected _internalOperations(): boolean {
        return this._playerMoveThingFromGroundToContainer();
    }

    protected async _networkOperations(): Promise<boolean> {
        if (this._cancelMessage === undefined){
            const removeThingFromMapMessage = new SendRemoveThingFromTileOperation(this._fromPosition, this._stackPosition);
            await removeThingFromMapMessage.execute();

            const toContainerSpectators = players.getPlayersFromIds(this._container.getPlayerSpectatorIds());
        
            for (const p of toContainerSpectators){
                if (p.containerIsOpen(this._container)){
                    const containerId = p.getContainerIdByContainer(this._container);
                    const addThingToContainerOp = new AddThingToContainerOP(containerId, this._thingId, p.client);
                    await addThingToContainerOp.execute();
                }
            }
        }else{
            const cancelMsgOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
            await cancelMsgOp.execute();
        }

        return true;
    }

    protected _playerMoveThingFromGroundToContainer(){
        const fromTile : MapTile | null = map.getTileAt(this._fromPosition);

        if (fromTile === null){
            log.warning(`[MoveItemFromGroundToContainer] - fromTile at ${stringifyPosition(this._fromPosition)} is null`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return true;
        }

        const item : Item | null = fromTile.getThingByStackPos(this._stackPosition) as Item;

        if (item === null){
            log.warning(`[MoveItemFromGroundToContainerOp] - No thing found at stackPosition ${this._stackPosition}, Position: ${stringifyPosition(this._fromPosition)}`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return true;
        }

        this._thingId = item.thingId;

        if (!item.isItem()){
            this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
            return true;
        } 

        const container : Container | null = this._player.getContainerById(this._toContainerId);

        if (container === null){
            log.warning(`[MoveItemFromGroundToContainer] - container is null`);
            return true;
        }

        if (container.isFull()){
            this._cancelMessage = RETURN_MESSAGE.NOT_ENOUGH_ROOM;
            return true;
        }

        //Cant add container as child container of itself
        if (item === container){
            this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
            return true;
        }

        const removeSuccess = fromTile.removeDownThingByThing(item);
        if (!removeSuccess){
            log.warning(`[MoveItemFromGroundToContainer] - Failed to remove ${item.thingId} from tile at position ${stringifyPosition(this._fromPosition)}`);
            return true;
        }

        this._container = container;

        if (container.addItem(item as Item)){
            item.onMove();
            return true;
        }else{
            log.warning(`[MoveItemFromGroundToContainer] - Failed to add ${item.thingId} to containerId ${container.getContainerId(this._player)}, for player ${this._player.name}`);
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return true;
        }
    }
}