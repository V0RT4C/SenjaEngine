import { TCP } from 'Dependencies';
import { Bytes } from "Game/Lib/Bytes/Bytes.class.ts";

export class NetworkMessage extends Bytes {
    protected _client : TCP.Client | undefined;

    public get client() : TCP.Client | undefined {
        return this._client;
    }

    public setClient(client : TCP.Client) : void {
        this._client = client;
    }
}