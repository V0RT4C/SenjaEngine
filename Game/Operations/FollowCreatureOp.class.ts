import log from 'Logger';
import { GameOperation } from "../GameOperation.abstract.ts";
import { Player } from "../Player/Player.class.ts";

export class FollowCreatureOp extends GameOperation {
    constructor(
        protected readonly player : Player, 
        protected readonly creatureExtId : number
        ){
        super();
    }

    protected _internalOperations(): void {
        log.debug(`FollowCreatureOp`);
    }

    protected async _networkOperations(): Promise<void> {}
}