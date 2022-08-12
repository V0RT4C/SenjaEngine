import { CloseContainerRequest } from "./CloseContainerRequest.class.ts";
import { CreatureSpeakRequest } from "./CreatureSpeakRequest.class.ts";
import { LeaveGameRequest } from "./LeaveGameRequest.class.ts";
import { LookAtRequest } from "./LookAtRequest.class.ts";
import { FollowCreatureRequest } from "./MovementRequests/PlayerMovement/FollowCreatureRequest.class.ts";
import { MoveSouthRequest } from "./MovementRequests/PlayerMovement/MoveSouthRequest.class.ts";
import { MoveWestRequest } from "./MovementRequests/PlayerMovement/MoveWestRequest.class.ts";
import { MoveEastRequest } from "./MovementRequests/PlayerMovement/MoveEastRequest.class.ts";
import { MoveNorthRequest } from "./MovementRequests/PlayerMovement/MoveNorthRequest.class.ts";
import { StopAutoWalkRequest } from "./MovementRequests/PlayerMovement/StopAutoWalkRequest.class.ts";
import { PingRequest } from "./PingRequest.class.ts";
import { SetOutfitRequest } from "./SetOutfitRequest.class.ts";
import { SetPlayerModesRequest } from "./SetPlayerModesRequest.class.ts";
import { UseItemRequest } from "./UseItemRequest.class.ts";
import { MoveThingOP } from './MovementRequests/ThrowMovements/MoveThingOP.class.ts';
import { EnterGameOP } from './SpecialCaseRequests/EnterGameOP.class.ts';
import { IncomingChangeOutfitRequestOp } from './SpecialCaseRequests/IncomingChangeOutfitRequestOp.class.ts';
import { MouseClickMoveOP } from './MovementRequests/PlayerMovement/MouseClickMoveOP.class.ts';
import { TurnEastRequest } from "./MovementRequests/PlayerMovement/TurnEastRequest.class.ts";
import { TurnNorthRequest } from "./MovementRequests/PlayerMovement/TurnNorthRequest.class.ts";
import { TurnSouthRequest } from "./MovementRequests/PlayerMovement/TurnSouthRequest.class.ts";
import { TurnWestRequest } from "./MovementRequests/PlayerMovement/TurnWestRequest.class.ts";

export default {
    [MoveThingOP.operationCode]: MoveThingOP,
    [MoveNorthRequest.operationCode]: MoveNorthRequest,
    [MoveEastRequest.operationCode]: MoveEastRequest,
    [MoveSouthRequest.operationCode]: MoveSouthRequest,
    [MoveWestRequest.operationCode]: MoveWestRequest,
    [TurnNorthRequest.operationCode]: TurnNorthRequest,
    [TurnEastRequest.operationCode]: TurnEastRequest,
    [TurnSouthRequest.operationCode]: TurnSouthRequest,
    [TurnWestRequest.operationCode]: TurnWestRequest,
    [CloseContainerRequest.operationCode]: CloseContainerRequest,
    [CreatureSpeakRequest.operationCode]: CreatureSpeakRequest,
    [EnterGameOP.operationCode]: EnterGameOP,
    [LeaveGameRequest.operationCode]: LeaveGameRequest,
    [LookAtRequest.operationCode]: LookAtRequest,
    [PingRequest.operationCode]: PingRequest,
    [SetPlayerModesRequest.operationCode]: SetPlayerModesRequest,
    [IncomingChangeOutfitRequestOp.operationCode]: IncomingChangeOutfitRequestOp,
    [SetOutfitRequest.operationCode]: SetOutfitRequest,
    [UseItemRequest.operationCode]: UseItemRequest,
    [MouseClickMoveOP.operationCode]: MouseClickMoveOP,
    [StopAutoWalkRequest.operationCode]: StopAutoWalkRequest,
    [FollowCreatureRequest.operationCode]: FollowCreatureRequest
}