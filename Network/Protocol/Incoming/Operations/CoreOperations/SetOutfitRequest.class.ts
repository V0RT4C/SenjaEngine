import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";
import { StaticImplements } from "Decorators";
import { SetOutfitOp } from "Game/Operations/SetOutfitOp.class.ts";
import { IncomingGameRequest } from "../IncomingGameRequest.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class SetOutfitRequest extends IncomingGameRequest {
    public static operationCode = PROTOCOL_RECEIVE.REQUEST_SET_OUTFIT;

    protected _lookType! : number;
    protected _lookHead! : number;
    protected _lookBody! : number;
    protected _lookLegs! : number;
    protected _lookFeet! : number;

    public parseMessage() {
        this._lookType = this._msg.readUint8();
        this._lookHead = this._msg.readUint8();
        this._lookBody = this._msg.readUint8();
        this._lookLegs = this._msg.readUint8();
        this._lookFeet = this._msg.readUint8();
    }

    public async execute(): Promise<void> {
        const op = new SetOutfitOp(this._player, this._lookType, this._lookHead, this._lookBody, this._lookLegs, this._lookFeet);
        await op.execute();
    }
}