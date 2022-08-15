import log from 'Logger';
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendCloseContainerOperation } from "CoreSendOperations/SendCloseContainerOperation.class.ts";
import { GameOperation } from '../GameOperation.abstract.ts';
import { Player } from '../Player/Player.class.ts';

export class CloseContainerOp extends GameOperation {
    constructor(
        private readonly _player : Player, 
        private readonly _containerId : number
        ){ 
        super(); 
    }

    protected _internalOperations(): void {
        log.debug('CloseContainerOp');
        log.debug(`[CloseContainerOp] - Close container with id ${this._containerId}`);
        this._player.closeContainerById(this._containerId);
    }

    protected async _networkOperations(): Promise<void> {
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendCloseContainerOperation.messageSize);
        SendCloseContainerOperation.writeToNetworkMessage(this._containerId, msg);
        await msg.send();
    }
}