import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { PROTOCOL_RECEIVE } from "Constants";
import { WALK_DIRECTION } from "Constants/Map.const.ts";
import { CreatureWalkOp } from "Game/Operations/Movement/CreatureMovement/CreatureWalkOp.ts";
import { IncomingGameRequest } from "../../../IncomingGameRequest.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class MoveWestRequest extends IncomingGameRequest {

    public static operationCode = PROTOCOL_RECEIVE.MOVE_WEST;

    public async execute(): Promise<void> {
        const op = new CreatureWalkOp(this._player, WALK_DIRECTION.WEST);
        await op.execute();
    }
}