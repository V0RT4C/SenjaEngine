import { IPosition } from "../../../../@types/App.d.ts";
import { RETURN_MESSAGE } from "../../../../Constants/Game.const.ts";
import { CREATURE_DIRECTION } from "../../../../Constants/Map.const.ts";
import { OutgoingNetworkMessage } from "../../../../Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendMagicEffectOperation } from "../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendMagicEffectOperation.class.ts";
import { SendMoveCreatureOperation } from "../../../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendMoveCreatureOperation.class.ts";
import { SendCreatureDirectionOperation } from "CoreSendOperations/SendCreatureDirectionOperation.class.ts";
import { Creature } from "../../../Creature.class.ts";
import { GameOperation } from "../../../GameOperation.abstract.ts";
import map from "../../../Map/Map.class.ts";

export class TeleportCreatureOp extends GameOperation {
    constructor(
        private _creature : Creature,
        private _fromPosition : IPosition,
        private _toPosition : IPosition
    ){ super(); }

    private _cancelMessage : string | undefined;
    private _oldStackPosition! : number;

    protected _internalOperations(): void {
        const stackPosition = this._creature.getStackPosition();

        if (stackPosition === -1){
            this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
            return;
        }

        this._oldStackPosition = stackPosition;

        if (map.teleportThing(this._fromPosition, stackPosition, this._toPosition)){
            return;
        }else{
            this._cancelMessage = RETURN_MESSAGE.NOT_POSSIBLE;
        }
    }

    protected async _networkOperations(): Promise<void> {
        const op = new SendMoveCreatureOperation(this._creature, this._fromPosition, this._toPosition, this._oldStackPosition, true);
        await op.execute();

        const msg = new OutgoingNetworkMessage(SendMagicEffectOperation.messageSize + SendCreatureDirectionOperation.messageSize);
        SendCreatureDirectionOperation.writeToNetworkMessage(this._creature.extId, CREATURE_DIRECTION.SOUTH, msg);
        SendMagicEffectOperation.writeToNetworkMessage(11, this._creature.position, msg);
        await msg.sendToPlayersInAwareRange(this._creature.position);
    }
}