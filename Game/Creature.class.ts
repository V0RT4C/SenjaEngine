import log from 'Logger';
import { Thing } from 'Thing';

import map from "Map";
import { CLIENT_VIEWPORT, CREATURE_DIRECTION, DEFAULT_LOOK, FIGHT_MODE, MAP } from 'Constants';
import { IOutfit, IPosition } from "Types";
import { BASE_SPEED } from "Config";
import { Skills } from "Game/Skills.class.ts";
import { MapTile } from './Map/MapTile.class.ts';
import { GAME_BEAT_MS } from '../Constants/Game.const.ts';
import game from './Game.class.ts';
import { WALK_DIRECTION } from '../Constants/Map.const.ts';

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
    protected _nextAllowableWalkTimeGameTicks = 0;
    protected _nextAllowableWalkTimeMS = 0;
    protected _autoWalkId = -1;
    protected _scheduledWalkTasks : { direction: WALK_DIRECTION, force: boolean }[] = [];

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

    public get scheduledWalkTasks() : { direction: WALK_DIRECTION, force: boolean }[] {
        return this._scheduledWalkTasks;
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

    public moveNorth(force = false){
        if (!this.isAllowedToWalk()){
            return false;
        }
        const previousPos = { ...this.position };

        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: --y, z }, this.extId, force)){
            this.direction = CREATURE_DIRECTION.NORTH;
            this.setPreviousPosition(previousPos);
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveNorthEast(force = false){
        if (!this.isAllowedToWalk()){
            return false;
        }

        const previousPos = { ...this.position };

        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: ++x, y: --y, z }, this.extId, force)){
            this.direction = CREATURE_DIRECTION.EAST;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveNorthWest(force = false){
        if (!this.isAllowedToWalk()){
            return false;
        }
        const previousPos = { ...this.position };
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: --x, y: --y, z }, this.extId, force)){
            this.direction = CREATURE_DIRECTION.WEST;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveUpNorth(){
        const previousPos = { ...this.position };
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: --y, z: --z }, this.extId)){
            this.direction = CREATURE_DIRECTION.NORTH;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveEast(force = false){
        if (!this.isAllowedToWalk()){
            return false;
        }
        const previousPos = { ...this.position };
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: ++x, y, z }, this.extId, force)){
            this.direction = CREATURE_DIRECTION.EAST;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveSouth(force = false){
        if (!this.isAllowedToWalk()){
            return false;
        }
        const previousPos = { ...this.position };
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x, y: ++y, z }, this.extId, force)){
            this.direction = CREATURE_DIRECTION.SOUTH;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveSouthEast(force = false){
        if (!this.isAllowedToWalk()){
            return false;
        }
        const previousPos = { ...this.position };
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: ++x, y: ++y, z }, this.extId, force)){
            this.direction = CREATURE_DIRECTION.EAST;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveSouthWest(force = false){
        if (!this.isAllowedToWalk()){
            return false;
        }
        const previousPos = { ...this.position };
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: --x, y: ++y, z }, this.extId, force)){
            this.direction = CREATURE_DIRECTION.EAST;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveWest(force = false){
        if (!this.isAllowedToWalk()){
            return false;
        }
        const previousPos = { ...this.position };
        let { x, y, z } = this.position;
        if (map.moveCreatureByExtId(this.position, { x: --x, y, z }, this.extId, force)){
            this.direction = CREATURE_DIRECTION.WEST;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public moveDown(){
        const previousPos = { ...this.position };
        let { x, y, z } = this.position;
        let toTile = map.getTileAt({ x, y, z: z+1 });

        if (toTile === null){
            return false;
        }
        let toPosition : IPosition;

        if (toTile.isFloorChange()){
            toPosition = { x, y: ++y, z: ++z }
        }else{
            toPosition = { x, y: y, z: ++z }
        }

        if (map.moveCreatureByExtId(this.position, toPosition, this.extId)){
            this.direction = CREATURE_DIRECTION.SOUTH;
            this._previousPos = previousPos;
            this.onMove();
            return true;
        }else{
            return false;
        }
    }

    public onMove(): void {
        this._lastWalkTimeMS = Date.now();
        this._lastWalkTimeGameTicks = game.ticks;
        this._nextAllowableWalkTimeGameTicks = this._lastWalkTimeGameTicks + this.getCurrentTileStepTickTimeWithCosts();
        this._nextAllowableWalkTimeMS = this._lastWalkTimeMS + this.getCurrentTileStepTimeWithCostsMS();
    }

    public onAppear(){}

    public isHealthHidden() : boolean {
        return this._hiddenHealth;
    }

    public getHealthPercent() : number {
        return Math.ceil((this._health / this.maxHealth) * 100);
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

    public canReach(position : IPosition){
        if (
            Math.abs(this.position.x - position.x) > 1 || 
            Math.abs(this.position.y - position.y) > 1 || 
            this.position.z !== position.z
            ){
                return false;
            }
            else{
                return true;
            }
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

    public getCurrentTileStepTimeMS(speed? : number) : number {
        const tile : MapTile | null = map.getTileAt(this._pos);

        if (tile === null){
            return 680;
        }

        return Math.floor(tile.getMovementSpeedMS(speed ? speed : this.speed));
    }

    public getCurrentTileStepTimeGameTicks(speed? : number) : number {
        return Math.max(Math.floor(this.getCurrentTileStepTimeMS(speed ? speed : this.speed) / GAME_BEAT_MS), 1);
    }

    public getNextAllowedWalkInGameTicks() : number {
        return this._nextAllowableWalkTimeGameTicks;
    }

    public getCurrentTileStepTickTimeWithCosts() : number {
        let moveSpeed = this.speed;

        if (this.lastMoveWasDiagonal()){
            moveSpeed = BASE_SPEED;
        }

        if (this.lastMoveWasFloorChange()){
            moveSpeed = BASE_SPEED * 2;
        }

        return this.getCurrentTileStepTimeGameTicks(moveSpeed) * this.getLastMoveCost();
    }

    public getCurrentTileStepTimeWithCostsMS() : number {
        let moveSpeed = this.speed;

        if (this.lastMoveWasDiagonal()){
            moveSpeed = BASE_SPEED;
        }

        if (this.lastMoveWasFloorChange()){
            moveSpeed = BASE_SPEED * 4;
        }

        const ms = Math.floor(this.getCurrentTileStepTimeMS(moveSpeed) * this.getLastMoveCost());
        return ms <= 65534 ? ms : 65534;
    }

    public getLastMoveCost() : number {
        return this.lastMoveWasDiagonal() || this.lastMoveWasFloorChange() ? 2 : 1;
    }

    public lastMoveWasDiagonal() : boolean {
        if (this._previousPos.x === -1){
            return false;
        }

        if (this._previousPos.x !== this.position.x && (this._previousPos.y > this.position.y || this._previousPos.y < this.position.y)){
            log.debug(`Last move was diagonal.`);
            return true;
        }else{
            return false;
        }
    }

    public lastMoveWasFloorChange() : boolean {
        if (this._previousPos.x === -1){
            return false;
        }

        return this._previousPos.z !== this.position.z;
    }

    public isAllowedToWalk() : boolean {
        return game.ticks >= this._nextAllowableWalkTimeGameTicks;
        //return Date.now() >= this._nextAllowableWalkTimeMS;
    }

    public addWalkTask(direction : WALK_DIRECTION, force = false) : void {
        this._scheduledWalkTasks.unshift({ direction, force });
    }

    public stopAutoWalk() : void {
        //return game.removeScheduledTaskById(this._autoWalkId);
        this._scheduledWalkTasks.length = 0;
        this._scheduledWalkTasks = [];
    }

    public isAutoWalking() : boolean {
        return this._scheduledWalkTasks.length > 1;
    }

    public getCurrentTile() : MapTile | null {
        return map.getTileAt(this.position);
    }

    public isCreature(): boolean {
        return true;
    }
}