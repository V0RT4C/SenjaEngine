import players from "Game/Player/Players.class.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";

export function StaticImplements<T>() {
    return <U extends T>(constructor: U) => {constructor};
}

export function IncomingGameOperation(){
    return function<T extends {new(...args : any[]) : {}}>(originalConstructor : T){  
        return class extends originalConstructor {
            constructor(...args : any[]){
                
                const player = players.getPlayerById(args[0].client?.conn?.rid as number);

                if (player === null){
                    throw new Error('Player cant be null');
                }
        
                super(player);
                this._msg = args[0];

                // if ((this as any).parseMessage){
                //     (this as any).parseMessage();
                // }
            }

            protected _msg! : IncomingNetworkMessage;
        }
    }
}