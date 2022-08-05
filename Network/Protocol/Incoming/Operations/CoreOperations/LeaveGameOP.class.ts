import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendRemoveCreatureByExtIdOperation } from "CoreSendOperations/SendRemoveCreatureByExtIdOperation.class.ts";
import { SendMagicEffectOperation } from "CoreSendOperations/SendMagicEffectOperation.class.ts";

import { MapTile } from "MapTile";

import players from "Players";
import map from "Map";
import db from "DB";

import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class LeaveGameOP extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.LEAVE_GAME;

    protected _internalOperations(): boolean {
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