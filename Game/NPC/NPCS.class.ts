import { CREATURE_ID_RANGE } from "Constants";
import { NPC } from "Game/NPC/NPC.class.ts";

class NPCS {
    private _startId = CREATURE_ID_RANGE.NPC_START_ID + 1;
    private _endId = CREATURE_ID_RANGE.NPC_END_ID - 1;
    private _currId = this._startId;

    private _list : { [id:number] : NPC } = new Object() as { [id:number] : NPC };

    public createNPC(name : string) : NPC {
        return new NPC(name, this._currId++);
    }
}

const npcs = new NPCS();
export default npcs;