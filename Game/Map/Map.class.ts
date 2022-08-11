import log from 'Logger';
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { QuadTree, Rect, Point } from '~/deps.ts';
import { MapTile } from 'MapTile';
import { Item } from 'Item';
import { Creature } from 'Creature';
import { Thing } from "Thing";

import { MAP, VIEWPORT, SKULL, PARTY_SHIELD } from 'Constants';
import { IPosition } from "Types";
import { Container } from "Game/Container.class.ts";
import npcs from 'Game/NPC/NPCS.class.ts';
import { OTBMReader, OTBMItem, OTBMTile, OTBMTileArea } from 'Dependencies';
import rawItems from "RawItems";
import { TileArea } from 'https://deno.land/x/v0rt4c_otbm@0.1.2/mod.ts';
import { Player } from '../Player/Player.class.ts';
import { THING_FLAG } from '../../Constants/Things.const.ts';

class Map {
    constructor(width : number, height : number){
        this._width = width;
        this._height = height;

        this._floors = [];

        for (let z=0; z <= MAP.MAX_Z; z++){
            this._floors.push(new QuadTree<MapTile>(new Rect(0,0, width * 2, height * 2)));
        }

/*        for (let z=0; z <= MAP.MAX_Z; z++){
            this._floors.push([]);
        }*/
    }

    private _width : number;
    private _height : number;
    private _floors : Array<QuadTree>;
    //private _floors : Array<Array<MapTile>>
    /*

    public addTile(tile : MapTile) : boolean {
        this._floors[tile.position.z][tile.position.x + this._width*tile.position.y] = tile;
        return true;
    }

    public getTileAt(position : IPosition) : MapTile | null {
        if (this._floors[position.z] && this._floors[position.z][position.x + this._width*position.y] !== undefined){
            return this._floors[position.z][position.x + this._width*position.y];
        }else{
            return null;
        }
    }*/

    public addTile(tile : MapTile) : boolean {
        log.debug('Map::addTile');
        return this._floors[tile.position.z].insert(new Point(tile.position.x, tile.position.y, tile));
    }

    public getTileAt(position : IPosition) : MapTile | null {
        //log.debug('Map::getTileAt');
        const pointArr = this._floors[position.z].query({
            intersects: (range : Rect) => range.contains(new Point(position.x, position.y)),
            contains: (point : Point<MapTile>) => {
                if (point.x === position.x && point.y === position.y){
                    return true;
                }else{
                    return false;
                }
            },
            x: position.x,
            y: position.y
        });

        if (pointArr.length > 0){
            return pointArr[0].data;
        }else{
            return null;
        }
    }

    public moveCreatureByExtId(fromPos : IPosition, toPos : IPosition, creatureExtId : number) : boolean {
        log.debug('Map::moveCreatureByExtId');
        let toTile : MapTile | null = this.getTileAt(toPos);
        log.debug('ToTile')
        if (toTile === null){
            return false;
        }

        if (fromPos.z === toPos.z && !toTile.isWalkable()){
            log.debug('Is not walkable')
            return false;
        }
        log.debug('IsWalkable')

        // if (toTile.isFloorChange()){
        //     if (toTile.flags.floorChangeNorth){
        //         toPos.y-=1;
        //         toPos.z-=1;
        //     }
        // }

        if (fromPos.x === -1 || toPos.x === -1){
            throw new Error('Maptile posx is -1 ');
        }
        const fromTile : MapTile | null = this.getTileAt(fromPos);

        if (fromTile === null){
            log.debug('FromTile is null')
            return false;
        }

        const creature : Creature | null = fromTile.getCreatureByExtId(creatureExtId);

        if (creature === null || creature === undefined){
            log.debug('Creature is null');
            return false;
        }

        const removeSuccess : boolean = fromTile.removeCreature(creature.extId);

        if (!removeSuccess){
            log.debug('Failed to remove creature from tile')
            return false;
        }
        
        return toTile.addCreature(creature);
    }

