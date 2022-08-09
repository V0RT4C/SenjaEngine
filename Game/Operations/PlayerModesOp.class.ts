import log from 'Logger';
import { CHASE_MODE, FIGHT_MODE, SAFE_FIGHT_MODE } from "Constants";
import { GameOperation } from '../GameOperation.abstract.ts';
import { Player } from '../Player/Player.class.ts';
import { SetPlayerModesOP } from 'CoreSendOperations/SetPlayerModesOP.class.ts';

export class PlayerModesOp extends GameOperation {
    constructor(protected readonly _player : Player, fightMode? : FIGHT_MODE, chaseMode?: CHASE_MODE, safeFight?: SAFE_FIGHT_MODE){
        super();

        if (fightMode){
            this._fightMode = fightMode;
        }

        if (chaseMode){
            this._chaseMode = chaseMode;
        }

        if (safeFight){
            this._safeFight = safeFight;
        }
    }

    protected _fightMode! : FIGHT_MODE;
    protected _chaseMode! : CHASE_MODE;
    protected _safeFight! : SAFE_FIGHT_MODE;

    protected _internalOperations(): boolean {
        log.debug('PlayerModesOp');
        this._player.fightMode = this._fightMode;
        this._player.chaseMode = this._chaseMode;
        this._player.safeFightMode = this._safeFight;
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        const op = new SetPlayerModesOP(this._player);
        await op.execute();
        return true;
    }
}