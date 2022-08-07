import { IncomingGameOperation } from "../../IncomingGameOperation.abstract.ts";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import game from "../../../../../../Game/Game.class.ts";
import { ScheduledWalkEvent } from "../../../../../../Game/Events/ScheduledEvents/ScheduledWalkEvent.class.ts";

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
        while(this._directions.length > 0){
            game.addScheduledEvent(new ScheduledWalkEvent(this._player, this._directions.pop() as number));
        }

        return true;
    }

    protected _networkOperations(): boolean {
        return true;
    }
}