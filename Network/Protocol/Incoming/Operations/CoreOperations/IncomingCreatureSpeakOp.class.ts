import { IncomingGameOp } from "../IncomingGameOp.abstract.ts";
import { PROTOCOL_RECEIVE, SPEAK_TYPE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { CreatureSpeakOp } from "../../../../../Game/Operations/CreatureSpeakOp.class.ts";

@StaticImplements<StaticOperationCode>()
export class IncomingCreatureSpeakOp extends IncomingGameOp {
    public static operationCode = PROTOCOL_RECEIVE.SPEAK;

    protected _speakType! : SPEAK_TYPE;
    protected _speakMessage! : string;

    public parseMessage() : void {
        this._speakType = this._msg.readUint8();
        this._speakMessage = this._msg.readString();
    }

    public async execute(): Promise<void> {
        const op = new CreatureSpeakOp(this._player, this._speakType, this._speakMessage);
        await op.execute();
    }
}