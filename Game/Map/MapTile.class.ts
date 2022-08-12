import log from 'Logger';
import { Thing } from 'Thing';
import { Creature } from 'Creature';
import { Player } from 'Player';
import { IPosition } from "Types";
import { Item } from "Item";
import { GAME_BEAT_MS } from '../../Constants/Game.const.ts';
import { THING_FLAG } from '../../Constants/Things.const.ts';

export class MapTile {
    constructor(x: number, y: number, z: number){
        this._position.x = x;
        this._position.y = y;
        this._position.z = z;
        if (this._position.x === -1){
            throw new Error('Maptile cant have -1 as x position')
        }
    }

    private _ground! : Thing;
    private _topItems : Array<Thing> = []; //Top items are pushed to array
    private _creatures : Array<Creature> = []; //Creatures are unshifted to array
    private _downItems : Array<Thing> = []; //Downitems are unshifted to array
    private _position : IPosition = {} as IPosition;
    private _flags : any = {};
    private _friction = 150;

    public get position() : IPosition {
        return this._position;
    }

    public get ground() : Thing {
        return this._ground;
    }

    public get topItems() : Array<Thing> {
        return this._topItems;
    }

    public get creatures() : Array<Creature> {
        return this._creatures;
    }

    public get downItems() : Array<Thing> {
        return this._downItems;
    }

    public get flags() : any {
        return this._flags;
    }

    public getGround() : Thing | null {
        return this._ground;
    }

    public setGround(ground : Thing) : void {
        log.debug(`MapTile::setGround`);

        ground.setPosition(this.position);

        this._ground = ground;
        if (ground instanceof Item){
            this.setFlagsFromItem(ground);

            if (ground.attributes.speed){
                this._friction = ground.attributes.speed;
            }
        }
    }

    public addTopThing(thing : Thing){
        log.debug(`MapTile::addTopThing`);
        thing.setPosition(this.position);
        
        this._topItems.push(thing);

        if (thing instanceof Item){
            this.setFlagsFromItem(thing);

            if (thing.attributes.speed){
                this._friction = thing.attributes.speed;
            }
        }
    }

    public addDownThing(thing : Thing){
        log.debug(`MapTile::addDownThing`);
        
        thing.setPosition(this.position);
        log.debug(`Thing position now: { x:${thing.position.x}, y:${thing.position.y}, z:${thing.position.z} }`);

        this._downItems.unshift(thing);

        if (thing instanceof Item){
            this.setFlagsFromItem(thing);
        }
    }

    public removeDownThingByThing(thing : Thing) : boolean {
        let idx = -1;

        for (let i=0; i < this.downItems.length; i++){
            if (this._downItems[i] === thing){
                idx = i;
                break;
            }
        }

        if (idx !== -1){
            this._downItems.splice(idx, 1);
            this.resetFlags();
            return true;
        }else{
            return false;
        }
    }

    public removeDownThing(stackPos : number) : Item | null {
        if (this._downItems[stackPos]){
            const result = this._downItems.splice(stackPos, 1);

            if (result.length === 1){
                this.resetFlags();
                return result[0] as Item;
            }else{
                return null;
            }
        }else{
            return null;
        }
    }

    public getRealTopThing() : Thing | null {
        if (this._creatures.length > 0){
            return this._creatures[this._creatures.length - 1];
        }
        else if (this._downItems.length > 0){
            return this._downItems[this._downItems.length - 1];
        }
        else if (this._topItems.length > 0){
            return this._topItems[this._topItems.length - 1];
        }
        else if (this.getGround() !== null){
            return this._ground;
        }
        else {
            return null;
        }
    }

    public getTopDownThing() : Thing | null {
        return this._downItems[0] !== undefined ? this._downItems[0] : null;
    }

    public getThingStackPos(thing : Thing) : number {
        let stackPos : number = 0;

        if (this.ground !== undefined && thing === this._ground){
            return 0;
        }

        //Check splash in future

        for (let i=0; i < this._topItems.length; i++){
            stackPos++;
            if (this._topItems[i] === thing){
                return stackPos;
            }
        }

        for (let i=0; i < this._creatures.length; i++){
            stackPos++;
            if (this._creatures[i] === thing){
                return stackPos;
            }
        }

        for (let i=0; i < this._downItems.length; i++){
            stackPos++;
            if (this._downItems[i] === thing){
                return stackPos;
            }
        }

        //If we get here the thing was not found on this tile
        return -1;
    }

