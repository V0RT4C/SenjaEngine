import log from 'Logger';
import map from "../Map/Map.class.ts";
import { SendCancelMessageOperation } from 'CoreSendOperations/SendCancelMessageOperation.class.ts';
import { SendUpdateTileItemOp } from "CoreSendOperations/SendUpdateTileItemOp.class.ts";
import { GameOperation } from "../GameOperation.abstract.ts";
import { RETURN_MESSAGE } from "Constants/Game.const.ts";
import { Player } from "../Player/Player.class.ts";
import { IPosition } from "../../@types/App.d.ts";
import { MapTile } from "../Map/MapTile.class.ts";
import { Thing } from "../Thing.class.ts";
import { Item } from "../Item.class.ts";

export class UpdateTileItemOp extends GameOperation {
    constructor(
        private _position : IPosition,
        private _stackPosition : number,
        private _newItem : number | Item,
        private _player? : Player,
    ){ super(); }

    private _cancelMessage : string | undefined;

    protected _internalOperations(): void {
        log.debug(`UpdateTileItemOp`);
        const tile : MapTile | null = map.getTileAt({ ...this._position });
        
        if (tile === null){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        const oldItem : Thing | null = tile.getThingByStackPos(this._stackPosition);

        if (oldItem === null || !oldItem.isItem()){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        const newItem = new Item(this._newItem as number);
        const replaceSuccess = tile.replaceThingByStackPos(this._stackPosition, newItem);

        
        if (!replaceSuccess){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
        }
    }

    protected async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined){
            const op = new SendUpdateTileItemOp(this._position, this._stackPosition, (this._newItem instanceof Item) ? this._newItem.thingId : this._newItem as number);
            await op.execute();
        }else{
            if (this._player !== undefined){
                const cancelOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
                await cancelOp.execute();
            }
        }
    }
}