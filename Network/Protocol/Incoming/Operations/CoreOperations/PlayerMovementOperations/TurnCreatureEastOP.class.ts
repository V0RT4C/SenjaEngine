import { IncomingTurnOP } from "CoreOperations/PlayerMovementOperations/IncomingTurnOP.abstract.ts";
import { CREATURE_DIRECTION, PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class TurnCreatureEastOP extends IncomingTurnOP {

    public static operationCode = PROTOCOL_RECEIVE.TURN_EAST;

    protected _doTurn(): CREATURE_DIRECTION {
        return this._player.turnEast();
    }
}