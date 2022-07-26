import { Thing } from 'Thing';
import { THING_TYPE } from 'Constants';
import rawItems from "RawItems";

export class Item extends Thing {
    constructor(thingId : number){
        super();
        this._thingId = thingId;
        this._rawItem = rawItems.getItemById(thingId);
        if (this._rawItem !== null){
            this._name = this._rawItem.name;
        }
    }
    protected _thingType = THING_TYPE.ITEM;
    protected _rawItem! : any;

    public get flags() : any {
        return this._rawItem !== null && this._rawItem.flags ? this._rawItem.flags : {};
    }

    public isContainer(){
        return this._rawItem.group === 'container';
    }

    public isMovable(){
        return this._rawItem.flags.moveable === true;
    }

    public onMove(){}
}