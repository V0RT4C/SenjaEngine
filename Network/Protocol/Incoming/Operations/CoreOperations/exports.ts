import { IncomingCreatureSpeakOp } from './IncomingCreatureSpeakOp.class.ts';
import { EnterGameOP } from './EnterGameOP.class.ts';
import { IncomingCloseContainerOp } from './IncomingCloseContainerOp.class.ts';
import { IncomingLeaveGameOp } from './IncomingLeaveGameOp.class.ts';
import { IncomingLookAtOp } from './IncomingLookAtOp.class.ts';
import { MoveThingOP } from './MoveThingOperation/MoveThingOP.class.ts';
import { IncomingPingOp } from './IncomingPingOp.class.ts';
import { IncomingPlayerModesOp } from './IncomingPlayerModesOp.class.ts';
import { MouseClickMoveOP } from './PlayerMovementOperations/MouseClickMoveOP.class.ts';
import { MoveEastOP } from './PlayerMovementOperations/MoveEastOP.class.ts';
import { MoveNorthOP } from './PlayerMovementOperations/MoveNorthOP.class.ts';
import { MoveSouthOP } from './PlayerMovementOperations/MoveSouthOP.class.ts';
import { MoveWestOP } from './PlayerMovementOperations/MoveWestOP.class.ts';
import { StopAutoWalkOP } from './PlayerMovementOperations/StopAutoWalkOP.class.ts';
import { TurnCreatureEastOP } from './PlayerMovementOperations/TurnCreatureEastOP.class.ts';
import { TurnCreatureNorthOP } from './PlayerMovementOperations/TurnCreatureNorthOP.class.ts';
import { TurnCreatureSouthOP } from './PlayerMovementOperations/TurnCreatureSouthOP.class.ts';
import { TurnCreatureWestOP } from './PlayerMovementOperations/TurnCreatureWestOP.class.ts';
import { IncomingChangeOutfitRequestOp } from './IncomingChangeOutfitRequestOp.class.ts';
import { IncomingSetOutfitOp } from './IncomingSetOutfitOp.class.ts';
import { IncomingUseItemOp } from './IncomingUseItemOp.class.ts';

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
    [IncomingCloseContainerOp.operationCode]: IncomingCloseContainerOp,
    [IncomingCreatureSpeakOp.operationCode]: IncomingCreatureSpeakOp,
    [EnterGameOP.operationCode]: EnterGameOP,
    [IncomingLeaveGameOp.operationCode]: IncomingLeaveGameOp,
    [IncomingLookAtOp.operationCode]: IncomingLookAtOp,
    [IncomingPingOp.operationCode]: IncomingPingOp,
    [IncomingPlayerModesOp.operationCode]: IncomingPlayerModesOp,
    [IncomingChangeOutfitRequestOp.operationCode]: IncomingChangeOutfitRequestOp,
    [IncomingSetOutfitOp.operationCode]: IncomingSetOutfitOp,
    [IncomingUseItemOp.operationCode]: IncomingUseItemOp,
    [MouseClickMoveOP.operationCode]: MouseClickMoveOP,
    [StopAutoWalkOP.operationCode]: StopAutoWalkOP
}