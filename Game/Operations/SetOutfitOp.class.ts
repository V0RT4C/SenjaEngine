import log from 'Logger';
import { SendCreatureOutfitOperation } from "CoreSendOperations/SendCreatureOutfitOperation.class.ts";
import { GameOperation } from "../GameOperation.abstract.ts";
import { Player } from "../Player/Player.class.ts";

export class SetOutfitOp extends GameOperation {
    constructor(
        private readonly _player : Player, 
        private readonly _lookType: number, 
        private readonly _lookHead: number, 
        private readonly _lookBody: number, 
        private readonly _lookLegs: number, 
        private readonly _lookFeet: number
        ){ 
        super();
    }

    protected _internalOperations(): void {
        log.debug('SetOutfitOp');
        this._player.setOutfit(this._lookType, this._lookHead, this._lookBody, this._lookLegs, this._lookFeet);
    }

    protected async _networkOperations(): Promise<void> {
        const op = new SendCreatureOutfitOperation(this._player.extId, this._player.position, this._lookType, this._lookHead, this._lookBody, this._lookLegs, this._lookFeet);
        await op.execute();
    }
}