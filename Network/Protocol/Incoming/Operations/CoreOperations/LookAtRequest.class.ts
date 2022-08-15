import { PROTOCOL_RECEIVE } from "Constants";
import { IPosition, StaticOperationCode } from "Types";
import { StaticImplements } from "Decorators";
import { LookAtOp } from "Game/Operations/LookAtOp.class.ts";
import { IncomingGameRequest } from "../IncomingGameRequest.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class LookAtRequest extends IncomingGameRequest {
    public static operationCode = PROTOCOL_RECEIVE.LOOK_AT;

    private _position! : IPosition;
    private _thingId! : number;
    private _stackPosition! : number;

    public parseMessage() {
        this._position = this._msg.readPosition();
        this._thingId = this._msg.readUint16LE();
        this._stackPosition = this._msg.readUint8();
    }

    public async execute(): Promise<void> {
        const op = new LookAtOp(this._player, this._position, this._thingId, this._stackPosition);
        await op.execute();
    }
}