import { CREATURE_DIRECTION, PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { CreatureTurnOp } from "Game/Operations/Movement/CreatureMovement/CreatureTurnOp.class.ts";
import { IncomingGameRequest } from "../../../IncomingGameRequest.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class TurnWestRequest extends IncomingGameRequest {

    public static operationCode = PROTOCOL_RECEIVE.TURN_WEST;

    public async execute(): Promise<void> {
        const op = new CreatureTurnOp(this._player, CREATURE_DIRECTION.WEST);
        await op.execute();
    }
}