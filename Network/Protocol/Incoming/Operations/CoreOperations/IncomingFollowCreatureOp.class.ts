import { FollowCreatureOp } from "Game/Operations/FollowCreatureOp.class.ts";
import { PROTOCOL_RECEIVE } from "Constants/Network.const.ts";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { IncomingGameOp } from "../IncomingGameOp.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class IncomingFollowCreatureOp extends IncomingGameOp {

    public static operationCode = PROTOCOL_RECEIVE.FOLLOW;
    protected _creatureExtId! : number;

    public parseMessage(){
        this._creatureExtId = this._msg.readUint32LE();
    }

    public async execute(): Promise<void> {
        const op = new FollowCreatureOp(this._player, this._creatureExtId);
        await op.execute();
    }
}