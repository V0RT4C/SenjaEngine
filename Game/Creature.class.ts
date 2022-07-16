import { Thing } from 'Thing';

import map from "Map";
import { CLIENT_VIEWPORT, CREATURE_DIRECTION, CREATURE_TYPE, DEFAULT_LOOK, MAP } from 'Constants';
import { IOutfit, IPosition } from "Types";
import { BASE_SPEED } from "Config";
import { Skills } from "Game/Skills.class.ts";

export abstract class Creature extends Thing {
    protected _extId! : number;
    protected _health = 150;
    protected _maxHealth = 150;
    protected _freeCapacity = 0;
    protected _experience = 0;
    protected _level = 100;
    protected _levelPercent = 0;
    protected _mana = 0;
    protected _maxMana = 0;
    protected _magicLevel = 0;
    protected _magicLevelPercent = 0;
    protected _soulPoints = 0;
    protected _hiddenHealth = false;
    protected _direction : CREATURE_DIRECTION = CREATURE_DIRECTION.SOUTH;
    //LookType 75 is GM
    protected _outfit : IOutfit = { lookType: DEFAULT_LOOK.LOOK_TYPE, lookTypeEx: 0, lookHead: DEFAULT_LOOK.LOOK_HEAD, lookBody: DEFAULT_LOOK.LOOK_BODY, lookLegs: DEFAULT_LOOK.LOOK_LEGS, lookFeet: DEFAULT_LOOK.LOOK_FEET, lookMount: 0 };
    protected _skills : Skills = new Skills();
    protected _varSpeed : number = 0;

    protected abstract _type : CREATURE_TYPE;

    public get extId() : number {
        return this._extId;
    }

    public get health() : number {
        return this._health;
    }

    public get maxHealth() : number {
        return this._maxHealth;
    }

    public get freeCapacity() : number {
        return this._freeCapacity;
    }

    public get experience() : number {
        return this._experience;
    }

    public get level() : number {
        return this._level;
    }

    public get levelPercent() : number {
        return this._levelPercent;
    }

    public get mana() : number {
        return this._mana;
    }

    public get maxMana() : number {
        return this._maxMana;
    }

    public get magicLevel() : number {
        return this._magicLevel;
    }

    public get magicLevelPercent() : number {
        return this._magicLevelPercent;
    }

    public get soulPoints() : number {
        return this._soulPoints;
    }

    public get direction() : CREATURE_DIRECTION {
        return this._direction;
    }

    public get outfit() : IOutfit {
        return this._outfit;
    }

    public get skills() : Skills {
        return this._skills;
    }

    public get speed() : number {
        return BASE_SPEED ? BASE_SPEED + this._varSpeed : 220;
    }

    public get type() : CREATURE_TYPE {
        return this._type;
    }

    public set direction(value : CREATURE_DIRECTION) {
        this._direction = value;
    }

    public set health(value : number){
        this._health = value;
    }

    public set maxHealth(value : number){
        this._maxHealth = value;
    }

    public set mana(value : number){
        this._mana = value;
    }

    public set maxMana(value : number){
        this._maxMana = value;
    }

    public set level(value : number){
        this._level = value;
    }

    public set magicLevel(value : number){
        this._magicLevel = value;
    }

    public set magicLevelPercent(value : number){
        this._magicLevelPercent = value;
    }

    public set experience(value : number){
        this._experience = value;
    }

    public turnNorth() : CREATURE_DIRECTION {
        this.direction = CREATURE_DIRECTION.NORTH;
        return this.direction;
    }

    public turnEast() : CREATURE_DIRECTION {
        this.direction = CREATURE_DIRECTION.EAST;
        return this.direction;
    }

    public turnSouth() : CREATURE_DIRECTION {
        this.direction = CREATURE_DIRECTION.SOUTH;
        return this.direction;
    }

    public turnWest() : CREATURE_DIRECTION {
        this.direction = CREATURE_DIRECTION.WEST;
        return this.direction;
    }

    public moveNorth(){
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: --y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.NORTH;
            return true;
        }else{
            return false;
        }
    }

    public moveEast(){
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: ++x, y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.EAST;
            return true;
        }else{
            return false;
        }
    }

    public moveSouth(){
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: ++y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.SOUTH;
            return true;
        }else{
            return false;
        }
    }

    public moveWest(){
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: --x, y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.WEST;
            return true;
        }else{
            return false;
        }
    }

    public isHealthHidden() : boolean {
        return this._hiddenHealth;
    }

    public getHealthPercent() : number {
        return Math.ceil((this._health / this.maxHealth) * 100);
    }

    public isPlayer() : boolean {
        return this._type === CREATURE_TYPE.CREATURE_TYPE_PLAYER;
    }

    public isNPC() : boolean {
        return this._type === CREATURE_TYPE.CREATURE_TYPE_NPC;
    }

    public canSee(position : IPosition) : boolean {
        const { x, y, z } = position;

        if (this.position.z <= MAP.SEA_FLOOR){
            if (z > MAP.SEA_FLOOR){
                return false;
            }
        }
        else {
            if (Math.abs(this.position.z - z) > 2){
                return false;
            }
        }

        let offsetZ = this.position.z - z;

        if (
            (x >= this.position.x - CLIENT_VIEWPORT.MAX_X + offsetZ) &&
            (x <= this.position.x + (CLIENT_VIEWPORT.MAX_X + 1) + offsetZ) &&
            (y >= this.position.y - CLIENT_VIEWPORT.MAX_Y + offsetZ) &&
            (y <= this.position.y + (CLIENT_VIEWPORT.MAX_Y + 1) + offsetZ)){
            return true;
        }

        return false;
    }

    public setOutfit(lookType: number, lookHead : number, lookBody : number, lookLegs : number, lookFeet : number) : void {
        this._outfit.lookType = lookType;
        this._outfit.lookHead = lookHead;
        this._outfit.lookBody = lookBody;
        this._outfit.lookLegs = lookLegs;
        this._outfit.lookFeet = lookFeet;
    }

    public setDirectionFromPositions(fromPosition : IPosition, toPosition : IPosition) : void {
        if (fromPosition.x < toPosition.x){
            this._direction = CREATURE_DIRECTION.EAST;
        }else{
            this._direction = CREATURE_DIRECTION.WEST;
        }
    }
}