import { TCP } from 'Dependencies';
import loginServer from 'TCPLoginServer';
import gameServer from 'TCPGameServer';
import game from 'Game';
import map from 'Map';

map.generateGrassMap();

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