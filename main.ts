import { TCP } from 'Dependencies';
import loginServer from 'TCPLoginServer';
import gameServer from 'TCPGameServer';
import game from 'Game';
import map from 'Map';
import rawItems from 'RawItems';

rawItems.loadItemsFromJSONFile('./Data/items/items.json');
map.loadMapFromOTBM('./Data/world/senjaworld.otbm');
console.log(map.getTileAt({ x: 1042, y: 1022, z: 6}))
game.loop.start();

(async () => {
    loginServer.addListener(TCP.Event.listen, () => {
        console.log('LoginServer running on:' + 7171);
    })
    await loginServer.listen();
})();

(async () => {
    gameServer.addListener(TCP.Event.listen, () => {
        console.log('GameServer running on:' + 7373);
    });
    await gameServer.listen();
})();