import { MapTile } from '~/Lib/OTBM/MapTile.class.ts';

export class MapHouseTile extends MapTile {
    protected _houseId! : number;

    public set houseId(value : number) {
        this._houseId = value;
    }
}