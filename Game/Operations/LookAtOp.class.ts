import log from 'Logger';
import map from "Map";
import { SendTextMessageOperation } from "CoreSendOperations/SendTextMessageOperation.class.ts";
import { Thing } from "Thing";
import { Player } from '../Player/Player.class.ts';
import { GameOperation } from '../GameOperation.abstract.ts';
import { MESSAGE_TYPE } from "Constants";
import { IPosition } from "Types";

export class LookAtOp extends GameOperation {
    constructor(protected readonly _player : Player, position? : IPosition){ 
        super(); 
        if (position){
            this._position = position;
        }
    }

    protected _position! : IPosition;
    protected _thingId! : number;
    protected _stackPos! : number;
    protected _thing! : Thing | null;


    protected _internalOperations(): boolean {
        log.debug(`LookAtOp`);

        if (this._position === undefined){
            throw new Error('Position is not defined');
        }

        const tile = map.getTileAt(this._position);

        if (tile !== null){
            this._thing = tile.getRealTopThing();
        }else{
            this._thing = null;
        }

        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        let message : string;

        if (this._player !== null && this._position.x === this._player.position.x && this._player.position.y === this._position.y && this._player.position.z === this._position.z){
            message = 'You see yourself.';
        }else{
            if (this._thing !== null){
                message = `You see a ${this._thing.name}. Itemid: ${this._thing.thingId}`;
            }else{
                message = `You see a thing with id: ${this._thingId}.\nPosition { x: ${this._position.x}, y: ${this._position.y}, z: ${this._position.z} }`;
            }
        }
        const textMessage = new SendTextMessageOperation(message, MESSAGE_TYPE.GREEN_MESSAGE_SCREEN_CENTER_AND_CONSOLE, this._player.client);
        await textMessage.execute();
        return true;
    }
}