import { CloseContainerOP } from './CloseContainerOP.class.ts';
import { CreatureSpeakOP } from './CreatureSpeakOP.class.ts';
import { EnterGameOP } from './EnterGameOP.class.ts';
import { LeaveGameOP } from './LeaveGameOP.class.ts';
import { LookAtOP } from './LookAtOP.class.ts';
import { MoveThingOP } from './MoveThingOperation/MoveThingOP.class.ts';
import { PingOP } from './PingOP.class.ts';
import { PlayerModesOP } from './PlayerModesOP.class.ts';
import { MouseClickMoveOP } from './PlayerMovementOperations/MouseClickMoveOP.class.ts';
import { MoveEastOP } from './PlayerMovementOperations/MoveEastOP.class.ts';
import { MoveNorthOP } from './PlayerMovementOperations/MoveNorthOP.class.ts';
import { MoveSouthOP } from './PlayerMovementOperations/MoveSouthOP.class.ts';
import { MoveWestOP } from './PlayerMovementOperations/MoveWestOP.class.ts';
import { TurnCreatureEastOP } from './PlayerMovementOperations/TurnCreatureEastOP.class.ts';
import { TurnCreatureNorthOP } from './PlayerMovementOperations/TurnCreatureNorthOP.class.ts';
import { TurnCreatureSouthOP } from './PlayerMovementOperations/TurnCreatureSouthOP.class.ts';
import { TurnCreatureWestOP } from './PlayerMovementOperations/TurnCreatureWestOP.class.ts';
import { RequestChangeOutfitOP } from './RequestChangeOutfitOP.class.ts';
import { RequestSetOutfitOP } from './RequestSetOutfitOP.class.ts';
import { UseItemOP } from './UseItemOP.class.ts';

export default {
    [MoveThingOP.operationCode]: MoveThingOP,
    [MoveNorthOP.operationCode]: MoveNorthOP,
    [MoveEastOP.operationCode]: MoveEastOP,
    [MoveSouthOP.operationCode]: MoveSouthOP,
    [MoveWestOP.operationCode]: MoveWestOP,
    [TurnCreatureNorthOP.operationCode]: TurnCreatureNorthOP,
    [TurnCreatureEastOP.operationCode]: TurnCreatureEastOP,
    [TurnCreatureSouthOP.operationCode]: TurnCreatureSouthOP,
    [TurnCreatureWestOP.operationCode]: TurnCreatureWestOP,
    [CloseContainerOP.operationCode]: CloseContainerOP,
    [CreatureSpeakOP.operationCode]: CreatureSpeakOP,
    [EnterGameOP.operationCode]: EnterGameOP,
    [LeaveGameOP.operationCode]: LeaveGameOP,
    [LookAtOP.operationCode]: LookAtOP,
    [PingOP.operationCode]: PingOP,
    [PlayerModesOP.operationCode]: PlayerModesOP,
    [RequestChangeOutfitOP.operationCode]: RequestChangeOutfitOP,
    [RequestSetOutfitOP.operationCode]: RequestSetOutfitOP,
    [UseItemOP.operationCode]: UseItemOP,
    [MouseClickMoveOP.operationCode]: MouseClickMoveOP
}