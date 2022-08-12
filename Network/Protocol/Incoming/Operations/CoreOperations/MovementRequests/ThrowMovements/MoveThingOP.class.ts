import log from 'Logger';
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { PROTOCOL_RECEIVE, THING_ID } from "Constants";
import { StaticImplements } from "Decorators";
import { IPosition, StaticOperationCode } from "Types";
import { Thing } from 'Game/Thing.class.ts';
import { MoveItemFromGroundToContainerOp } from 'Game/Operations/Movement/ItemMovement/MoveItemFromGroundToContainerOp.class.ts';
import { MoveItemFromGroundToInventorySlot } from 'Game/Operations/Movement/ItemMovement/MoveItemFromGroundToInventorySlotOp.class.ts'
import { MoveCreatureSubOP } from './MoveCreatureSubOP.class.ts';
import { MoveItemFromInventoryToGround } from '../../../../../../../Game/Operations/Movement/ItemMovement/MoveItemFromInventoryToGroundOp.class.ts';
import { MoveItemFromContainerToGroundOp } from '../../../../../../../Game/Operations/Movement/ItemMovement/MoveItemFromContainerToGroundOp.class.ts';
import { MoveItemFromContainerToInventorySlotOp } from '../../../../../../../Game/Operations/Movement/ItemMovement/MoveItemFromContainerToInventorySlotOp.class.ts';
import { MoveItemFromInventoryToContainerOp } from '../../../../../../../Game/Operations/Movement/ItemMovement/MoveItemFromInventoryToContainerOp.class.ts';
import { MoveThingFromTileToTileOp } from '../../../../../../../Game/Operations/Movement/ItemMovement/MoveThingFromTileToTileOp.class.ts';
import { MoveItemFromContainerToContainerOp } from '../../../../../../../Game/Operations/Movement/ItemMovement/MoveItemFromContainerToContainerOp.class.ts';
import { MoveItemFromInventorySlotToInventorySlot } from '../../../../../../../Game/Operations/Movement/ItemMovement/MoveItemFromInventorySlotToInventorySlotOp.class.ts';


@StaticImplements<StaticOperationCode>()
export class MoveThingOP extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.MOVE_THING;

    protected _fromPosition!: IPosition;
    protected _thingId!: number;
    protected _stackPos!: number;
    protected _toPosition!: IPosition;
    protected _count!: number;
    protected _moveSuccess = false;
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

        if (this._isCreatureMove()) {
            const creatureMove = new MoveCreatureSubOP(this._msg, this._fromPosition, this._toPosition, this._stackPos, this._thingId);
            await creatureMove.execute();
            return false;
        }
        else if (this._isGroundToInventoryMove()){
            if (this._toPosition.x === 0xFFFF && this._fromPosition.x !== 0xFFFF) {

                if (this._isToContainerMove()){
                    const containerId = this._toPosition.y & 0x0F;
                    const _containerSlotId = this._toPosition.z;
                    const op = new MoveItemFromGroundToContainerOp(this._player, this._fromPosition, this._stackPos, containerId);
                    await op.execute();
                }else{
                    const inventorySlotId = this._toPosition.y;
                    const op = new MoveItemFromGroundToInventorySlot(this._player, this._fromPosition, this._stackPos, inventorySlotId);
                    await op.execute();
                }
            }
            return false;
        }
        else if (this._isInventoryToGroundMove()){
            if (this._isFromContainerMove()){
                const containerId = this._fromPosition.y & 0x0F;
                const containerSlotId = this._fromPosition.z;
                const op = new MoveItemFromContainerToGroundOp(this._player, containerId, containerSlotId, this._toPosition);
                await op.execute();
            }else{
                const inventorySlotId = this._fromPosition.y;
                const op = new MoveItemFromInventoryToGround(this._player, inventorySlotId, this._toPosition);
                await op.execute();
            }
            return false;
        }
        else if (this._isInventoryToInventoryMove()){
            if (this._isFromContainerMove()){
                const containerId = this._fromPosition.y & 0x0F;
                const containerSlotId = this._fromPosition.z;

                if (this._isToContainerMove()){
                    const toContainerId = this._toPosition.y & 0x0F;
                    const op = new MoveItemFromContainerToContainerOp(this._player, containerId, containerSlotId, toContainerId);
                    await op.execute();
                }else{
                    const inventorySlotId = this._toPosition.y;
                    const op = new MoveItemFromContainerToInventorySlotOp(this._player, containerId, containerSlotId, inventorySlotId);
                    await op.execute();
                }
            }else{
                const inventorySlotId = this._fromPosition.y;

                if (this._isToContainerMove()){
                    const containerId = this._toPosition.y & 0x0F;
                    const op = new MoveItemFromInventoryToContainerOp(this._player, inventorySlotId, containerId);
                    await op.execute();
                }else{
                    const toInventorySlotId = this._toPosition.y;
                    const op = new MoveItemFromInventorySlotToInventorySlot(this._player, inventorySlotId, toInventorySlotId);
                    await op.execute();
                }
            }
            return false;
        }
        else {
            const op = new MoveThingFromTileToTileOp(this._player, this._fromPosition, this._stackPos, this._toPosition);
            await op.execute();
        }

        return false;
    }

    protected async _networkOperations(): Promise<void> {}

    private _isCreatureMove(){
        if (this._thingId !== THING_ID.CREATURE) {
            return false;
        }else{
            return true;
        }
    }

    private _isGroundToInventoryMove() : boolean {
        if (this._toPosition.x === 0xFFFF && this._fromPosition.x !== 0xFFFF) {
            return true;
        }else{
            return false;
        }
    }

    private _isInventoryToGroundMove() : boolean {
        if (this._fromPosition.x === 0xFFFF && this._toPosition.x !== 0xFFFF){
            return true;
        }else{
            return false;
        }
    }

    private _isInventoryToInventoryMove() : boolean {
        if (this._fromPosition.x === 0xFFFF && this._toPosition.x === 0xFFFF){
            return true;
        }else{
            return false;
        }
    }

    private _isToContainerMove() : boolean {
        return (0x40 & this._toPosition.y) >= 64;
    }

    private _isFromContainerMove() : boolean {
        return (0x40 & this._fromPosition.y) >= 64;
    }
}