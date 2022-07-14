import { Thing } from 'Thing';
import { THING_TYPE } from 'Constants';

export class Item extends Thing {
    constructor(thingId : number){
        super();
        this._thingId = thingId;
    }
    protected _thingType = THING_TYPE.ITEM;

    public onMove(){}
}