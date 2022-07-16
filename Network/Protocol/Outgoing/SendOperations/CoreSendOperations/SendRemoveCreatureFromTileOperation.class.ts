import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { SendRemoveThingFromTileOperation } from "CoreSendOperations/SendRemoveThingFromTileOperation.class.ts";
import { SendRemoveCreatureByExtIdOperation } from "CoreSendOperations/SendRemoveCreatureByExtIdOperation.class.ts";
import { IPosition } from "Types";
import { Creature } from "Creature";

export class SendRemoveCreatureFromTileOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _stackPosition : number,
        private readonly _creature : Creature
    ){}

    public static messageSize = SendRemoveThingFromTileOperation.messageSize + SendRemoveCreatureByExtIdOperation.messageSize;

    public static writeToNetworkMessage(position: IPosition, stackPosition: number, creature : Creature, msg : OutgoingNetworkMessage){
        if (stackPosition < 10){
            SendRemoveThingFromTileOperation.writeToNetworkMessage(position, stackPosition, msg);
        }

        SendRemoveCreatureByExtIdOperation.writeToNetworkMessage(creature.extId, msg);
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendRemoveCreatureFromTileOperation.messageSize);
        SendRemoveCreatureFromTileOperation.writeToNetworkMessage(this._position, this._stackPosition, this._creature, msg);
        await msg.sendToPlayersInAwareRange(this._position);
    }
}