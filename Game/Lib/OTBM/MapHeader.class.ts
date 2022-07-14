import { OTBMNode } from './OTBMNode.abstract.class.ts';
import { BytesBuffer } from '~/Lib/Bytes/Bytes.class.ts'
import { OTBM_HEADER } from 'Constants';

export class MapHeader extends OTBMNode {
    private _version! : number;
    private _width! : number;
    private _height! : number;
    private _versionMajor! : number;
    private _versionMinor! : number;

    public get version() : number {
        return this._version;
    }

    public get width() : number {
        return this._width;
    }

    public get height() : number {
        return this._height;
    }

    public get versionMajor() : number {
        return this._versionMajor;
    }

    public get versionMinor() : number {
        return this._versionMinor;
    }

    public setFromBuffer(buffer : BytesBuffer) : void {
        this._type = OTBM_HEADER.OTBM_MAP_HEADER;
        this._version = buffer.readUint32LE(1);
        this._width = buffer.readUint16LE(5);
        this._height = buffer.readUint16LE(7);
        this._versionMajor = buffer.readUint32LE(9);
        this._versionMinor = buffer.readUint32LE(13);
    }

    // public set version(value : number) {
    //     this._version = value;
    // }

    // public set width(value : number) {
    //     this._width = value;
    // }

    // public set height(value : number) {
    //     this._height = value;
    // }

    // public set versionMajor(value : number) {
    //     this._versionMajor = value;
    // }

    // public set versionMinor(value : number) {
    //     this._versionMinor = value;
    // }
}