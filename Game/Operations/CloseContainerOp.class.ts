import log from 'Logger';
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendCloseContainerOperation } from "CoreSendOperations/SendCloseContainerOperation.class.ts";
import { GameOperation } from '../GameOperation.abstract.ts';
import { Player } from '../Player/Player.class.ts';

export class CloseContainerOp extends GameOperation {
    constructor(protected readonly _player : Player, containerId? : number){ 
        super(); 
        if (containerId){
            this._containerId = containerId;
        }
    }

    protected _containerId! : number;

    protected _internalOperations(): boolean {
        log.debug('CloseContainerOp');
        log.debug(`Close container with id ${this._containerId}`);
        return this._player.closeContainerById(this._containerId);
    }

    protected async _networkOperations(): Promise<boolean> {
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendCloseContainerOperation.messageSize);
        SendCloseContainerOperation.writeToNetworkMessage(this._containerId, msg);
        await msg.send();
        return true;
    }
}