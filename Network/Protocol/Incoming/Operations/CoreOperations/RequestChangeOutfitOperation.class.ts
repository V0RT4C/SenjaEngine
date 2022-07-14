import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendEditOutfitOperation } from "OutgoingSendOperations/CoreSendOperations/SendEditOutfitOperation.class.ts";
import { Player } from "Player";

import players from "Game/Player/Players.class.ts";

import { StaticOperationCode } from "Types";
import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";

@StaticImplements<StaticOperationCode>()
export class RequestChangeOutfitOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.REQUEST_CHANGE_OUTFIT;

    private _player! : Player;

    protected _internalOperations(): boolean {
        console.log('Player requested to change outfit');
        const player : Player | null = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (player === null){
            return false;
        }

        this._player = player;
        return true;
    }

    protected async _networkOperations(): Promise<boolean> {
        const op = new SendEditOutfitOperation(this._player);
        await op.execute();
        return true;
    }
}