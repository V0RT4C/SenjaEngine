import map from 'Map';
import { MapTile } from 'MapTile';

import { THING_TYPE } from 'Constants';
import { ILightInfo, IPosition } from "Types";


export abstract class Thing {

    protected _name! : string;
    protected _thingId! : number;
    protected _pos : IPosition = { x: -1, y: -1, z: -1 };
    protected _previousPos : IPosition = { x: -1, y: -1, z: -1 };
    protected _lightInfo : ILightInfo = { color: 0xD7, level: 5 };
    protected abstract _thingType : THING_TYPE;

    //Set of actions to perform when thing moves
    public abstract onMove() : void;
    public abstract onAppear() : void;

    public get name() : string {
        return this._name;
    }

    public set name(value : string) {
        this._name = value;
    }

    public get thingId() : number {
        return this._thingId;
    }

    public set thingId(value : number) {
        this._thingId = value;
    }

    public get position() : IPosition {
        return this._pos;
    }

    public set position(position : IPosition) {
        this._pos.x = position.x;
        this._pos.y = position.y;
        this._pos.z = position.z;
    }

    public get previousPosition() : IPosition {
        return this._previousPos;
    }

    public get thingType() : THING_TYPE {
        return this._thingType;
    }

    public get lightInfo() : ILightInfo {
        return this._lightInfo;
    }

    public set lightInfo(info : ILightInfo) {
        this._lightInfo = { ...info };
    } 

    public getTile() : MapTile | null {
        return map.getTileAt(this._pos);
    }

    public getStackPosition() : number {
        const tile = this.getTile();
        if (tile === null){
            return -1;
        }

        return tile.getThingStackPos(this);
    }

    public move(toPosition : IPosition, stackPosition? : number) : boolean {
        stackPosition = stackPosition !== undefined ? stackPosition : this.getStackPosition();
        if (stackPosition === -1){
            return false;
        }else{
            const moveSuccess = map.moveThing(this.position, stackPosition, toPosition);
            if (moveSuccess){
                return moveSuccess;
            }else{
                return false;
            }
        }
    }

    public setPosition(position : IPosition) : void {
        this._pos.x = position.x;
        this._pos.y = position.y;
        this._pos.z = position.z;
    }

    public setPreviousPosition(position : IPosition) : void {
        this._previousPos.x = position.x;
        this._previousPos.y = position.y;
        this._previousPos.z = position.z;
    }

    public isItem() : boolean {
        return this._thingType === THING_TYPE.ITEM;
    }

    public isMonster() : boolean {
        return this._thingType === THING_TYPE.MONSTER;
    }

    public isPlayer() : boolean {
        return this._thingType === THING_TYPE.PLAYER;
    }

    public isNPC() : boolean {
        return this._thingType === THING_TYPE.NPC;
    }

    public isCreature() : boolean {
        return false;
    }
}