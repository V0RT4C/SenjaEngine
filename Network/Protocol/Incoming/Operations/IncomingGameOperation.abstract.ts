import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { GameOperation } from "Game/GameOperation.abstract.ts";

export abstract class IncomingGameOperation extends GameOperation {
    constructor(msg : IncomingNetworkMessage){
        super();
        this._msg = msg;
    }

    protected _msg : IncomingNetworkMessage;

    public parseMessage?() : void;

    public async execute(): Promise<void> {
        const internalOperationsIsAsync = this._internalOperations.constructor.name === 'AsyncFunction';

        if (internalOperationsIsAsync){
            if (await this._internalOperations()){
                await this._networkOperations();
            }
        }else{
            if (this._internalOperations()){
                await this._networkOperations();
            }
        }
    }
}

