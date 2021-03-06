import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { TCP } from 'Dependencies';
import { PROTOCOL_SEND } from "Constants";
import { Container } from "Container";

export class SendOpenContainerOperation implements OutgoingSendOperation {
    constructor(
        private readonly _containerId : number,
        private readonly _container : Container,
        private readonly _client : TCP.Client
    ){}

    public static messageSize = 1000;

    public static writeToNetworkMessage(containerId : number, container : Container, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.OPEN_CONTAINER);
        msg.writeUint8(containerId); //ContainerId
        msg.writeUint16LE(2854); //Container item id
        msg.writeString('Backpack');
        msg.writeUint8(container.capacity); //Capacity
        msg.writeUint8(0); //Has parent 0 = false
        msg.writeUint8(container.items.length); //itemcount
        for (const item of container.items){
            msg.writeUint16LE(item.thingId); //Blessed shield
        }
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._client, SendOpenContainerOperation.messageSize);
        SendOpenContainerOperation.writeToNetworkMessage(this._containerId, this._container, msg);
        await msg.send();
    }
}