import { ScheduledTask } from "./ScheduledTask.abstract.ts";

export abstract class ScheduledTaskGroup {
    constructor(isAtomic? : boolean){
        if (isAtomic !== undefined){
            this._isAtomic = isAtomic;
        }

        ScheduledTaskGroup.id++;
        this._id = ScheduledTaskGroup.id;
    }

    public static id = 0;

    protected _id : number;
    protected _list : ScheduledTask[] = [];
    protected _isAtomic = true;
    protected _hasStarted = false;

    
    public get id() : number {
        return this._id;
    }
    
    public get list() : ScheduledTask[] {
        return this._list;
    }
    
    public get isAtomic() : boolean {
        return this._isAtomic;
    }
    
    public get hasStarted() : boolean {
        return this._hasStarted;
    }
    
    public setScheduledTasks(events : ScheduledTask[]){
        this._list = events;
    }
    
    public addScheduledTask(event : ScheduledTask){
        this._list.unshift(event);
    }
    
    public abstract canExecuteNextTask() : boolean;
    public abstract executeNextTask() : boolean | Promise<boolean>;
    public abstract onStart() : void;
    public abstract onAbort() : void;
    public abstract onFinish() : void;
}