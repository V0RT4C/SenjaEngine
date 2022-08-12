import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { StopAutoWalkOp } from "Game/Operations/Movement/CreatureMovement/StopAutoWalkOp.class.ts";
import { IncomingGameRequest } from "../../../IncomingGameRequest.abstract.ts";

@StaticImplements<StaticOperationCode>()
export class StopAutoWalkRequest extends IncomingGameRequest {
    public static operationCode = PROTOCOL_RECEIVE.STOP_AUTO_WALK;
    
    public async execute(): Promise<void> {
        const op = new StopAutoWalkOp(this._player);
        await op.execute();
    }
}