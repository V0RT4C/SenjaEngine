import log from 'Logger';
import map from "Map";
import { AddThingToMapOP } from "CoreSendOperations/AddThingToMapOP.class.ts";
import { SendCreatureLightOperation } from "CoreSendOperations/SendCreatureLightOperation.class.ts";
import { SendCreatureSpeakOperation } from "CoreSendOperations/SendCreatureSpeakOperation.class.ts";
import { Creature } from "Creature";
import { MapTile } from "MapTile";
import { Item } from "Item";
import { MESSAGE_TYPE, SPEAK_TYPE } from "Constants";
import { GameOperation } from "../GameOperation.abstract.ts";
import { SendTextMessageOperation } from '../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendTextMessageOperation.class.ts';
import game from '../Game.class.ts';
import { Player } from '../Player/Player.class.ts';

export class CreatureSpeakOp extends GameOperation {
    constructor(private readonly speakingCreature : Creature, speakType? : SPEAK_TYPE, speakMessage? : string){
        super();

        this._speakingCreature = speakingCreature;
        
        if (speakType){
            this._speakType = speakType;
        }

        if (speakMessage){
            this._speakMessage = speakMessage;
        }
    }

    protected _speakingCreature! : Creature;
    protected _speakType! : SPEAK_TYPE;
    protected _speakMessage! : string;


    public _internalOperations(): boolean {
        log.debug('CreatureSpeakOp');
        if (this._speakingCreature === undefined){
            throw new Error('No speaking creature defined');
        }

        if (this._speakType === undefined){
            throw new Error('No speakType defined');
        }

        if (this._speakMessage === undefined){
            throw new Error('No speakMessage defined');
        }

        return true;
    }

    public async _networkOperations(): Promise<boolean> {
        if (this._speakMessage[0] === '!'){
            //Command
            const tile : MapTile | null = map.getTileAt(this._speakingCreature.position);

            if (tile === null){
                return false;
            }

            const command = this._speakMessage.split(' ')[0];

            switch (command){
                case '!item':{
                    const itemId = Number(this._speakMessage.split(' ')[1]);
                    if (isNaN(itemId)){
                        return false;
                    }else{
                        tile.addDownThing(new Item(itemId));
                        const msg = new AddThingToMapOP(itemId, this._speakingCreature.position);
                        await msg.execute();
                    }
                }
                break;
                case '!light': {
                    const level = Number(this._speakMessage.split(' ')[1]);
                    if (isNaN(level)){
                        return false;
                    }else{
                        this._speakingCreature.lightInfo.level = level;
                        const creatureLifeSendOp = new SendCreatureLightOperation(this._speakingCreature);
                        await creatureLifeSendOp.execute();
                    }
                }
                break;
                case '!time': {
                    const timeMsg = new SendTextMessageOperation(`Game world time: ${game.getHumanReadableTime()}`, MESSAGE_TYPE.RED_MESSAGE_CONSOLE, (this._speakingCreature as Player).client);
                    await timeMsg.execute();
                }
                break;
            }
        }else{
            const sendCreatureSpeakOp = new SendCreatureSpeakOperation(
                this._speakMessage,
                this._speakType,
                this._speakingCreature.name,
                this._speakingCreature.position
            );

            await sendCreatureSpeakOp.execute();
        }

        return true;
    }
}