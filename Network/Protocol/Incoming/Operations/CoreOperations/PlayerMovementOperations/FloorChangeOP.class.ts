import log from 'Logger';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { Player } from "Player";
import { MapTile } from "MapTile";
import map from "Map";
import { SendMoveCreatureOperation } from "../../../../Outgoing/SendOperations/CoreSendOperations/SendMoveCreatureOperation.class.ts";
import { SendTextMessageOperation } from "../../../../Outgoing/SendOperations/CoreSendOperations/SendTextMessageOperation.class.ts";
import { OutgoingNetworkMessage } from "../../../../../Lib/OutgoingNetworkMessage.class.ts";
import { SendCancelWalkOperation } from "../../../../Outgoing/SendOperations/CoreSendOperations/SendCancelWalkOperation.class.ts";
import { RETURN_MESSAGE } from "../../../../../../Constants/Game.const.ts";
import { MESSAGE_TYPE } from "../../../../../../Constants/Network.const.ts";

export class FloorChangeOP extends GameOperation {
    constructor(private readonly _player : Player){
        super();
    }

    private _fromTile! : MapTile;
    private _toTile! : MapTile;
    private _oldStackPosition! : number;

    protected _internalOperations(): boolean {
        log.debug(`Player ${this._player.name} is changing floors.`);
        const fromTile = map.getTileAt(this._player.position);

        if (fromTile === null){
            return false;
        }

        this._fromTile = fromTile;

        if (!fromTile.isFloorChange()){
            log.warning(`Player ${this._player.name} tried to change floors but the fromTile doesnt seem to have a floorChange flag.`);
            return false;
        }

        this._oldStackPosition = this._fromTile.getThingStackPos(this._player);
        
        const { x, y, z } = this._player.position;

        if (fromTile.flags.floorChangeNorth){
            log.debug(`Player ${this._player.name} - floor change north.`);
            const toTile = map.getTileAt({ x, y: y-1, z: z-1 });

            if (toTile === null){
                return false;
            }

            this._toTile = toTile;
            return this._player.moveUpNorth();
        }
        else if (fromTile.flags.floorChangeDown){
            log.debug(`Player ${this._player.name} - floor change down.`);
            const toTile = map.getTileAt({ x, y: y+1, z: z+1 });

            if (toTile === null){
                return false;
            }

            this._toTile = toTile;
            return this._player.moveDown();
        }

        return true;
    }

    protected async _networkOperations(walkSuccess = true): Promise<boolean> {
        if (walkSuccess){
            const moveOp = new SendMoveCreatureOperation(this._player, this._fromTile.position, this._toTile.position, this._oldStackPosition);
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

    public async execute(): Promise<void> {
        if (this._internalOperations()){
            await this._networkOperations(true);
        }else{
            await this._networkOperations(false)
        }
    }
}