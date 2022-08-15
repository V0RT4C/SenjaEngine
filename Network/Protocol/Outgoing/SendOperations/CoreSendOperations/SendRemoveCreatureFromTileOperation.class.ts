import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { SendRemoveThingFromTileOperation } from "CoreSendOperations/SendRemoveThingFromTileOperation.class.ts";
import { SendRemoveCreatureByExtIdOperation } from "CoreSendOperations/SendRemoveCreatureByExtIdOperation.class.ts";
import { IPosition } from "Types";
import { Creature } from "Creature";
import { Player } from "../../../../../Game/Player/Player.class.ts";

export class SendRemoveCreatureFromTileOperation implements OutgoingSendOperation {
    constructor(
        private readonly _position : IPosition,
        private readonly _stackPosition : number,
        private readonly _creature : Creature,
        private readonly _player : Player
    ){}

    public static messageSize = SendRemoveThingFromTileOperation.messageSize + SendRemoveCreatureByExtIdOperation.messageSize;

    public static writeToNetworkMessage(position: IPosition, stackPosition: number, creature : Creature, player : Player, msg : OutgoingNetworkMessage){
        if (stackPosition < 10){
            SendRemoveThingFromTileOperation.writeToNetworkMessage(position, stackPosition, msg);
        }
            
        SendRemoveCreatureByExtIdOperation.writeToNetworkMessage(creature.extId, msg);
    }

    public async execute(){
        const msg = OutgoingNetworkMessage.withClient(this._player.client, SendRemoveCreatureFromTileOperation.messageSize);
        SendRemoveCreatureFromTileOperation.writeToNetworkMessage(this._position, this._stackPosition, this._creature, this._player, msg);
        await msg.send();
    }
}