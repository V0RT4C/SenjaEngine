import { GameOperation } from "../../GameOperation.abstract.ts";

export class UseItemOnGroundOp extends GameOperation {
    protected _internalOperations(): boolean {
        // log.debug(`Use item on ground.`);
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        return true;
    }
}