import game from 'Game';
import log from 'Logger';
log.info('[GAME] - Starting game...');
import { startServer as startTCPLoginServer } from 'TCPLoginServer';
import { startServer as startTCPGameServer } from 'TCPGameServer';
import map from 'Map';
import rawItems from 'RawItems';


rawItems.loadItemsFromJSONFile('./Data/items/items.json');
map.loadMapFromOTBM('./Data/world/senjaworld_v2.otbm');
//console.log(map.getTileAt({ x: 1077, y: 1024, z: 9 }));

game.loop.start();

startTCPLoginServer();
startTCPGameServer();