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

    private _opFailed = false;

    protected _internalOperations(): void {
        log.debug(`LeaveGameOP`)
        const tile : MapTile | null = map.getTileAt(this._player.position);

        if (tile === null){
            this._opFailed = true;
            return;
        }

        if (tile.removeCreature(this._player.extId) && players.removePlayer(this._player.id)){
            log.debug(`[LeaveGameOp] - Saving player`);
            db.savePlayer(this._player);
            return;
        }else{
            log.debug('[LeaveGameOp] - Failed');
            this._opFailed = true;
            return;
        }

    }

    protected async _networkOperations(): Promise<void> {
        if (!this._opFailed){
            const msg = new OutgoingNetworkMessage(SendRemoveCreatureByExtIdOperation.messageSize + SendMagicEffectOperation.messageSize);
            SendRemoveCreatureByExtIdOperation.writeToNetworkMessage(this._player.extId, msg);
            SendMagicEffectOperation.writeToNetworkMessage(3, this._player.position, msg);
            await msg.sendToPlayersInAwareRange(this._player.position);
            await this._player.client.close();
        }
    }
}