import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendTextMessageOperation } from "OutgoingSendOperations/CoreSendOperations/SendTextMessageOperation.class.ts";

import { Player } from "Player";
import players from "Game/Player/Players.class.ts";

import { MESSAGE_TYPE, PROTOCOL_RECEIVE } from "Constants";
import { IPosition, StaticOperationCode } from "Types";
import { TCP } from 'Dependencies';
import { StaticImplements } from "Decorators";

@StaticImplements<StaticOperationCode>()
export class LookAtOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.LOOK_AT;

    private _player! : Player | null;
    private _position! : IPosition;
    private _thingId! : number;
    private _stackPos! : number;

    public parseMessage() {
        this._position = this._msg.readPosition();
        this._thingId = this._msg.readUint16LE();
        this._stackPos = this._msg.readUint8();
    }

    protected _internalOperations(): boolean {
        const player = players.getPlayerById(this._msg.client?.conn?.rid as number);
        this._player = player;
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        let message : string;

        if (this._player !== null && this._position.x === this._player.position.x && this._player.position.y === this._position.y && this._player.position.z === this._position.z){
            message = 'You see yourself.';
        }else{
            message = `You see a thing with id: ${this._thingId}.\nPosition { x: ${this._position.x}, y: ${this._position.y}, z: ${this._position.z} }`;
        }
        const textMessage = new SendTextMessageOperation(
            message,
            MESSAGE_TYPE.GREEN_MESSAGE_SCREEN_CENTER_AND_CONSOLE,
            this._msg.client as TCP.Client);
        await textMessage.execute();
        return true;
    }
}