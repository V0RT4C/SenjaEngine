import { EVENT } from "../../Constants/events.const.ts";

class EventEmitter {
    private _events : { [key in EVENT]: ((p : any) => void)[] } = {} as { [key in EVENT]: ((p : any) => void)[] };

    public on<T>(event : EVENT, cb: (param: T) => void) : any {
        this._events[event] = this._events[event] ? this._events[event] : [];
        this._events[event].push(cb);
        return () => this._unsubscribeListener(event, cb);
    }

    public emit<T>(event : EVENT, data : T){
        if (this._events[event] && this._events[event].length > 0){
            for (const e of this._events[event]){
                e(data);
            }
        }
    }

    private _unsubscribeListener(event : EVENT, listener : (p : any) => void) : void {
        let idx = -1;

        for (let i=0; i < this._events[event].length; i++){
            const currListener = this._events[event][i];
            if (currListener === listener){
                idx = i;
                break;
            }
        }

        if (idx !== -1){
            this._events[event].splice(idx, 1);
        }
    }
}

const events = new EventEmitter();
export default events;