import { AtomicScheduledEventList } from "../AtomicScheduledEventList.class.ts";

export class ScheduledAtomicWalk extends AtomicScheduledEventList {
    public executeNextEvent(): boolean {
        if (this._list.length === 0){
            return false;
        }

        return true;
    }
}