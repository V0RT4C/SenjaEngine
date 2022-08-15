import log from 'Logger';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Creature } from 'Game/Creature.class.ts';
import { WALK_DIRECTION } from 'Constants/Map.const.ts';

export class CreatureWalkOp extends GameOperation {
    constructor(
        private readonly _creature : Creature,
        private readonly _walkDirection : WALK_DIRECTION,
        private readonly _force? : boolean
    ){ super(); }

    protected _internalOperations(): void {
        log.debug('MoveCreatureOp')
        this._autoWalkCheck();
        if (this._force){
            this._creature.addWalkTask(this._walkDirection, this._force);
        }else{
            this._creature.addWalkTask(this._walkDirection);
        }
    }

    protected async _networkOperations(): Promise<void> {}

    protected _autoWalkCheck(){
        if (this._creature.isAutoWalking()){
            this._creature.stopAutoWalk();
        }
    }
}