import { CloseContainerOp } from 'Game/Operations/CloseContainerOp.class.ts';
import { PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from 'Types';
import { IncomingGameRequest } from "../IncomingGameRequest.abstract.ts";


@StaticImplements<StaticOperationCode>()
export class CloseContainerRequest extends IncomingGameRequest {

    public static operationCode : PROTOCOL_RECEIVE = PROTOCOL_RECEIVE.CLOSE_CONTAINER;

    protected _containerId! : number;

    public parseMessage() {
        this._containerId = this._msg.readUint8();
    }

    public async execute(): Promise<void> {
        const op = new CloseContainerOp(this._player, this._containerId);
        await op.execute();
    }
}

