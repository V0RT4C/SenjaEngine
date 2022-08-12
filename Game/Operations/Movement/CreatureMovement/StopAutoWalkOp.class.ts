import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from "Game/Player/Player.class.ts";

export class StopAutoWalkOp extends GameOperation {
    constructor(
        private readonly _player : Player
    ){super();}

    protected _internalOperations(): void {
        if (this._player.isAutoWalking()){
            this._player.stopAutoWalk();
        }
    }

    protected async _networkOperations(): Promise<void> {}
}