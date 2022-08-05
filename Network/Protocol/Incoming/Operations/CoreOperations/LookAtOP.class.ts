import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendTextMessageOperation } from "CoreSendOperations/SendTextMessageOperation.class.ts";

import { MESSAGE_TYPE, PROTOCOL_RECEIVE } from "Constants";
import { IPosition, StaticOperationCode } from "Types";
import { TCP } from 'Dependencies';
import { StaticImplements } from "Decorators";
import rawItems from "RawItems";
import map from "Map";
import { Thing } from "Thing";

@StaticImplements<StaticOperationCode>()
export class LookAtOP extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.LOOK_AT;

    private _position! : IPosition;
    private _thingId! : number;
    private _stackPos! : number;
    private _thing! : Thing | null;

    public parseMessage() {
        this._position = this._msg.readPosition();
        this._thingId = this._msg.readUint16LE();
        this._stackPos = this._msg.readUint8();
    }

    protected _internalOperations(): boolean {
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
        const textMessage = new SendTextMessageOperation(
            message,
            MESSAGE_TYPE.GREEN_MESSAGE_SCREEN_CENTER_AND_CONSOLE,
            this._msg.client as TCP.Client);
        await textMessage.execute();
        return true;
    }
}