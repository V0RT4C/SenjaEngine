import log from 'Logger';
import map from "Map";
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendRemoveThingFromTileOperation } from "CoreSendOperations/SendRemoveThingFromTileOperation.class.ts";
import { AddThingToMapOP } from "CoreSendOperations/AddThingToMapOP.class.ts";
import { MoveCreatureSubOP } from "CoreOperations/MoveThingOperation/MoveCreatureSubOP.class.ts";
import { MoveThingToInventorySubOP } from "CoreOperations/MoveThingOperation/MoveThingToInventorySubOP.class.ts";
import { MoveThingFromInventoryToGroundSubOP} from "CoreOperations/MoveThingOperation/MoveThingFromInventoryToGroundSubOP.class.ts";
import { MoveThingFromInventoryToInventorySubOP } from "CoreOperations/MoveThingOperation/MoveThingFromInventoryToInventorySubOP.class.ts";
import { SendTextMessageOperation } from "CoreSendOperations/SendTextMessageOperation.class.ts";
import { MESSAGE_TYPE, PROTOCOL_RECEIVE, RETURN_MESSAGE, THING_ID } from "Constants";
import { StaticImplements } from "Decorators";
import { IPosition, StaticOperationCode } from "Types";
import { TCP } from 'Dependencies';
import { Thing } from 'Game/Thing.class.ts';
import { MapTile } from 'Game/Map/MapTile.class.ts';



@StaticImplements<StaticOperationCode>()
export class MoveThingOP extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.MOVE_THING;

    protected _fromPosition!: IPosition;
    protected _thingId!: number;
    protected _stackPos!: number;
    protected _toPosition!: IPosition;
    protected _count!: number;
    protected _moveSuccess = true;
    protected _thing! : Thing | null | undefined;

    public parseMessage() {
        this._fromPosition = this._msg.readPosition();
        this._thingId = this._msg.readUint16LE();
        this._stackPos = this._msg.readUint8();
        this._toPosition = this._msg.readPosition();
        this._count = this._msg.readUint8();
    }

    protected async _internalOperations(): Promise<boolean> {
        log.debug('MoveThingOperation');
        if (this._checkIsCreatureMove()) {
            const creatureMove = new MoveCreatureSubOP(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId);
            await creatureMove.execute();
            return false;
        }
        else if (this._checkIsGroundToInventoryMove()){
            const groundToInventoryMove = new MoveThingToInventorySubOP(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId, this._count)
            await groundToInventoryMove.execute();
            return false;
        }
        else if (this._checkIsInventoryToGroundMove()){
            const inventoryToGroundMove = new MoveThingFromInventoryToGroundSubOP(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId, this._count);
            await inventoryToGroundMove.execute();
            return false;
        }
        else if (this._checkIsInventoryToInventoryMove()){
            const inventoryToInventoryMove = new MoveThingFromInventoryToInventorySubOP(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId, this._count);
            await inventoryToInventoryMove.execute();
            return false;
        }
        else {
            return this._moveThingFromGroundToGround();
        }
    }

    protected async _networkOperations(): Promise<boolean> {
        if (this._moveSuccess){
            const msg = new OutgoingNetworkMessage(
                SendRemoveThingFromTileOperation.messageSize +
                AddThingToMapOP.messageSize
            );

            SendRemoveThingFromTileOperation.writeToNetworkMessage(this._fromPosition, this._stackPos, msg);
            SendRemoveThingFromTileOperation.updateContainerSpectators(this._thing, this._fromPosition, this._player);
            AddThingToMapOP.writeToNetworkMessage(this._thingId, this._toPosition, msg);
            await msg.sendToPlayersInAwareRange(this._fromPosition, this._toPosition);
        }else{
            const textMsgOp = new SendTextMessageOperation(RETURN_MESSAGE.NOT_POSSIBLE, MESSAGE_TYPE.WHITE_MESSAGE_SCREEN_BOTTOM, this._msg.client as TCP.Client);
            await textMsgOp.execute();
        }

        return true;
    }

    private _checkIsCreatureMove(){
        if (this._thingId !== THING_ID.CREATURE) {
            return false;
        }else{
            return true;
        }
    }

    private _checkIsGroundToInventoryMove() : boolean {
        if (this._toPosition.x === 0xFFFF && this._fromPosition.x !== 0xFFFF) {
            return true;
        }else{
            return false;
        }
    }

    private _checkIsInventoryToGroundMove() : boolean {
        if (this._fromPosition.x === 0xFFFF && this._toPosition.x !== 0xFFFF){
            return true;
        }else{
            return false;
        }
    }

    private _checkIsInventoryToInventoryMove() : boolean {
        if (this._fromPosition.x === 0xFFFF && this._toPosition.x === 0xFFFF){
            return true;
        }else{
            return false;
        }
    }

    private _moveThingFromGroundToGround() : boolean {
        const fromTile : MapTile | null = map.getTileAt(this._fromPosition);

        if (fromTile !== null){
            const thing : Thing | null = fromTile.getThingByStackPos(this._stackPos);
            this._thing = thing;
        }

        if (map.moveThing(this._fromPosition, this._stackPos, this._toPosition)) {
            this._player.closeDistantContainers();
            return true;
        } else {
            this._moveSuccess = false;
            return true;
        }
    }
}