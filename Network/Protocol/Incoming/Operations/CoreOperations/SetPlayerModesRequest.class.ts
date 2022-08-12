import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { PlayerModesOp } from 'Game/Operations/PlayerModesOp.class.ts';
import { IncomingGameRequest } from "../IncomingGameRequest.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class SetPlayerModesRequest extends IncomingGameRequest {

    public static operationCode = PROTOCOL_RECEIVE.CHANGE_FIGHT_MODE;

    protected _fightMode! : number;
    protected _chaseMode! : number;
    protected _safeFight! : number;

    public parseMessage(){
        this._fightMode = this._msg.readUint8();
        this._chaseMode = this._msg.readUint8();
        this._safeFight = this._msg.readUint8();
    }

    public async execute(): Promise<void> {
        const op = new PlayerModesOp(this._player, this._fightMode, this._chaseMode, this._safeFight);
        await op.execute();
    }
}