import log from 'Logger';
import { Thing } from 'Thing';

import map from "Map";
import { CLIENT_VIEWPORT, CREATURE_DIRECTION, CREATURE_TYPE, DEFAULT_LOOK, FIGHT_MODE, MAP } from 'Constants';
import { IOutfit, IPosition } from "Types";
import { BASE_SPEED } from "Config";
import { Skills } from "Game/Skills.class.ts";
import { MapTile } from './Map/MapTile.class.ts';
import { GAME_BEAT_MS } from '../Constants/Game.const.ts';
import game from './Game.class.ts';

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
    protected _fightMode : FIGHT_MODE = FIGHT_MODE.BALANCED;
    //LookType 75 is GM
    protected _outfit : IOutfit = { lookType: DEFAULT_LOOK.LOOK_TYPE, lookTypeEx: 0, lookHead: DEFAULT_LOOK.LOOK_HEAD, lookBody: DEFAULT_LOOK.LOOK_BODY, lookLegs: DEFAULT_LOOK.LOOK_LEGS, lookFeet: DEFAULT_LOOK.LOOK_FEET, lookMount: 0 };
    protected _skills : Skills = new Skills();
    protected _lastWalkTimeMS = 0;
    protected _lastWalkTimeGameTicks = 0;
    protected _isAutoWalking = false;
    protected _autoWalkId = -1;

    protected abstract _type : CREATURE_TYPE;

    public get extId() : number {
        return this._extId;
    }

    public get health() : number {
        return this._health;
    }

    public set health(value : number){
        this._health = value;
    }
    
    public get maxHealth() : number {
        return this._maxHealth;
    }

    public set maxHealth(value : number){
        this._maxHealth = value;
    }
    
    public get freeCapacity() : number {
        return this._freeCapacity;
    }
    
    public get experience() : number {
        return this._experience;
    }

    public set experience(value : number){
        this._experience = value;
    }
    
    public get level() : number {
        return this._level;
    }

    public set level(value : number){
        this._level = value;
    }

    public get levelPercent() : number {
        return this._levelPercent;
    }
    
    public get mana() : number {
        return this._mana;
    }

    public set mana(value : number){
        this._mana = value;
    }
    
    public get maxMana() : number {
        return this._maxMana;
    }

    public set maxMana(value : number){
        this._maxMana = value;
    }
    
    public get magicLevel() : number {
        return this._magicLevel;
    }
    
    public set magicLevel(value : number){
        this._magicLevel = value;
    }
    
    public get magicLevelPercent() : number {
        return this._magicLevelPercent;
    }

    public set magicLevelPercent(value : number){
        this._magicLevelPercent = value;
    }

    public get soulPoints() : number {
        return this._soulPoints;
    }

    public get direction() : CREATURE_DIRECTION {
        return this._direction;
    }

    public set direction(value : CREATURE_DIRECTION) {
        this._direction = value;
    }

    public get outfit() : IOutfit {
        return this._outfit;
    }

    public get skills() : Skills {
        return this._skills;
    }

    public get speed() : number {
        return BASE_SPEED ? (BASE_SPEED + (2*(this._level - 1))) : 220;
    }

    public get type() : CREATURE_TYPE {
        return this._type;
    }

    public get lastWalkTimeMS() : number {
        return this._lastWalkTimeMS;
    }

    public get fightMode() : FIGHT_MODE {
        return this._fightMode;
    }

    public get autoWalkId() : number {
        return this._autoWalkId;
    }

    public set autoWalkId(value : number) {
        this._autoWalkId = value;
    }

    public set fightMode(value : FIGHT_MODE) {
        this._fightMode = value;
    }

    public set isAutoWalking(value : boolean) {
        this._isAutoWalking = value;
    }

    public get isAutoWalking() : boolean {
        return this._isAutoWalking;
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
        this.onMove();
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: --y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.NORTH;
            return true;
        }else{
            return false;
        }
    }

    public moveNorthEast(){
        this.onMove();
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: ++x, y: --y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.EAST;
            return true;
        }else{
            return false;
        }
    }

    public moveNorthWest(){
        if (!this.isAllowedToWalk()){
            return false;
        }
        this.onMove();
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: --x, y: --y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.WEST;
            return true;
        }else{
            return false;
        }
    }

    public moveUpNorth(){
        //this.onMove();
        this._previousPos = this.position;
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: --y, z: --z }, this.extId)){
            this.direction = CREATURE_DIRECTION.NORTH;
            return true;
        }else{
            return false;
        }
    }

    public moveEast(){
        this.onMove();
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: ++x, y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.EAST;
            return true;
        }else{
            return false;
        }
    }

    public moveSouth(){
        this.onMove();
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: ++y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.SOUTH;
            return true;
        }else{
            return false;
        }
    }

    public moveSouthEast(){
        this.onMove();
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: ++x, y: ++y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.EAST;
            return true;
        }else{
            return false;
        }
    }

    public moveSouthWest(){
        this.onMove();
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: --x, y: ++y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.EAST;
            return true;
        }else{
            return false;
        }
    }

    public moveWest(){
        this.onMove();
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: --x, y, z }, this.extId)){
            this.direction = CREATURE_DIRECTION.WEST;
            return true;
        }else{
            return false;
        }
    }

    public moveDown(){
        //this.onMove();
        this._previousPos = this.position;
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: ++y, z: ++z }, this.extId)){
            this.direction = CREATURE_DIRECTION.SOUTH;
            return true;
        }else{
            return false;
        }
    }

    public onMove(): void {
        this._lastWalkTimeMS = Date.now();
        this._lastWalkTimeGameTicks = game.ticks;
        this._previousPos = this.position;
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

    public getCurrentTileStepTimeMS() : number {
        const tile : MapTile | null = map.getTileAt(this._pos);

        if (tile === null){
            return 681.81;
        }

        if (this.getLastMoveCost() === 2){
            return tile.getMovementSpeedMS(220) * 2;
        }else{
            return tile.getMovementSpeedMS(this.speed);
        }
    }

    public getCurrentTileStepTimeGameTicks() : number {
        return Math.max(Math.floor(this.getCurrentTileStepTimeMS() / GAME_BEAT_MS), 1);
    }

    public getNextAllowedWalkInGameTicks() : number {
        return Math.floor(this.getCurrentTileStepTimeGameTicks()) + game.ticks;
    }

    public getLastMoveCost() : number {
        // if (this._previousPos.z !== this.position.z){
        //     return 2;
        // }

        if (this._previousPos.x !== this.position.x && (this._previousPos.y > this.position.y || this._previousPos.y < this.position.y)){
            return 2;
        }

        return 1;
    }

    public isAllowedToWalk() : boolean {
        if (this._lastWalkTimeGameTicks === 0){
            return true;
        }

        return (game.ticks - this._lastWalkTimeGameTicks) >= this.getCurrentTileStepTimeGameTicks();
    }

    public stopAutoWalk() : boolean {
        return game.removeScheduledTaskById(this._autoWalkId);
    }

    public getCurrentTile() : MapTile | null {
        return map.getTileAt(this.position);
    }
}