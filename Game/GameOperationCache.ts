import { GameOperation } from "Game/GameOperation.abstract.ts";

class GameOperationCache extends Array<GameOperation> {

}

const gameOperationCache = new GameOperationCache();
export default gameOperationCache;