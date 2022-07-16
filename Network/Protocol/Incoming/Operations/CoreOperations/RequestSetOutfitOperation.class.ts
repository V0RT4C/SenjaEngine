import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendCreatureOutfitOperation } from "CoreSendOperations/SendCreatureOutfitOperation.class.ts";
import { Player } from "Player";

import players from "Game/Player/Players.class.ts";

import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";
import { StaticImplements } from "Decorators";

@StaticImplements<StaticOperationCode>()
export class RequestSetOutfitOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.REQUEST_SET_OUTFIT;

    private _player! : Player;
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
        const player : Player | null = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (player === null){
            return false;
        }

        this._player = player;
        console.log({ lookType: this._lookType, lookHead: this._lookHead, lookBody: this._lookBody, lookLegs: this._lookLegs, lookFeet: this._lookFeet });
        this._player.setOutfit(this._lookType, this._lookHead, this._lookBody, this._lookLegs, this._lookFeet);
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        const op = new SendCreatureOutfitOperation(this._player.extId, this._player.position, this._lookType, this._lookHead, this._lookBody, this._lookLegs, this._lookFeet);
        await op.execute();
        return true;
    }
}