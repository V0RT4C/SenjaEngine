import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendMagicEffectOperation } from "OutgoingSendOperations/CoreSendOperations/SendMagicEffectOperation.class.ts";
import { SendRemoveCreatureByExtIdOperation } from "OutgoingSendOperations/CoreSendOperations/SendRemoveCreatureByExtIdOperation.class.ts";
import { Player } from "Player";
import { MapTile } from "MapTile";

import players from "Players";
import map from "Map";
import db from "DB";

import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class LeaveGameOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.LEAVE_GAME;
    private _player! : Player;

    protected _internalOperations(): boolean {
        const player : Player | null = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (player === null){
            return false;
        }

        this._player = player;
        const tile : MapTile | null = map.getTileAt(this._player.position);

        if (tile === null){
            return false;
        }

        if (tile.removeCreature(this._player.extId) && players.removePlayer(this._player.id)){
            db.savePlayer(this._player);
            return true;
        }else{
            return false;
        }

    }

    protected async _networkOperations(): Promise<boolean> {
        const msg = new OutgoingNetworkMessage(SendRemoveCreatureByExtIdOperation.messageSize + SendMagicEffectOperation.messageSize);
        SendRemoveCreatureByExtIdOperation.writeToNetworkMessage(this._player.extId, msg);
        SendMagicEffectOperation.writeToNetworkMessage(3, this._player.position, msg);
        await msg.sendToSpectators(this._player.position);
        await this._player.client.close();
        return true;
    }
}