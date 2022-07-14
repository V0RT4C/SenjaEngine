import map from 'Map';
import { MapTile } from 'MapTile';

import { THING_TYPE } from 'Constants';
import { ILightInfo, IPosition } from "Types";


export abstract class Thing {

    protected _name! : string;
    protected _thingId! : number;
    protected _tileIndex : number = -1;
    protected _pos : IPosition = { x: -1, y: -1, z: -1 };
    protected _lightInfo : ILightInfo = { color: 0xD7, level: 5 };
    protected abstract _thingType : THING_TYPE;

    //Set of actions to perform when thing moves
    public abstract onMove() : void;

    public get name() : string {
        return this._name;
    }

    public get thingId() : number {
        return this._thingId;
    }

    public get tileIndex() : number {
        return this._tileIndex;
    }

    public get position() : IPosition {
        return this._pos;
    }

    public get thingType() : THING_TYPE {
        return this._thingType;
    }

    public get lightInfo() : ILightInfo {
        return this._lightInfo;
    }

    public set lightInfo(info : ILightInfo) {
        this._lightInfo = info;
    } 

    public getTile() : MapTile | null {
        return map.getTileAt(this._pos);
    }

    public set name(value : string) {
        this._name = value;
    }
    
    public set thingId(value : number) {
        this._thingId = value;
    }

    public set tileIndex(value : number) {
        this._tileIndex = value;
    }

    public setPosition(x : number, y : number, z : number) : void {
        this._pos.x = x;
        this._pos.y = y;
        this._pos.z = z;
    }

    public set position(pos : IPosition) {
        this._pos = pos;
    }
}