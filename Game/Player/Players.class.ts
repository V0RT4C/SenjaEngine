import { TCP } from 'Dependencies';
import { Player } from 'Player';
import { CLIENT_VIEWPORT, CREATURE_ID_RANGE, VIEWPORT } from 'Constants';
import { IDBPlayer, IPosition } from "Types";
import db from "DB";

class Players {
    private _startId = CREATURE_ID_RANGE.PLAYER_START_ID + 1;
    private _endId = CREATURE_ID_RANGE.PLAYER_END_ID - 1;
    private _currId = this._startId;
    private _list : { [id:number] : Player } = new Object() as { [id:number] : Player };

    public get list() : { [id:number] : Player } {
        return this._list;
    }

    public get count() : number {
        return Object.keys(this._list).length;
    }

    public playerIsOnline(name : string) : boolean {
        return this.getPlayerByName(name) !== null;
    }

    public getPlayerById(id : number) : Player | null {
        if (this._list[id]){
            return this._list[id];
        }else{
            return null;
        }
    }

    public getPlayerByName(name : string) : Player | null {
        let player : Player | undefined;

        for (const id in this._list){
            if (this._list[id].name === name){
                player = this._list[id];
                break;
            }
        }

        return player ? player : null;
    }

    public addPlayer(player : Player) : void {
        this._list[player.id] = this._list[player.id] ? this._list[player.id] : player;
    }

    public removePlayer(id : number) : boolean {
        delete this._list[id];
        return true;
    }

    public createPlayer(name : string, client : TCP.Client) : Player {
        return new Player(name, ++this._currId, client);
    }

    public loadPlayerFromDatabase(name : string, client : TCP.Client) : Player | null {
       const rawPlayer : IDBPlayer | null = db.getPlayerByName(name);

       if (rawPlayer === null){
           return null;
       }

       const player = new Player(rawPlayer.name, this._currId++, client);
       player.outfit.lookType = rawPlayer.outfit.lookType;
       player.outfit.lookHead = rawPlayer.outfit.lookHead;
       player.outfit.lookBody = rawPlayer.outfit.lookBody;
       player.outfit.lookLegs = rawPlayer.outfit.lookLegs;
       player.outfit.lookFeet = rawPlayer.outfit.lookFeet;
       player.position.x = rawPlayer.position.x;
       player.position.y = rawPlayer.position.y;
       player.position.z = rawPlayer.position.z;
       player.sex = rawPlayer.sex;
       player.health = rawPlayer.health;
       player.maxHealth = rawPlayer.maxHealth;
       player.mana = rawPlayer.mana;
       player.maxMana = rawPlayer.maxMana;
       player.level = rawPlayer.level;
       player.experience = rawPlayer.experience;
       return player;
    }

    public getPlayersInYellAwareRange(centerPosition : IPosition) : Array<Player> {
        return this.getPlayersInCustomAwareRange(centerPosition, { x: 18, y: 14, z: 0 });
    }

    public getPlayersInAwareRange(pos1 : IPosition, pos2? : IPosition) : Array<Player> {
        const startX = pos1.x - VIEWPORT.MAX_VIEWPORT_X;
        const endX = pos1.x + VIEWPORT.MAX_VIEWPORT_X;
        const startY = pos1.y - VIEWPORT.MAX_VIEWPORT_Y;
        const endY = pos1.y + VIEWPORT.MAX_VIEWPORT_Y;

        let playersInAwareRange : Array<Player> = this.getPlayersInCustomAwareRange(pos1, { x: VIEWPORT.MAX_VIEWPORT_X, y: VIEWPORT.MAX_VIEWPORT_Y, z: 0 });

        if (pos2 !== undefined){
            playersInAwareRange = [...playersInAwareRange, ...this.getPlayersInCustomAwareRange(pos2, { x: VIEWPORT.MAX_VIEWPORT_X, y: VIEWPORT.MAX_VIEWPORT_Y, z: 0 })];
        }

        return Array.from(new Set(playersInAwareRange));
    }

    public getPlayersInCustomAwareRange(centerPosition : IPosition, range : IPosition) : Array<Player> {
        const startX = centerPosition.x - range.x;
        const endX = centerPosition.x + range.x;
        const startY = centerPosition.y - range.y;
        const endY = centerPosition.y + range.y;

        let playersInAwareRange : Array<Player> = [];

        for (const p in this._list){
            const player = this._list[p];
            if (player){
                if (
                    player.position.x >= startX &&
                    player.position.x <= endX &&
                    player.position.y >= startY &&
                    player.position.y <= endY
                ){
                    playersInAwareRange.push(player);
                    continue;
                }
            }
        }

        return Array.from(new Set(playersInAwareRange));
    }
}

const players = new Players();
export default players;