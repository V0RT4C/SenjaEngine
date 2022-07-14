import map from 'Map';

import type { Player } from 'Player';
import { IPosition } from "Types";

export const evt = new EventTarget();

evt.addEventListener('updateSpectators', (event : CustomEvent<{ centerPos : IPosition, fn: (player : Player) => {}}>) => {
    console.log('Updating spectators');
    const fn = event.detail.fn;
    const centerPos = event.detail.centerPos;

    const players = map.getPlayersInAwareRange(centerPos);

    for (const player of players){
        fn(player as Player);
    }
});