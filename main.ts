import { TCP } from 'Dependencies';
import loginServer from 'TCPLoginServer';
import gameServer from 'TCPGameServer';
import game from 'Game';
import map from 'Map';
import rawItems from 'RawItems';

rawItems.loadItemsFromJSONFile('./Data/items/items.json');
map.loadMapFromOTBM('./Data/world/senjaworld_v1.1.otbm');
console.log(map.getTileAt({ x: 1045, y: 1016, z: 7}))
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