import { OTBMNode } from '~/Lib/OTBM/OTBMNode.abstract.class.ts';

export class OTBMItem extends OTBMNode {
    protected _id! : number;

    public set id(value : number) {
        this._id = value;
    }
}