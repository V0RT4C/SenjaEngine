import { IncomingTurnOperation } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/IncomingTurnOperation.abstract.ts";
import { CREATURE_DIRECTION, PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class TurnCreatureWest extends IncomingTurnOperation {

    public static operationCode = PROTOCOL_RECEIVE.TURN_WEST;

    protected _doTurn() : CREATURE_DIRECTION {
        return this._player.turnWest();
    }
}