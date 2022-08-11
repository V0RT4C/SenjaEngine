import { FollowCreatureOp } from "Game/Operations/FollowCreatureOp.class.ts";
import { PROTOCOL_RECEIVE } from "Constants/Network.const.ts";
import { StaticImplements, IncomingGameOperation } from "Decorators";
import { IIncomingGameOperation, StaticOperationCode } from "Types";

@IncomingGameOperation()
@StaticImplements<StaticOperationCode>()
export class IncomingFollowCreatureOp extends FollowCreatureOp {

    public static operationCode = PROTOCOL_RECEIVE.FOLLOW;

    public parseMessage(){
        this._creatureExtId = this._msg.readUint32LE();
    }
}

export interface IncomingFollowCreatureOp extends IIncomingGameOperation {};