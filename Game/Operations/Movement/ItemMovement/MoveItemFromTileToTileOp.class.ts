import { GameOperation } from "Game/GameOperation.abstract.ts";

export class MoveItemFromTileToTileOp extends GameOperation {
    protected _internalOperations(): boolean {
        return true;
    }

    protected _networkOperations(): boolean {
        return true;
    }
}