import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements, IncomingGameOperation } from "Decorators";
import { IIncomingGameOperation, StaticOperationCode } from "Types";
import { PlayerModesOp } from 'Game/Operations/PlayerModesOp.class.ts';

@IncomingGameOperation()
@StaticImplements<StaticOperationCode>()
export class IncomingPlayerModesOp extends PlayerModesOp {

    public static operationCode = PROTOCOL_RECEIVE.CHANGE_FIGHT_MODE;

    public parseMessage(){
        this._fightMode = this._msg.readUint8();
        this._chaseMode = this._msg.readUint8();
        this._safeFight = this._msg.readUint8();
    }
}

export interface IncomingPlayerModesOp extends IIncomingGameOperation {};