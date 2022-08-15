import log from 'Logger';
import { CHASE_MODE, FIGHT_MODE, SAFE_FIGHT_MODE } from "Constants";
import { GameOperation } from '../GameOperation.abstract.ts';
import { Player } from '../Player/Player.class.ts';
import { SetPlayerModesOP } from 'CoreSendOperations/SetPlayerModesOP.class.ts';

export class PlayerModesOp extends GameOperation {
    constructor(
        protected readonly _player : Player, 
        protected readonly _fightMode : FIGHT_MODE, 
        protected readonly _chaseMode: CHASE_MODE, 
        protected readonly _safeFight: SAFE_FIGHT_MODE
        ){
        super();
    }


    protected _internalOperations(): void {
        log.debug('PlayerModesOp');
        this._player.fightMode = this._fightMode;
        this._player.chaseMode = this._chaseMode;
        this._player.safeFightMode = this._safeFight;
    }

    protected async _networkOperations(): Promise<void> {
        const op = new SetPlayerModesOP(this._player);
        await op.execute();
    }
}