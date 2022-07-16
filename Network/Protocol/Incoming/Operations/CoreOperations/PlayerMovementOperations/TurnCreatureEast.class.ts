import { IncomingTurnOperation } from "CoreOperations/PlayerMovementOperations/IncomingTurnOperation.abstract.ts";
import { CREATURE_DIRECTION, PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class TurnCreatureEast extends IncomingTurnOperation {

    public static operationCode = PROTOCOL_RECEIVE.TURN_EAST;

    protected _doTurn(): CREATURE_DIRECTION {
        return this._player.turnEast();
    }
}