import { ScheduledEvent } from "./ScheduledEvent.abstract.ts";

export abstract class AtomicScheduledEventList {
    protected _list : ScheduledEvent[] = [];

    public setScheduledEvents(events : ScheduledEvent[]){
        this._list = events;
    }

    public addScheduledEvent(event : ScheduledEvent){
        this._list.unshift(event);
    }

    public pop() : ScheduledEvent | undefined {
        return this._list.pop();
    }

    public abstract executeNextEvent() : boolean;
}