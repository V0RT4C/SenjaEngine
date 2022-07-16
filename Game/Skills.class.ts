import { Skill } from "Game/Skill.class.ts";
import { isLessOrEqual, isNumber, isWithinByteBounds } from "Game/Lib/number.lib.ts";
import { SKILL } from "Constants/Combat.const.ts";

export class Skills {
    private _skills : { [key in SKILL]: Skill }  = {
        [SKILL.FIST]: new Skill(),
        [SKILL.CLUB]: new Skill(),
        [SKILL.SWORD]: new Skill(),
        [SKILL.AXE]: new Skill(),
        [SKILL.DISTANCE]: new Skill(),
        [SKILL.SHIELDING]: new Skill(),
        [SKILL.FISHING]: new Skill()
    };

    public setSkill(level : number, skill : SKILL) : boolean {
        if (
            !isNumber(level) ||
            !isNumber(skill) ||
            !isWithinByteBounds(level) ||
            !isLessOrEqual(skill, SKILL.FISHING)
        ){ return false; }

        this._skills[skill].level = level;
        return true;
    }

    public get fist() : Skill {
        return this._skills[SKILL.FIST];
    }

    public get club() : Skill {
        return this._skills[SKILL.CLUB];
    }

    public get sword() : Skill {
        return this._skills[SKILL.SWORD];
    }

    public get axe() : Skill {
        return this._skills[SKILL.AXE];
    }

    public get distance() : Skill {
        return this._skills[SKILL.DISTANCE];
    }

    public get shielding() : Skill {
        return this._skills[SKILL.SHIELDING];
    }

    public get fishing() : Skill {
        return this._skills[SKILL.FISHING];
    }

    public setTries(tries : number, skill : SKILL) : boolean {
        if (!isNumber(tries) || !isNumber(skill) || !isLessOrEqual(skill, SKILL.FISHING)){
            return false;
        }

        this._skills[skill].tries = tries;
        return true;
    }

    public incramentSkillTries(skill : SKILL) : boolean {
        if (!isNumber(skill) || !isLessOrEqual(skill, SKILL.FISHING)){
            return false;
        }

        this._skills[skill].tries++;
        return true;
    }

    public setFistLevel(level : number) : boolean {
        return this.setSkill(level, SKILL.FIST);
    }

    public setFistTries(tries : number) : boolean {
        return this.setTries(tries, SKILL.FIST);
    }

    public incramentFistTries() : boolean {
        return this.incramentSkillTries(SKILL.FIST);
    }

    public setClubLevel(level : number) : boolean {
        return this.setSkill(level, SKILL.CLUB);
    }

    public setClubTries(tries : number) : boolean {
        return this.setTries(tries, SKILL.CLUB);
    }

    public incramentClubTries() : boolean {
        return this.incramentSkillTries(SKILL.CLUB);
    }

    public setSwordLevel(level : number) : boolean {
        return this.setSkill(level, SKILL.SWORD);
    }

    public setSwordTries(tries : number) : boolean {
        return this.setTries(tries, SKILL.SWORD);
    }

    public incramentSwordTries() : boolean {
        return this.incramentSkillTries(SKILL.SWORD);
    }

    public setAxeLevel(level : number) : boolean {
        return this.setSkill(level, SKILL.AXE);
    }

    public setAxeTries(tries : number) : boolean {
        return this.setTries(tries, SKILL.AXE);
    }

    public incramentAxeTries() : boolean {
        return this.incramentSkillTries(SKILL.AXE);
    }

    public setDistanceLevel(level : number) : boolean {
        return this.setSkill(level, SKILL.DISTANCE);
    }

    public setDistanceTries(tries : number) : boolean {
        return this.setTries(tries, SKILL.DISTANCE);
    }

    public incramentDistanceTries() : boolean {
        return this.incramentSkillTries(SKILL.DISTANCE);
    }

    public setShieldingLevel(level : number) : boolean {
        return this.setSkill(level, SKILL.SHIELDING);
    }

    public setShieldingTries(tries : number) : boolean {
        return this.setTries(tries, SKILL.SHIELDING);
    }

    public incramentShieldingTries() : boolean {
        return this.incramentSkillTries(SKILL.SHIELDING);
    }

    public setFishingLevel(level : number) : boolean {
        return this.setSkill(level, SKILL.FISHING);
    }

    public setFishingTries(tries : number) : boolean {
        return this.setTries(tries, SKILL.FISHING);
    }

    public incramentFishingTries() : boolean {
        return this.incramentSkillTries(SKILL.FISHING);
    }
}