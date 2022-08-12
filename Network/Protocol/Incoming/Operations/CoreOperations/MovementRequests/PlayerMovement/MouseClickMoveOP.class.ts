import log from 'Logger';
import { IncomingGameOperation } from "../../../IncomingGameOperation.abstract.ts";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import { WALK_DIRECTION } from '~/Constants/Map.const.ts';

@StaticImplements<StaticOperationCode>()
export class MouseClickMoveOP extends IncomingGameOperation {

    public static operationCode = PROTOCOL_RECEIVE.MOUSE_CLICK_MOVE;

    private _pathSize! : number;
    private _directions : number[] = [];

    public parseMessage(){
        this._pathSize = this._msg.readUint8();
        
        for (let i=0; i < this._pathSize; i++){
            this._directions.unshift(this._msg.readUint8());
        }

        this._msg.seek(this._msg.byteLength);
    }

    protected _internalOperations(): boolean {
        log.debug(`MouseClickMove`);
        if (this._player.isAutoWalking()){
            this._player.stopAutoWalk();
        }

        while(this._directions.length > 0){
            this._player.addWalkTask(this._directions.pop() as WALK_DIRECTION)
        }

        return true;
    }

    protected _networkOperations(): boolean {
        return true;
    }
}