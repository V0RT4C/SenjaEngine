import { Creature } from "Creature";
import { CREATURE_TYPE, THING_TYPE } from "Constants";

export class NPC extends Creature {
    constructor(name : string, extId : number){
        super();
        this._name = name;
        this._extId = extId;
    }

    protected _thingType = THING_TYPE.NPC;

    protected _outfit = { lookType: 130, lookHead: 95, lookBody: 114, lookLegs: 114, lookFeet: 114, lookMount: 0, lookTypeEx: 0 };
    public onMove(){}
}