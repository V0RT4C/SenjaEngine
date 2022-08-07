import log from 'Logger';
log.info('[GAME] - Starting game...');
import { startServer as startTCPLoginServer } from 'TCPLoginServer';
import { startServer as startTCPGameServer } from 'TCPGameServer';
import game from 'Game';
import map from 'Map';
import rawItems from 'RawItems';


rawItems.loadItemsFromJSONFile('./Data/items/items.json');
map.loadMapFromOTBM('./Data/world/senjaworld_v1.1.otbm');
const tile = map.getTileAt({ x: 1043, y: 1018, z: 7});
console.log(tile?.getMovementSpeedMS(220));

game.loop.start();

startTCPLoginServer();
startTCPGameServer();