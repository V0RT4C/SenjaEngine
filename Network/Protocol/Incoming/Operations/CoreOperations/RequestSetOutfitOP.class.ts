import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendCreatureOutfitOperation } from "CoreSendOperations/SendCreatureOutfitOperation.class.ts";

import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";
import { StaticImplements } from "Decorators";

@StaticImplements<StaticOperationCode>()
export class RequestSetOutfitOP extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.REQUEST_SET_OUTFIT;

    private _lookType!: number;
    private _lookHead!: number;
    private _lookBody!: number;
    private _lookLegs!: number;
    private _lookFeet!: number;

    public parseMessage() {
        this._lookType = this._msg.readUint8();
        this._lookHead = this._msg.readUint8();
        this._lookBody = this._msg.readUint8();
        this._lookLegs = this._msg.readUint8();
        this._lookFeet = this._msg.readUint8();
    }

    protected _internalOperations(): boolean {
        this._player.setOutfit(this._lookType, this._lookHead, this._lookBody, this._lookLegs, this._lookFeet);
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        const op = new SendCreatureOutfitOperation(this._player.extId, this._player.position, this._lookType, this._lookHead, this._lookBody, this._lookLegs, this._lookFeet);
        await op.execute();
        return true;
    }
}