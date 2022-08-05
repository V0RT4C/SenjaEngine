import { startServer as startTCPLoginServer } from 'TCPLoginServer';
import { startServer as startTCPGameServer } from 'TCPGameServer';
import game from 'Game';
import map from 'Map';
import rawItems from 'RawItems';


rawItems.loadItemsFromJSONFile('./Data/items/items.json');
map.loadMapFromOTBM('./Data/world/senjaworld_v1.1.otbm');

game.loop.start();

startTCPLoginServer();
startTCPGameServer();