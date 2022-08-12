import { PROTOCOL_RECEIVE, SPEAK_TYPE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { CreatureSpeakOp } from "Game/Operations/CreatureSpeakOp.class.ts";
import { IncomingGameRequest } from "../IncomingGameRequest.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class CreatureSpeakRequest extends IncomingGameRequest {
    public static operationCode = PROTOCOL_RECEIVE.SPEAK;

    protected _speakType! : SPEAK_TYPE;
    protected _speakMessage! : string;

    public parseMessage() : void {
        this._speakType = this._msg.readUint8();
        this._speakMessage = this._msg.readString();
    }

    public async execute(): Promise<void> {
        const op = new CreatureSpeakOp(this._player, this._speakType, this._speakMessage, this._player);
        await op.execute();
    }
}