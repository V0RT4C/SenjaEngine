import { UpdateTileItemOp } from "Game/Operations/UpdateTileItemOp.class.ts";
import { WALK_DIRECTION } from "Constants/Map.const.ts";
import { IPosition } from "Types";
import { EVENT } from "Constants/events.const.ts";
import events from "Game/Events/EventEmitter.ts";
import game from "Game/Game.class.ts";
import map from "Game/Map/Map.class.ts";

const DOOR_PAIRS_EAST : { [any: number]: number } = {
    [1630]: 1629,
    [1629]: 1630
}

const DOOR_PAIRS_SOUTH : { [any: number]: number } = {
    [1632]: 1633,
    [1633]: 1632
}

events.on(EVENT.PLAYER_USE_ITEM_ON_GROUND, ({ player, item, itemPosition, itemStackPosition } : any) => {
    if (DOOR_PAIRS_EAST[item.thingId] !== undefined){
        game.addOperation(new UpdateTileItemOp(itemPosition, itemStackPosition, DOOR_PAIRS_EAST[item.thingId], player));
        pushCreaturesFromClosedDoor(itemPosition, WALK_DIRECTION.EAST);
    }
    if (DOOR_PAIRS_SOUTH[item.thingId] !== undefined){
        game.addOperation(new UpdateTileItemOp(itemPosition, itemStackPosition, DOOR_PAIRS_SOUTH[item.thingId], player));
        pushCreaturesFromClosedDoor(itemPosition, WALK_DIRECTION.SOUTH);
    }
});

const pushCreaturesFromClosedDoor = (position : IPosition, walkDirection : WALK_DIRECTION) => {
    const tile = map.getTileAt({...position});
    if (tile !== null){
        if (tile.creatures.length > 0){
            for (const creature of tile.creatures){
                creature.addWalkTask(walkDirection, true);
            }
        }
    }
}