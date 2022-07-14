import { OTBMNode } from '~/Lib/OTBM/OTBMNode.abstract.class.ts';

export class MapTile extends OTBMNode {
    protected _x!: number;
    protected _y!: number;

    public set x(value : number) {
        this._x = value;
    }

    public set y(value : number) {
        this._y = value;
    }
}