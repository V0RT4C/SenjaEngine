import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendMoveCreatureOperation } from "CoreSendOperations/SendMoveCreatureOperation.class.ts";
import { SendTextMessageOperation } from "CoreSendOperations/SendTextMessageOperation.class.ts";
import { SendCancelWalkOperation } from "CoreSendOperations/SendCancelWalkOperation.class.ts";
import { Player } from "Player";
import { MapTile } from "MapTile";
import map from "Map";
import players from "Game/Player/Players.class.ts";
import { MESSAGE_TYPE, RETURN_MESSAGE } from "Constants";
import { IPosition } from "Types";

export abstract class IncomingMoveOperation extends IncomingGameOperation {
    //public static operationCode : number;
    protected _player! : Player;
    protected _oldPosition!: IPosition;
    protected _newPosition!: IPosition;
    protected _oldStackPosition!: number;

    public async execute(): Promise<void> {
        if (this._internalOperations()){
            await this._networkOperations(true);
        }else{
            await this._networkOperations(false)
        }
    }

    protected abstract _doMove() : boolean;

    protected _internalOperations() : boolean {
        const player : Player | null = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (player === null){
            return false;
        }

        this._player = player;
        this._oldPosition = player.position;
        const oldTile : MapTile | null = map.getTileAt(this._oldPosition);
        if (oldTile === null){
            return false;
        }

        this._oldStackPosition = oldTile.getThingStackPos(this._player);
        if (this._oldStackPosition === -1){
            return false;
        }

        const moveSuccess = this._doMove();
        if (moveSuccess){
            this._newPosition = this._player.position;
            return true;
        }else{
            return false;
        }
    }

    protected async _networkOperations(walkSuccess : boolean): Promise<boolean> {
        if (walkSuccess){
            const moveOp = new SendMoveCreatureOperation(this._player, this._oldPosition, this._newPosition, this._oldStackPosition, this._oldStackPosition);
            await moveOp.execute();
            const posMsgOp = new SendTextMessageOperation(`Position: { x: ${this._player.position.x}, y: ${this._player.position.y}, z: ${this._player.position.z} }`, MESSAGE_TYPE.PURPLE_MESSAGE_CONSOLE, this._player.client);
            await posMsgOp.execute();
            return true;
        }else{
            const msg = OutgoingNetworkMessage
                            .withClient(this._player.client,
                                SendCancelWalkOperation.messageSize +
                                SendTextMessageOperation.messageSize
                            );

            SendCancelWalkOperation.writeToNetworkMessage(this._player.direction, msg);
            SendTextMessageOperation.writeToNetworkMessage(RETURN_MESSAGE.NOT_POSSIBLE, MESSAGE_TYPE.WHITE_MESSAGE_SCREEN_BOTTOM_AND_CONSOLE, msg);
            await msg.send();
            return false;
        }
    }
}