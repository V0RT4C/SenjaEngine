import { GameOperation } from "~/Game/GameOperation.abstract.ts";

export abstract class ScheduledTask extends GameOperation {
    constructor(scheduledAtGameTick? : number){
        super();
        ScheduledTask.id++;
        this._id = ScheduledTask.id;
        if (scheduledAtGameTick !== undefined){
            this._scheduledAtGameTick = scheduledAtGameTick;
        }
    }

    protected _createdAt : number = Date.now();
    protected _scheduledAtGameTick = 0;
    protected _id : number;
    public retries = 0;
    public maxRetries = 5;

    public static id = 4.5035996e+15;

    public get id() : number {
        return this._id;
    }

    public get scheduledAtGameTick() : number {
        return this._scheduledAtGameTick;
    }

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