    public getThingByStackPos(stackPos : number) : Thing | null {
        if (stackPos < 0 || stackPos > (1 + this._topItems.length + this._creatures.length + this.downItems.length)){
            return null;
        }

        if (stackPos === 0){
            return this._ground;
        }

        stackPos--;

        //Do splash check here later

        if (stackPos < this._topItems.length){
            return this._topItems[stackPos];
        }

        stackPos-=this._topItems.length;

        if (stackPos < this._creatures.length){
            return this._creatures[stackPos];
        }

        stackPos-=this._creatures.length;

        if (stackPos < this._downItems.length){
            return this._downItems[stackPos];
        }

        return null;
    }

    public getPlayers(){
        const players : Array<Player> = [];

        for (const c of this._creatures){
            if (c.isPlayer()){
                players.push(c as Player);
            }
        }

        return players;
    }

    public getCreatureByExtId(creatureExtId : number) : Creature | null {
        for (let i=0; i < this._creatures.length; i++){
            if (this._creatures[i].extId === creatureExtId){
                return this._creatures[i];
            }
        }

        return null;
    }

    public removeCreature(creatureExtId : number) : boolean {
        let idx : number = -1;

        for (let i=0; i < this._creatures.length; i++){
            if (this._creatures[i].extId === creatureExtId){
                idx = i;
                break;
            }
        }

        if (idx === -1){
            log.warning('Failed to remove creature');
            return false;
        }else{
            this._creatures.splice(idx, 1);
            return true;
        }
    }

    public addCreature(creature : Creature) : boolean {
        if (creature === undefined){
            log.warning('Creature was undefined');
            return false;
        }

        creature.setPosition(this.position);
        this._creatures.unshift(creature);
        return true;
    }

    public cleanCreatures() : void {
        this._creatures.length = 0;
        this._creatures = [];
    }

    public setFlagsFromItem(item : Item) : void {
        if (item.flags.floorChangeDown){
            this._flags.floorChangeDown = true;
        }

        if (item.flags.floorChangeNorth){
            this._flags.floorChangeNorth = true;
        }

        if (item.flags.floorChangeEast){
            this._flags.floorChangeEast = true;
        }

        if (item.flags.floorChangeSouth){
            this._flags.floorChangeSouth = true;
        }

        if (item.flags.floorChangeWest){
            this._flags.floorChangeWest = true;
        }

        if (item.flags.blockPathfinder){
            this._flags.blockPathfinder = true;
        }

        if (item.flags.unpassable){
            this._flags.unpassable = true;
        }
    }

    public resetFlags(){
        this._flags = {};

        if (this._ground instanceof Item){
            this.setFlagsFromItem(this._ground);
        }

        for (const item of this._topItems){
            if (item instanceof Item){
                this.setFlagsFromItem(item);
            }
        }

        for (const item of this._downItems){
            if (item instanceof Item){
                this.setFlagsFromItem(item);
            }
        }
    }

    public isFloorChange() : boolean {
        return this._flags.floorChangeDown === true ||
               this._flags.floorChangeNorth === true ||
               this._flags.floorChangeEast === true ||
               this._flags.floorChangeSouth === true ||
               this._flags.floorChangeWest === true
    }

    public isWalkable() : boolean {
        return !this._flags.unpassable && this._creatures.length === 0;
    }

    public getMovementSpeedMS(creatureSpeed : number) : number {
        const friction = this._friction ? this._friction : 150;
        
        let interval = 1000;

        if (friction > 0 && creatureSpeed > 0){
            interval = 1000 * friction;
        }

        interval /= creatureSpeed;
        const serverBeat = GAME_BEAT_MS; //ms

        interval = Math.max(interval, serverBeat);
        return interval;
    }

    public hasFlag(flag : THING_FLAG) : boolean {
        return this._flags[flag] === true;
    }
}