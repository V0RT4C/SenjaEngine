import { Map } from 'types';

export abstract class OTBMNode {
    protected _type! : number;
    protected _text : string | undefined;
    protected _spawnFile : string | undefined;
    protected _houseFile : string | undefined;
    protected _houseDoorId : number | undefined;
    protected _description : string | undefined;
    protected _depotId : number | undefined;
    protected _tileFlags : Map.OTBMTileFlags | undefined;
    protected _charges : number | undefined;
    protected _count : number | undefined;
    protected _tileId : number | undefined;
    protected _actionId : number | undefined;
    protected _uniqueId : number | undefined;
    protected _destination : Map.Position | undefined;
    protected _parent : OTBMNode | undefined;
    protected _children : OTBMNode[] = [];

    public set type(value : number) {
        this._type = value;
    }

    public get type() : number {
        return this._type;
    }

    public get children() : OTBMNode[] {
        return this._children;
    }

    public get parent() : OTBMNode | undefined {
        return this._parent;
    }

    public set parent(value : OTBMNode | undefined) {
        this._parent = value;
    }

    public set children(value : OTBMNode[]) {
        this._children = value;
    }

    public setAttributes(attributes : Map.OTBMNodeAttributes) : void {
        this._text = attributes.text;
        this._spawnFile = attributes.spawnfile;
        this._houseFile = attributes.housefile;
        this._houseDoorId = attributes.houseDoorId;
        this._description = attributes.description;
        this._depotId = attributes.depotId;
        this._tileFlags = attributes.tileFlags;
        this._charges = attributes.charges;
        this._count = attributes.count;
        this._tileId = attributes.tileId;
        this._actionId = attributes.actionId;
        this._uniqueId = attributes.uniqueId;
        this._destination = attributes.destination;
    }
}