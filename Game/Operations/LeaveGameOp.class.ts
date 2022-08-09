import log from 'Logger';
import players from "Players";
import map from "Map";
import db from "DB";

import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendRemoveCreatureByExtIdOperation } from "CoreSendOperations/SendRemoveCreatureByExtIdOperation.class.ts";
import { SendMagicEffectOperation } from "CoreSendOperations/SendMagicEffectOperation.class.ts";
import { Player } from '../Player/Player.class.ts';
import { MapTile } from "MapTile";
import { GameOperation } from '../GameOperation.abstract.ts';



export class LeaveGameOp extends GameOperation {
    constructor(protected readonly _player : Player){ super(); }

    protected _internalOperations(): boolean {
        log.debug(`LeaveGameOP`)
        const tile : MapTile | null = map.getTileAt(this._player.position);

        if (tile === null){
            return false;
        }

        if (tile.removeCreature(this._player.extId) && players.removePlayer(this._player.id)){
            log.debug(`Saving player`);
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
        await msg.sendToPlayersInAwareRange(this._player.position);
        await this._player.client.close();
        return true;
    }
}