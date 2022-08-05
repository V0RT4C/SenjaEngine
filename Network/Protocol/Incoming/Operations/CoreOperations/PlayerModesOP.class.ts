import log from 'Logger';
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { CHASE_MODE, FIGHT_MODE, PROTOCOL_RECEIVE, SAFE_FIGHT_MODE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { SetPlayerModesOP } from "../../../Outgoing/SendOperations/CoreSendOperations/SetPlayerModesOP.class.ts";

@StaticImplements<StaticOperationCode>()
export class PlayerModesOP extends IncomingGameOperation {

    public static operationCode = PROTOCOL_RECEIVE.CHANGE_FIGHT_MODE;

    private _fightMode! : FIGHT_MODE;
    private _chaseMode! : CHASE_MODE;
    private _safeFight! : SAFE_FIGHT_MODE;

    public parseMessage(){
        this._fightMode = this._msg.readUint8();
        this._chaseMode = this._msg.readUint8();
        this._safeFight = this._msg.readUint8();
    }

    protected _internalOperations(): boolean {
        log.debug('PlayerModesOP');
        this._player.fightMode = this._fightMode;
        this._player.chaseMode = this._chaseMode;
        this._player.safeFightMode = this._safeFight;
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        const op = new SetPlayerModesOP(this._player, this._player.client);
        await op.execute();
        return true;
    }
}