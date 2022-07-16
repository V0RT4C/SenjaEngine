export class Skill {
    private _level = 10;
    private _tries = 0;

    public get level() : number {
        return this._level;
    }

    public get tries() : number {
        return this._tries;
    }

    public set level(value : number){
        this._level = value;
    }

    public set tries(value : number){
        this._tries = value;
    }

    public get percent() : number {
        //return Math.random() * (99 - 0) + 0;
        return 80;
    }
}