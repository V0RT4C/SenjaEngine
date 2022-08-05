import log from 'Logger';
import { PROTOCOL_RECEIVE } from "../../Constants/Network.const.ts";
import { TCP } from "../../deps.ts";
import game from "../../Game/Game.class.ts";
import { IncomingGameOperation } from "../Protocol/Incoming/Operations/IncomingGameOperation.abstract.ts";
import { IncomingNetworkMessage } from "./IncomingNetworkMessage.class.ts";

export class NetworkMessageHandler {
    private _operations : { [key in PROTOCOL_RECEIVE]? : IncomingGameOperation } | { [any: string] : IncomingGameOperation } = {};

    public useOperations(opObject : { [key in PROTOCOL_RECEIVE]? : IncomingGameOperation } | { [any: string] : IncomingGameOperation }){
        this._operations = opObject;
    }

    public handleNetworkMessage(client : TCP.Client, data : Uint8Array){
        const buffer = new IncomingNetworkMessage(data, client);

        do {
            const _length : number = buffer.readUint16LE();
            const op : PROTOCOL_RECEIVE = buffer.readUint8() as PROTOCOL_RECEIVE;

            if (this._operations[op] !== undefined){
                const operation : IncomingGameOperation = new (this._operations[op] as any)(buffer);
                if (operation.parseMessage !== undefined){
                    operation.parseMessage();
                }

                game.addOperation(operation);
            }else{
                log.warning(`Dont have that OP code: ${op}`);
                log.debug(buffer.position);
                buffer.seek(buffer.byteLength);
            }

        } while(buffer.position !== buffer.byteLength)
    }
}