import { Thing } from 'Thing';
import { Creature } from 'Creature';
import { Player } from 'Player';
import { IPosition } from "Types";

export class MapTile {
    constructor(x: number, y: number, z: number){
        this._position.x = x;
        this._position.y = y;
        this._position.z = z;
    }

    private _ground! : Thing;
    private _topItems : Array<Thing> = []; //Top items are pushed to array
    private _creatures : Array<Creature> = []; //Creatures are unshifted to array
    private _downItems : Array<Thing> = []; //Downitems are unshifted to array
    private _position : IPosition = {} as IPosition;

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

    public getGround() : Thing | null {
        return this._ground;
    }

    public setGround(ground : Thing) : void {
        this._ground = ground;
    }

    public addTopThing(thing : Thing){
        thing.position = this.position;
        let idx = this._topItems.push(thing);
        thing.tileIndex = idx;
    }

    public addDownThing(thing : Thing){
        thing.position = this._position;
        let idx = this._downItems.unshift(thing);
        thing.tileIndex = idx;
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
            return true;
        }else{
            return false;
        }
    }

    public removeDownThing(stackPos : number) : void {
        if (this._downItems[stackPos]){
            this._downItems.splice(stackPos, 1);
        }
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
                return this._creatures.slice(i, 1)[0];
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
            console.log('Failed to remove creature');
            return false;
        }else{
            this._creatures.splice(idx, 1);
            return true;
        }
    }

    public addCreature(creature : Creature) : boolean {
        if (creature === undefined){
            console.log('Creature was undefined');
            return false;
        }

        creature.position = this.position;
        this._creatures.unshift(creature);
        return true;
    }

    public cleanCreatures() : void {
        this._creatures.length = 0;
        this._creatures = [];
    }

    public isWalkable() : boolean {
        return this._creatures.length === 0;
    }
}