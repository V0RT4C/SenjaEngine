import log from 'Logger';
import { Thing } from 'Thing';
import { THING_TYPE } from 'Constants';
import rawItems from "RawItems";
import { IPosition } from '../@types/App.d.ts';
import game from './Game.class.ts';
import { stringifyPosition } from './Lib/string.lib.ts';
import { UpdateTileItemOp } from './Operations/UpdateTileItemOp.class.ts';

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
    protected _otbmAttributes : any = {};

    public get flags() : any {
        return this._rawItem !== null && this._rawItem.flags ? this._rawItem.flags : {};
    }

    public get attributes() : any {
        return this._rawItem !== null && this._rawItem.attributes ? this._rawItem.attributes : {};
    }

    public get rawItem(){
        return this._rawItem;
    }

    public get article() : string {
        return this._rawItem.article !== undefined ? this._rawItem.article : "";
    }

    public get weight() : number {
        return this._rawItem.attributes.weight !== undefined ? this._rawItem.attributes.weight : 0;
    }

    public get attack() : number {
        return this._rawItem.attributes.attack !== undefined ? this._rawItem.attributes.attack : 0;
    }

    public get defence() : number {
        return this._rawItem.attributes.defence !== undefined ? this._rawItem.attributes.defence : 0;
    }

    public get description() : string {
        return this._rawItem.description ? this._rawItem.description : "";
    }

    public get text() : string {
        return this._otbmAttributes.text ? this._otbmAttributes.text : "";
    }

    public isContainer(){
        return this._rawItem.group === 'container';
    }

    public isWeapon(){
        return this._rawItem.group === 'weapon';
    }

    public isMovable(){
        return this._rawItem.flags.moveable === true;
    }

    public isPickupable(){
        return this._rawItem.flags.pickupable === true;
    }

    public isTeleport() : boolean {
        return this._otbmAttributes.destination !== undefined;
    }

    public getDestination() : IPosition {
        if (this._otbmAttributes.destination !== undefined){
            return this._otbmAttributes.destination;
        }else{
            return { x: -1, y: -1, z: -1 };
        }
    }

    public setOTBMAttributes(otbmAttributes : any){
        this._otbmAttributes = otbmAttributes;
    }

    public onMove(){}
    public onAppear(){}
}