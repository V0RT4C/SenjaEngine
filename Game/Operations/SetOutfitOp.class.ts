import { SendCreatureOutfitOperation } from "CoreSendOperations/SendCreatureOutfitOperation.class.ts";
import { GameOperation } from "../GameOperation.abstract.ts";
import { Player } from "../Player/Player.class.ts";

export class SetOutfitOp extends GameOperation {
    constructor(protected readonly _player : Player, lookType?: number, lookHead?: number, lookBody?: number, lookLegs?: number, lookFeet?: number){ 
        super();

        if (lookType){
            this._lookType = lookType;
        }

        if (lookHead){
            this._lookHead = lookHead;
        }

        if (lookBody){
            this._lookBody = lookBody;
        }

        if (lookLegs){
            this._lookLegs = lookLegs;
        }

        if (lookFeet){
            this._lookFeet = lookFeet;
        }
    }
    protected _lookType!: number;
    protected _lookHead!: number;
    protected _lookBody!: number;
    protected _lookLegs!: number;
    protected _lookFeet!: number;

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