    public moveCreatureByStackPos(fromPos : IPosition, toPos : IPosition, stackPos : number) : Creature | null {
        log.debug(`Map::moveCreatureByStackPos`);
        const fromTile : MapTile | null = this.getTileAt(fromPos);

        if (fromTile === null){
            return null;
        }

        if (fromTile.creatures.length === 0){
            return null;
        }

        const creature = fromTile.getThingByStackPos(stackPos);

        if (creature === null || !(creature instanceof Creature)){
            return null;
        }

        const toTile : MapTile | null = this.getTileAt(toPos);

        if (toTile === null){
            return null;
        }

        if (!toTile.isWalkable()){
            return null;
        }

        const removeSuccess : boolean = fromTile.removeCreature(creature.extId);

        if (!removeSuccess){
            return null;
        }

        toTile.addCreature(creature);
        return creature;
    }

    public moveThing(fromPos : IPosition, stackPos : number, toPos : IPosition) : boolean {
        log.debug('Map::moveThing');
        const fromTile : MapTile | null = map.getTileAt(fromPos);
        if (fromTile === null){
            return false;
        }

        const item : Item | null = fromTile.getThingByStackPos(stackPos) as Item | null;
        //const item = fromTile.downItems.shift();

        if (item === null){
            return false;
        }

        let toTile : MapTile | null = map.getTileAt(toPos);

        if (toTile === null){
            return false;
        }

        if (!item.isMovable()){
            return false;
        }

        if (toTile.isFloorChange()){
            log.debug(`Is floor change tile`);
            if (item instanceof Creature){
                return false;
            }

            if (toTile.hasFlag(THING_FLAG.FLOOR_CHANGE_DOWN)){
                log.debug(`Is floor change down tile`);
                return this.teleportThing(fromPos, stackPos, { x: fromPos.x, y: fromPos.y + 1, z: fromPos.z+1 });
            }

            return false;
        }else{
            if (!fromTile.removeDownThingByThing(item)){
                return false;
            }
            
            toTile.addDownThing(item);
            return true;
        }

    }

    public teleportThing(fromPosition : IPosition, fromStackPos : number, toPosition : IPosition) : boolean {
        log.debug('Map::teleportThing');
        const fromTile : MapTile | null = map.getTileAt(fromPosition);

        if (fromTile === null){
            log.debug(`fromTile is null`);
            return false;
        }

        const toTile : MapTile | null = map.getTileAt(toPosition);

        if (toTile === null){
            log.debug(`toTile is null`);
            return false;
        }

        const item : Thing | null = fromTile.getThingByStackPos(fromStackPos);

        if (item === null){
            log.debug(`item is null`);
            return false;
        }

        if (!fromTile.removeDownThingByThing(item)){
            log.debug(`Failed to remove thing`);
            return false;
        }

        toTile.addDownThing(item);
        return true;
    }

    public getPlayersInAwareRange(centerPos : IPosition) : Array<Creature> {
        log.debug('Map::getPlayersInAwareRange');
        // const startX = centerPos.x - 10;
        // const endX = centerPos.x + 10;
        // const startY = centerPos.y - 8;
        // const endY = centerPos.y + 8;
        const startX = centerPos.x - (VIEWPORT.MAX_VIEWPORT_X - 1);
        const endX = centerPos.x + (VIEWPORT.MAX_VIEWPORT_X);
        const startY = centerPos.y - (VIEWPORT.MAX_VIEWPORT_Y);
        const endY = centerPos.y + (VIEWPORT.MAX_VIEWPORT_Y);

        let playersInAwareRange : Array<Creature> = [];
        
        for (let x=startX; x < endX; x++){
            for (let y=startY; y < endY; y++){
                const tile = this.getTileAt({ x, y, z: centerPos.z });
                if (tile !== null){
                    const players = tile.getPlayers();
                    playersInAwareRange = [...playersInAwareRange, ...players];
                }
            }
        }

        return playersInAwareRange;
    }

