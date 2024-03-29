import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { PROTOCOL_SEND } from "Constants";
import { TCP } from 'Dependencies';

export class AddThingToContainerOP implements OutgoingSendOperation {
    constructor(
        private readonly _containerId : number,
        private readonly _thingId : number,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 4;

    public static writeToNetworkMessage(containerId : number, thingId : number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.ADD_TO_CONTAINER);
        msg.writeUint8(containerId);
        msg.writeUint16LE(thingId);
    }

    async execute(): Promise<void> {
        const msg = OutgoingNetworkMessage.withClient(this._client, AddThingToContainerOP.messageSize);
        AddThingToContainerOP.writeToNetworkMessage(this._containerId, this._thingId, msg);
        await msg.send();
    }
}