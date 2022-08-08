import { Player } from "~/Game/Player/Player.class.ts";
import { ScheduledTask } from "../ScheduledTask.abstract.ts";
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

    public async executeNextTask(): Promise<boolean> {
        if (!this._hasStarted){
            this._hasStarted = true;
            this.onStart();
        }

        const nextTask : ScheduledTask | undefined = this._list[this._list.length - 1];
        
        if (nextTask === undefined){
            this.onFinish();
            return false;
        }

        const walkSuccess = await nextTask.execute();
        if (!walkSuccess){
            if (!(nextTask as ScheduledPlayerWalkTask).isAllowedToWalk){
                return true;
            }else{
                this.onAbort();
                return false;
            }
        }

        this._list.pop();
        return true;
    }
}