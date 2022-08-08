import log from 'Logger';
import map from "Map";

import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendMoveCreatureOperation } from "CoreSendOperations/SendMoveCreatureOperation.class.ts";
import { SendTextMessageOperation } from "CoreSendOperations/SendTextMessageOperation.class.ts";
import { FloorChangeOP } from "../PlayerMovementOperations/FloorChangeOP.class.ts";
import { Creature } from "Creature";
import game from "Game";
import { TCP } from 'Dependencies';
import { MESSAGE_TYPE, THING_ID } from "Constants";
import { IPosition } from "Types";



export class MoveCreatureSubOP extends IncomingGameOperation {
    constructor(
        protected _msg : IncomingNetworkMessage,
        private _fromPosition : IPosition,
        private _toPosition : IPosition,
        private _stackPos : number,
        private _thingId : number
    ) { super(_msg);}

    private _creature! : Creature;
    private _newStackPos! : number;

    public async execute(): Promise<void> {
        if (this._internalOperations()){
            await this._networkOperations(true);
        }else{
            await this._networkOperations(false)
        }
    }

    protected _internalOperations(): boolean {
        log.debug(`MoveCreatureSubOP`);
        if (this._thingId !== THING_ID.CREATURE) {
            return false;
        }

        if (Math.abs(this._fromPosition.x - this._toPosition.x) > 1 ||
            Math.abs(this._fromPosition.y - this._toPosition.y) > 1){
            return false;
        }

        const creature : Creature | null = map.moveCreatureByStackPos(this._fromPosition, this._toPosition, this._stackPos);

        if (creature !== null) {
            const tile = map.getTileAt(this._toPosition);
            creature.setDirectionFromPositions(this._fromPosition, this._toPosition);

            if (tile === null) {
                return false;
            } else {
                if (tile.creatures.length === 0) {
                    return false;
                } else {
                    this._creature = creature;
                    this._newStackPos = tile.getThingStackPos(this._creature);
            
                    if (this._creature === this._player && tile.isFloorChange()){
                        game.addOperation(new FloorChangeOP(this._player));
                    }
                }
            }
            return true;
        } else {
            return false;
        }
    }

    protected async _networkOperations(moveSuccess : boolean): Promise<boolean> {
        if (moveSuccess){
            const moveOp = new SendMoveCreatureOperation(this._creature, this._fromPosition, this._toPosition, this._stackPos);
            await moveOp.execute();
        }else{
            const msg = OutgoingNetworkMessage
                            .withClient(this._msg.client as TCP.Client,
                                SendTextMessageOperation.messageSize
                            );

            SendTextMessageOperation.writeToNetworkMessage('Sorry not possible.', MESSAGE_TYPE.WHITE_MESSAGE_SCREEN_BOTTOM, msg);
            await msg.send();
        }
        return true;
    }
}