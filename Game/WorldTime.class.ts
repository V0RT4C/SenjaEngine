import log from 'Logger';
import { SendWorldLightOperation } from 'CoreSendOperations/SendWorldLightOperation.class.ts';
import { GAME_TICKS_PER_MINUTE, MAX_LIGHT_LEVEL, MIN_LIGHT_LEVEL, ONE_DAY_IN_MINUTES } from "Constants/Game.const.ts";
import { LIGHT_LEVEL_DAY, LIGHT_LEVEL_NIGHT, SUNRISE_START, SUNRISE_STOP, SUNSET_END, SUNSET_START, WORLD_DYNAMIC_LIGHT_ENABLED, WORLD_TIME_AT_STARTUP, WORLD_TIME_SPEED_INCREASE_X } from '~/config.ts';
import { ILightInfo } from 'Types';
import { Player } from './Player/Player.class.ts';

export class WorldTime {

    private _time = WORLD_TIME_AT_STARTUP;
    private _worldLight : ILightInfo = { color: 0xD7, level: MIN_LIGHT_LEVEL };

    public get worldLight() : ILightInfo {
        return this._worldLight;
    }

    public processWorldTime(gameTicks : number){
        if (gameTicks % (GAME_TICKS_PER_MINUTE / WORLD_TIME_SPEED_INCREASE_X) === 0){
            log.debug(`Updating world time`);
            this._updateTime();

            if (WORLD_DYNAMIC_LIGHT_ENABLED){
                this._updateWorldLight();
                console.log(this._worldLight.level);
            }
        }
    }

    public async updatePlayer(player : Player, gameTicks : number){
        if (gameTicks % (GAME_TICKS_PER_MINUTE / 10) === 0){
            const worldLightOp = new SendWorldLightOperation(player.client);
            await worldLightOp.execute();
        }
    }

    public minutesBetweenSunriseStartAndEnd(){
        if (SUNRISE_START > SUNRISE_STOP){
            return SUNRISE_START - SUNRISE_STOP;
        }else{
            return SUNRISE_STOP - SUNRISE_START;
        }
    }

    public minutesBetweenSunsetStartAndEnd(){
        if (SUNSET_START > SUNSET_END){
            return SUNSET_START - SUNSET_END;
        }else{
            return SUNSET_END - SUNSET_START;
        }
    }

    public lightLevelChangePerMinuteSunrise(){
        const value = (LIGHT_LEVEL_DAY - LIGHT_LEVEL_NIGHT) / this.minutesBetweenSunriseStartAndEnd();
        return Math.ceil(value);
    }

    public lightLevelChangePerMinuteSunset(){
        const value = (LIGHT_LEVEL_DAY - LIGHT_LEVEL_NIGHT) / this.minutesBetweenSunsetStartAndEnd();
        return Math.ceil(value);
    }

    public getHumanReadableTime(){
        let hour : number | string = Math.floor(this._time / 60);
        let minutes : number | string = this._time % 60;

        if (hour < 10){
            hour = `0${hour}`;
        }

        if (minutes < 10){
            minutes = `0${minutes}`;
        }

        return `${hour}:${minutes}`;
    }

    private _updateWorldLight(){
        if (this._time >= SUNRISE_START && this._time <= SUNRISE_STOP){
            if (this._worldLight.level < Math.min(LIGHT_LEVEL_DAY, MAX_LIGHT_LEVEL)){
                const newLightLevel = this._worldLight.level + this.lightLevelChangePerMinuteSunrise();
                this._worldLight.level = newLightLevel <= MAX_LIGHT_LEVEL && newLightLevel >= MIN_LIGHT_LEVEL ? newLightLevel : MAX_LIGHT_LEVEL;
            }
        }
        else if (this._time >= SUNSET_START && this._time <= SUNSET_END){
            if (this._worldLight.level > Math.max(LIGHT_LEVEL_NIGHT, MIN_LIGHT_LEVEL)){
                const newLightLevel = this._worldLight.level - this.lightLevelChangePerMinuteSunset();
                this._worldLight.level = newLightLevel <= MAX_LIGHT_LEVEL && newLightLevel >= MIN_LIGHT_LEVEL ? newLightLevel : MIN_LIGHT_LEVEL;
            }
        }
    }

    private _updateTime(){
        if (this._time >= ONE_DAY_IN_MINUTES){
            this._time = 0;
        }else{
            this._time++;
        }
    }
}

const worldTime = new WorldTime();
export default worldTime;