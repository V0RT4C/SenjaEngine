import { NetworkMessage } from "NetworkMessage";
import { TCP } from 'Dependencies';
import { IPosition } from "Types";

export class IncomingNetworkMessage extends NetworkMessage {
    constructor(msg: Uint8Array, client : TCP.Client){
        super(msg);
        this._client = client;
    }

    public readString() : string {
        const length : number = this.readUint16LE();
        const strArr : number[] = new Array();

        for (let i=0; i < length; i++){
            strArr.push(this.readUint8());
        }

        return String.fromCharCode(...strArr);
    }

    public readPosition() : IPosition {
        return { x: this.readUint16LE(), y: this.readUint16LE(), z: this.readUint8() };
    }
}