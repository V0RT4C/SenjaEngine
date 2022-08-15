import { TCPServerOptions } from "Types";

export class TCPServer {
    constructor(private _opt : TCPServerOptions){
        _opt.chunkSize = _opt.chunkSize || 1024 * 1024;
    }

    public listen(){
        const server = Deno.listen(this._opt);
    }
}