    public generateGrassMap(){
        log.debug('Map::generateGrassMap');
        for (let z=MAP.MAX_Z; z >= 7; z--){
            for (let x=0; x <= this._width; x++){
                for (let y=0; y <= this._height; y++){
                    const mapTile = new MapTile(x, y, z);
                    mapTile.setGround(new Item(102));
                    if (x === 20 && y === 23 && z === 7){
                        const container = new Container(2854);
                        container.addItem(new Item(3284));
                        container.addItem(new Item(3282));
                        container.addItem(new Item(3280));
                        mapTile.addDownThing(container);
                    }
                    if (x === 25 && y === 25 && z === 7){
                        mapTile.addDownThing(new Item(3284));
                        mapTile.addDownThing(new Item(3285));
                        mapTile.addDownThing(new Item(3286));
                        //mapTile.addThing(new Item(3287));
                        mapTile.addDownThing(new Item(3288));
                        mapTile.addDownThing(new Container(2854));
                    }
                    else if(x === 28 && y === 27 && z === 7){
                        mapTile.addDownThing(new Item(3280));
                        mapTile.addDownThing(new Item(3281));
                        mapTile.addDownThing(new Item(3282));
                    }
                    else if(x === 23 && y === 23 && z === 7){
                        const npc = npcs.createNPC('Arai');
                        mapTile.addCreature(npc);
                    }
                    if (!this.addTile(mapTile)){
                        throw new Error(`Failed to add tile x:${x}, y:${y}, z:${7}`)
                    }
                }
            }
        }
    }

    public generateVoidMap(){
        log.debug('Map::generateVoidMap');
        for (let z=0; z <= MAP.MAX_Z; z++){
            for (let x=0; x <= this._width; x++){
                for (let y=0; y <= this._height; y++){
                    const mapTile = new MapTile(x, y, z);
                    mapTile.addDownThing(new Item(100));
                    if (!this.addTile(mapTile)){
                        throw new Error(`Failed to add tile x:${x}, y:${y}, z:${z}`)
                    }
                }
            }
        }
    }

    public loadMapFromOTBM(path : string){
        log.debug('Map::loadMapFromOTBM');
        log.info(`[MAP] - Loading map from ${path}...`);
        const otbmBuffer = Deno.readFileSync(path);
        const reader = new OTBMReader();
        reader.setOTBM(otbmBuffer);
        const nodeTree = reader.getNodeTree();
        if (nodeTree.firstChild?.properties?.description){
            log.info(`[MAP] - ${nodeTree.firstChild?.properties.description.join(', ')}`)
        }
        log.info(`[MAP] - Map size ${nodeTree.width}x${nodeTree.height}...`);
        let tileArea : OTBMTileArea | null = nodeTree.children[0].firstChild as unknown as OTBMTileArea;

        if (tileArea !== null){
            while(tileArea !== null && tileArea instanceof TileArea) {
                if (tileArea.children.length > 0){
                    let tile : OTBMTile | null = tileArea.firstChild as OTBMTile;

                    if (tile !== null){
                        while(tile !== null){

                            if (tile.properties.tileId){
                                const mapTile = new MapTile(tile.realX, tile.realY, tile.z);
                                mapTile.setGround(new Item(tile.properties.tileId as number));
                                if (tile.children.length > 0){
                                    for (const item of tile.children){
                                        const rawItem = rawItems.getItemById((item as any).id);
                                        if (rawItem.group === 'ground' && !rawItem.flags.hasStackOrder){
                                            if (mapTile.getGround() === null){
                                                mapTile.setGround(new Item((item as OTBMItem).id));
                                            }
                                        }
                                        else if (rawItem.group === 'container'){
                                            mapTile.addDownThing(new Container((item as OTBMItem).id));
                                        }else{
                                            if (rawItem.flags.hasStackOrder){
                                                mapTile.addTopThing(new Item((item as OTBMItem).id));
                                            }else{
                                                mapTile.addDownThing(new Item((item as OTBMItem).id));
                                            }
                                        }
                                    }
                                }
                                if (!this.addTile(mapTile)){
                                    throw new Error(`Failed to add tile x:${tile.realX}, y:${tile.realY}, z:${tile.z}`)
                                }
                            }else{
                                if (tile.children.length > 0){
                                    const mapTile = new MapTile(tile.realX, tile.realY, tile.z);
                                    mapTile.setGround(new Item((tile.children[0] as OTBMItem).id))
                                    if (!this.addTile(mapTile)){
                                        throw new Error(`Failed to add tile x:${tile.realX}, y:${tile.realY}, z:${tile.z}`)
                                    }
                                }else{
                                    log.debug(`Failed to add tile x:${tile.realX}, y:${tile.realY}, z:${tile.z}`);
                                }
                            }
                            tile = tile.nextSibling as OTBMTile;
                        }
                    }
                }
                tileArea = tileArea.nextSibling as OTBMTileArea;
            }
        }

        log.info(`[MAP] - Map loaded...`);
    }

