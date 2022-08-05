import { EnterGameOperation } from "Network/Protocol/Incoming/Operations/CoreOperations/EnterGameOperation.class.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { MoveEastOperation } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/MoveEastOperation.class.ts";
import { MoveSouthOperation } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/MoveSouthOperation.class.ts";
import { MoveWestOperation } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/MoveWestOperation.class.ts";
import { PingOperation } from "Network/Protocol/Incoming/Operations/CoreOperations/PingOperation.class.ts";
import { LeaveGameOperation } from "Network/Protocol/Incoming/Operations/CoreOperations/LeaveGameOperation.class.ts";
import { CreatureSpeakOperation } from "Network/Protocol/Incoming/Operations/CoreOperations/CreatureSpeakOperation.class.ts";
import { TurnCreatureNorth } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/TurnCreatureNorth.class.ts";
import { TurnCreatureEast } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/TurnCreatureEast.class.ts";
import { TurnCreatureSouth } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/TurnCreatureSouth.class.ts";
import { TurnCreatureWest } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/TurnCreatureWest.class.ts";
import { MoveThingOperation } from "Network/Protocol/Incoming/Operations/CoreOperations/MoveThingOperation/MoveThingOperation.class.ts";
import { LookAtOperation } from "Network/Protocol/Incoming/Operations/CoreOperations/LookAtOperation.class.ts";
import { UseItemOperation } from "ProtocolIncoming/Operations/CoreOperations/UseItemOperation.class.ts";
import { CloseContainerOperation } from "ProtocolIncoming/Operations/CoreOperations/CloseContainerOperation.class.ts";
import { RequestChangeOutfitOperation } from "ProtocolIncoming/Operations/CoreOperations/RequestChangeOutfitOperation.class.ts";
import { RequestSetOutfitOperation } from "ProtocolIncoming/Operations/CoreOperations/RequestSetOutfitOperation.class.ts";
import { MoveNorthOperation } from "ProtocolIncoming/Operations/CoreOperations/PlayerMovementOperations/MoveNorthOperation.class.ts";

import game from "Game";

import { PROTOCOL_RECEIVE } from "Constants";
import { TCP } from 'Dependencies';


export const parseNetworkMessage = (client: TCP.Client, data : Uint8Array) => {
    const buffer = new IncomingNetworkMessage(data, client);

    do {
        const _length : number = buffer.readUint16LE();
        const op : number = buffer.readUint8();

        switch(op){
            case PingOperation.operationCode:
                game.addOperation(new PingOperation(buffer));
                break;
            case EnterGameOperation.operationCode:{
                const enterGameOperation = new EnterGameOperation(buffer);
                enterGameOperation.parseMessage();
                game.addOperation(enterGameOperation);
            }
                break;
            case LeaveGameOperation.operationCode:
                game.addOperation(new LeaveGameOperation(buffer));
                break;
            case PROTOCOL_RECEIVE.CHANGE_FIGHT_MODE:{
                const fightMode : number = buffer.readUint8();
                const chaseMode : number = buffer.readUint8();
                const safeFight : number = buffer.readUint8();
                console.log({ fightMode, chaseMode, safeFight });
            }
                break;
            case TurnCreatureNorth.operationCode:
                game.addOperation(new TurnCreatureNorth(buffer));
                break;
            case TurnCreatureEast.operationCode:
                game.addOperation(new TurnCreatureEast(buffer));
                break;
            case TurnCreatureSouth.operationCode:
                game.addOperation(new TurnCreatureSouth(buffer));
                break;
            case TurnCreatureWest.operationCode:
                game.addOperation(new TurnCreatureWest(buffer));
                break;
            case MoveNorthOperation.operationCode:
                game.addOperation(new MoveNorthOperation(buffer));
                break;
            case MoveEastOperation.operationCode:
                game.addOperation(new MoveEastOperation(buffer));
                break;
            case MoveSouthOperation.operationCode:
                game.addOperation(new MoveSouthOperation(buffer));
                break;
            case MoveWestOperation.operationCode:
                game.addOperation(new MoveWestOperation(buffer));
                break;
            case MoveThingOperation.operationCode:{
                const moveThingOp = new MoveThingOperation(buffer);
                moveThingOp.parseMessage();
                game.addOperation(moveThingOp);
            }
                break;
            case CreatureSpeakOperation.operationCode:{
                const speakOp = new CreatureSpeakOperation(buffer);
                speakOp.parseMessage();
                game.addOperation(speakOp);
            }
                break;
            case LookAtOperation.operationCode:{
                const lookAtOp = new LookAtOperation(buffer);
                lookAtOp.parseMessage();
                game.addOperation(lookAtOp);
            }
                break;
            case UseItemOperation.operationCode:{
                const useItemOp = new UseItemOperation(buffer);
                useItemOp.parseMessage();
                game.addOperation(useItemOp);
            }
                break;
            case CloseContainerOperation.operationCode:{
                const closeContainerOp = new CloseContainerOperation(buffer);
                closeContainerOp.parseMessage();
                game.addOperation(closeContainerOp);
            }
                break;
            case RequestChangeOutfitOperation.operationCode:{
                const requestChangeOutfitOp = new RequestChangeOutfitOperation(buffer);
                game.addOperation(requestChangeOutfitOp);
            }
                break
            case RequestSetOutfitOperation.operationCode:{
                const requestSetOutfitOp = new RequestSetOutfitOperation(buffer);
                requestSetOutfitOp.parseMessage();
                game.addOperation(requestSetOutfitOp);
            }
                break;
            case 105:
                console.log('OP: 105. Client stop');
                console.log(buffer);
                break;
            default:
                console.log(`Dont have that OP code: ${op}`);
                console.log(buffer.position);
                buffer.seek(buffer.byteLength);
                console.log(buffer);
        }
    } while(buffer.position !== buffer.byteLength)
}