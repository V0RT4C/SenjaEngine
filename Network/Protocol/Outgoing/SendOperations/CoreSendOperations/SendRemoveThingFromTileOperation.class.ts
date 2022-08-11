import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { OutgoingSendOperation } from "OutgoingSendOperations/OutgoingSendOperation.abtract.ts";
import { IPosition } from "Types";
import { PROTOCOL_SEND } from "Constants";
import { Thing } from "../../../../../Game/Thing.class.ts";
import map from "../../../../../Game/Map/Map.class.ts";
import { MapTile } from "../../../../../Game/Map/MapTile.class.ts";
import { Container } from "../../../../../Game/Container.class.ts";
import players from "../../../../../Game/Player/Players.class.ts";
import { SendCloseContainerOperation } from "./SendCloseContainerOperation.class.ts";
import { Player } from "../../../../../Game/Player/Player.class.ts";

export class SendRemoveThingFromTileOperation implements OutgoingSendOperation {
    constructor(
        private _position : IPosition,
        private _stackPosition : number
    ){}

    public static messageSize = 7;

    public static writeToNetworkMessage(position: IPosition, stackPosition: number, msg : OutgoingNetworkMessage){
        msg.writeUint8(PROTOCOL_SEND.REMOVE_THING_FROM_TILE);
        msg.writePosition(position);
        msg.writeUint8(stackPosition);
    }

    public static async updateContainerSpectators(thing : Thing | null | undefined, fromPosition : IPosition, thingMover : Player){
        if (thing instanceof Container){
            const spectators = players.getPlayersInCustomAwareRange(fromPosition, { x: 1, y: 1, z: 0 });
            
            for (const p of spectators){
                if (p !== thingMover){
                    if (Math.abs(p.position.x - thing.position.x) > 1 || Math.abs(p.position.y - thing.position.y) > 1 || p.position.z !== thing.position.z){
                        if (p.containerIsOpen(thing)){
                            const containerId = p.getContainerIdByContainer(thing);
                            if (containerId !== -1){
                                p.closeContainerById(containerId);
                                const closeContainerOp = new SendCloseContainerOperation(containerId, p.client);
                                await closeContainerOp.execute();
                            }
                        }
                    }
                }
            }
        }
    }

    public async execute(){
        const msg = new OutgoingNetworkMessage(SendRemoveThingFromTileOperation.messageSize);
        SendRemoveThingFromTileOperation.writeToNetworkMessage(this._position, this._stackPosition, msg);
        await msg.sendToPlayersInAwareRange(this._position);
    }
}