    public getMapDescriptionAsBytes(position : IPosition, width: number, height: number, player : Player, msg : OutgoingNetworkMessage) : OutgoingNetworkMessage {
        //log.debug('Map::getMapDescriptionAsBytes');
        const { x, y, z } = position;

        let skip = -1;
        let startz, endz, zstep : number;

        if (z > MAP.SEA_FLOOR){
            startz = z - MAP.AWARE_UNDEGROUND_FLOOR_RANGE;
            endz = Math.min(z + MAP.AWARE_UNDEGROUND_FLOOR_RANGE, MAP.MAX_Z);
            zstep = 1;
        }else{
            startz = MAP.SEA_FLOOR;
            endz = 0;
            zstep = -1;
        }

        for (let nz = startz; nz != endz + zstep; nz+= zstep){
            skip = this.getFloorDescriptionAsBytes({ x, y, z:nz }, width, height, z - nz, skip, player, msg);
        }

        if (skip >= 0) {
            msg.writeUint8(skip);
            msg.writeUint8(0xFF);
        }

        return msg;
    }

    public getFloorDescriptionAsBytes(position : IPosition, width : number, height : number, offset : number, skip: number, player : Player, msg : OutgoingNetworkMessage){
        //log.debug('Map::getFloorDescriptionAsBytes');
        const { x, y, z } = position;

        for (let nx=0; nx < width; nx++){
            for (let ny=0; ny < height; ny++){
                const tile : MapTile = map.getTileAt({ x: x + nx + offset, y: y + ny + offset, z }) as MapTile;
                if (tile !== null){
                    if (skip >= 0){
                        msg.writeUint8(skip);
                        msg.writeUint8(0xFF);
                    }

                    skip=0;
                    this.getTileDescriptionAsBytes(tile, player, msg);
                }
                else if (skip == 0xFE){
                    msg.writeUint8(0xFF);
                    msg.writeUint8(0xFF);
                    skip = -1;
                }
                else {
                    ++skip;
                }
            }
        }

        return skip;
    }

    public getTileDescriptionAsBytes(tile : MapTile, player : Player, buffer : OutgoingNetworkMessage) {
        //log.debug('Map::getTileDescriptionAsBytes');
        let count : number;
        let ground : Thing = tile.getGround() as Thing;

        if (ground){
            buffer.writeUint16LE(ground.thingId);
            count = 1;
        }else{
            count = 0;
        }

        const topItems = tile.topItems;
        if (topItems.length > 0){
            for (const item of topItems){
                buffer.writeUint16LE(item.thingId);
                if (++count == 10){
                    break;
                }
            }
        }

        const creatures = tile.creatures;
        if (creatures.length > 0){
            for (const creature of creatures){
                //const known = player.checkCreatureAsKnown(creature.extId);
                const known = false;
                if (known){
                    buffer.writeUint16LE(0x62);
                    buffer.writeUint32LE(creature.extId);
                }
                else {
                    buffer.writeUint16LE(0x61);
                    buffer.writeUint32LE(creature.extId); //Update this later
                    buffer.writeUint32LE(creature.extId);
                    buffer.writeString(creature.name);
                }

                buffer.writeUint8(creature.getHealthPercent());

                buffer.writeUint8(creature.direction);


                buffer.writeUint8(creature.outfit.lookType);
                if (creature.outfit.lookType !== 0){
                    buffer.writeUint8(creature.outfit.lookHead);
                    buffer.writeUint8(creature.outfit.lookBody);
                    buffer.writeUint8(creature.outfit.lookLegs);
                    buffer.writeUint8(creature.outfit.lookFeet);
                }else{
                    //add void sprite for now
                    buffer.writeUint16LE(100);
                }

                buffer.writeUint8(creature.lightInfo.level); //Light intensity
                buffer.writeUint8(creature.lightInfo.color);
                buffer.writeUint16LE(creature.speed);
                buffer.writeUint8(SKULL.NONE);
                buffer.writeUint8(PARTY_SHIELD.SHIELD_NONE);
            }
        }


        const downItems = tile.downItems;
        if (downItems.length > 0){
            for (const item of downItems){
                buffer.writeUint16LE(item.thingId);
                if (++count == 10){
                    break;
                }
            }
        }
    }
}

const map = new Map(2048, 2048);
export default map;