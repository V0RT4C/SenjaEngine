import { GameOperation } from "~/Game/GameOperation.abstract.ts";

export abstract class ScheduledEvent extends GameOperation {
    protected _createdAt : number = Date.now(); 

    public async execute(): Promise<void | boolean> {
        const internalOperationsIsAsync = this._internalOperations.constructor.name === 'AsyncFunction';

        try {
            if (internalOperationsIsAsync){
                if (await this._internalOperations()){
                    return await this._networkOperations();
                }else{
                    return false;
                }
            }else{
                if (this._internalOperations()){
                    return await this._networkOperations();
                }else{
                    return false;
                }
            }
        }catch(err){
            console.log(err);
        }
    }
}