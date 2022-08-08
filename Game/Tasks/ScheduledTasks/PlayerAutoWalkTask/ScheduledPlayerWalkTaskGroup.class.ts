import { Player } from "~/Game/Player/Player.class.ts";
import { ScheduledTaskGroup } from "../ScheduledTaskGroup.abstract.ts";
import { ScheduledPlayerWalkTask } from "./ScheduledPlayerWalkTask.class.ts";

export class ScheduledPlayerWalkTaskGroup extends ScheduledTaskGroup {
    constructor(private readonly _player : Player){ super(); }

    public onStart(): void {
        this._hasStarted = true;
        this._player.autoWalkId = ScheduledPlayerWalkTaskGroup.id;
        this._player.isAutoWalking = true;
    }

    public onAbort(): void {
        this._player.autoWalkId = -1;
        this._player.isAutoWalking = false;
    }

    public onFinish(): void {
        this._player.autoWalkId = -1;
        this._player.isAutoWalking = false;
    }

    public canExecuteNextTask(): boolean {
        if (this._list[this._list.length - 1] !== undefined){
            return (this._list[this._list.length - 1] as ScheduledPlayerWalkTask).player.isAllowedToWalk();
        }else{
            return true;
        }
    }

    public async executeNextTask(): Promise<boolean> {
        if (!this.canExecuteNextTask()){
            return false;
        }

        if (!this._hasStarted){
            this._hasStarted = true;
            this.onStart();
        }

        const nextTask : ScheduledPlayerWalkTask | undefined = this._list[this._list.length - 1] as ScheduledPlayerWalkTask;
        
        if (nextTask === undefined){
            this.onFinish();
            return false;
        }

        if (!nextTask.player.isAllowedToWalk()){
            return false;
        }

        const walkSuccess = await nextTask.execute();
        if (!walkSuccess){
            return false;
        }

        this._list.pop();
        return true;
    }
}