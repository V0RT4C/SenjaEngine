import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { MoveCreatureSubOperation } from "ProtocolIncoming/Operations/CoreOperations/MoveThingOperation/MoveCreatureSubOperation.class.ts";
import { MoveThingFromInventoryToGroundSubOperation } from "ProtocolIncoming/Operations/CoreOperations/MoveThingOperation/MoveThingFromInventoryToGroundSubOperation.class.ts";
import { MoveThingToInventorySubOperation } from "ProtocolIncoming/Operations/CoreOperations/MoveThingOperation/MoveThingToInventorySubOperation.class.ts";
import { SendRemoveThingFromTileOperation } from "OutgoingSendOperations/CoreSendOperations/SendRemoveThingFromTileOperation.class.ts";
import { SendAddThingToMapOperation } from "OutgoingSendOperations/CoreSendOperations/SendAddThingToMapOperation.class.ts";
import { MoveThingFromInventoryToInventorySubOperation } from "ProtocolIncoming/Operations/CoreOperations/MoveThingOperation/MoveThingFromInventoryToInventorySubOperation.class.ts";

import map from "Map";

import { PROTOCOL_RECEIVE, THING_ID } from "Constants";
import { StaticImplements } from "Decorators";
import { IPosition, StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class MoveThingOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.MOVE_THING;

    protected _fromPosition!: IPosition;
    protected _thingId!: number;
    protected _stackPos!: number;
    protected _toPosition!: IPosition;
    protected _count!: number;

    public parseMessage() {
        this._fromPosition = this._msg.readPosition();
        this._thingId = this._msg.readUint16LE();
        this._stackPos = this._msg.readUint8();
        this._toPosition = this._msg.readPosition();
        this._count = this._msg.readUint8();
    }

    protected async _internalOperations(): Promise<boolean> {
        if (this._checkIsCreatureMove()) {
            const creatureMove = new MoveCreatureSubOperation(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId);
            await creatureMove.execute();
            return false;
        }
        else if (this._checkIsGroundToInventoryMove()){
            const groundToInventoryMove = new MoveThingToInventorySubOperation(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId, this._count)
            await groundToInventoryMove.execute();
            return false;
        }
        else if (this._checkIsInventoryToGroundMove()){
            const inventoryToGroundMove = new MoveThingFromInventoryToGroundSubOperation(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId, this._count);
            await inventoryToGroundMove.execute();
            return false;
        }
        else if (this._checkIsInventoryToInventoryMove()){
            const inventoryToInventoryMove = new MoveThingFromInventoryToInventorySubOperation(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId, this._count);
            await inventoryToInventoryMove.execute();
            //console.log('Is inventory to inventory move');
            //console.log({ pos: this._fromPosition, thingId: this._thingId, stackPos: this._stackPos, toPos: this._toPosition, count: this._count });
            return false;
        }
        else {
            return this._moveThingFromGroundToGround();
        }
    }

    protected async _networkOperations(): Promise<boolean> {
        const msg = new OutgoingNetworkMessage(
            SendRemoveThingFromTileOperation.messageSize +
            SendAddThingToMapOperation.messageSize
        );

        SendRemoveThingFromTileOperation.writeToNetworkMessage(this._fromPosition, this._stackPos, msg);
        SendAddThingToMapOperation.writeToNetworkMessage(this._thingId, this._toPosition, msg);
        await msg.sendToPlayersInAwareRange(this._fromPosition, this._toPosition);

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
        if (map.moveThing(this._fromPosition, this._stackPos, this._toPosition)) {
            return true;
        } else {
            return false;
        }
    }
}