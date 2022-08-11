import log from 'Logger';
import { GameOperation } from "../GameOperation.abstract.ts";
import { Player } from "../Player/Player.class.ts";

export class FollowCreatureOp extends GameOperation {
    constructor(private readonly player : Player, creatureExtId? : number){
        super();

        if (creatureExtId){
            this._creatureExtId = creatureExtId;
        }
    }

    protected _creatureExtId! : number;

    protected _internalOperations(): boolean {
        log.debug(`FollowCreatureOp`);
        return true;
    }

    protected _networkOperations(): boolean {
        return true;
    }
}