import { CREATURE_DIRECTION } from "Constants/Map.const.ts";
import { SendCreatureDirectionOperation } from "Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendCreatureDirectionOperation.class.ts";
import { Creature } from "Game/Creature.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";

export class CreatureTurnOp extends GameOperation {
    constructor(
        private readonly _creature : Creature,
        private readonly _turnDirection : CREATURE_DIRECTION
    ){ super(); }

    protected _internalOperations(): void {
        switch(this._turnDirection){
            case CREATURE_DIRECTION.NORTH:
                this._creature.turnNorth();
                break;
            case CREATURE_DIRECTION.EAST:
                this._creature.turnEast();
                break;
            case CREATURE_DIRECTION.SOUTH:
                this._creature.turnSouth();
                break;
            case CREATURE_DIRECTION.WEST:
                this._creature.turnWest();
                break;
        }
    }

    protected async _networkOperations(): Promise<void> {
        const op = new SendCreatureDirectionOperation(this._creature, this._turnDirection);
        await op.execute();
    }
}