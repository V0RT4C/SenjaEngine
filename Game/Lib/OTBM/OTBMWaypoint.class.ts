import { OTBMNode } from '~/Lib/OTBM/OTBMNode.abstract.class.ts';

export class OTBMWaypoint extends OTBMNode {
    protected _name! : string;
    protected _x!: number;
    protected _y!: number;
    protected _z!: number;

    public set name(value : string) {
        this._name = value;
    }

    public set x(value : number) {
        this._x = value;
    }

    public set y(value : number) {
        this._y = value;
    }

    public set z(value : number) {
        this._z = value;
    }
}