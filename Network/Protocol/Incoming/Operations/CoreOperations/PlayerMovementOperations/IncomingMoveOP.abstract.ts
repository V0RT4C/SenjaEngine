import log from 'Logger';
import map from "Map";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendCancelMessageOperation } from "CoreSendOperations/SendCancelMessageOperation.class.ts";
import { MapTile } from "MapTile";
import { MESSAGE_TYPE, RETURN_MESSAGE } from "Constants";
import { IPosition } from "Types";
import { SendCancelWalkOperation } from '../../../../Outgoing/SendOperations/CoreSendOperations/SendCancelWalkOperation.class.ts';

export abstract class IncomingMoveOP extends IncomingGameOperation {
    //public static operationCode : number;
    protected _oldPosition!: IPosition;
    protected _newPosition!: IPosition;
    protected _oldStackPosition!: number;

    protected abstract _doMove() : boolean;

    public async execute(): Promise<void> {
        if (!this._internalOperations()){
            await this._networkOperations();
        }
    }

    protected _internalOperations() : boolean {
        log.debug(`IncomingMoveOP`);

        if (!this._player.isAllowedToWalk()){
            return false;
        }

        this._oldPosition = this._player.position;
        const oldTile : MapTile | null = map.getTileAt(this._oldPosition);
        if (oldTile === null){
            return false;
        }

        this._oldStackPosition = oldTile.getThingStackPos(this._player);
        if (this._oldStackPosition === -1){
            return false;
        }

        return this._doMove();
    }

    protected async _networkOperations(): Promise<boolean> {
        const cancelWalkOp = new SendCancelWalkOperation(this._player);
        await cancelWalkOp.execute();

        if (this._player.isAllowedToWalk()){
            const cancelMsgOp = new SendCancelMessageOperation(RETURN_MESSAGE.NOT_POSSIBLE, this._player.client);
            await cancelMsgOp.execute();
        }
        
        return true;
    }
}