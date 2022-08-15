import game from 'Game';
import log from 'Logger';
log.info('[GAME] - Starting game...');
import { startServer as startTCPLoginServer } from 'TCPLoginServer';
import { startServer as startTCPGameServer } from 'TCPGameServer';
import map from 'Map';
import rawItems from 'RawItems';
import { DirectoryScriptsImporter } from './Game/Lib/DirectoryScriptsImporter.class.ts';

log.info('[GAME] - Loading actions...');
await DirectoryScriptsImporter.importScripts('./Data/actions/common');

rawItems.loadItemsFromJSONFile('./Data/items/items.json');
map.loadMapFromOTBM('./Data/world/senjaworld_v3.otbm');

game.loop.start();

startTCPLoginServer();
startTCPGameServer();