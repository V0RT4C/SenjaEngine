import { OTBMNode } from '~/Lib/OTBM/OTBMNode.abstract.class.ts';

export class MapTileArea extends OTBMNode {
    protected _x!: number;
    protected _y!: number;
    protected _z!: number;
    private _tiles : OTBMNode[] = [];

    public set x(value : number) {
        this._x = value;
    }

    public set y(value : number) {
        this._y = value;
    }

    public set z(value : number) {
        this._z = value;
    }

    public set tiles(value : OTBMNode[]) {
        this._tiles = value;
    } 
}