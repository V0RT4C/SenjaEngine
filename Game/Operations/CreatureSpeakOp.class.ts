import log from 'Logger';
import map from "Map";
import game from '../Game.class.ts';
import { GameOperation } from "../GameOperation.abstract.ts";
import { AddThingToMapOP } from "CoreSendOperations/AddThingToMapOP.class.ts";
import { SendCreatureLightOperation } from "CoreSendOperations/SendCreatureLightOperation.class.ts";
import { SendCreatureSpeakOperation } from "CoreSendOperations/SendCreatureSpeakOperation.class.ts";
import { SendTextMessageOperation } from 'CoreSendOperations/SendTextMessageOperation.class.ts';
import { Creature } from "Creature";
import { MapTile } from "MapTile";
import { Item } from "Item";
import { MESSAGE_TYPE, RETURN_MESSAGE, SPEAK_TYPE } from "Constants";
import { Player } from '../Player/Player.class.ts';
import { SendCancelMessageOperation } from '../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendCancelMessageOperation.class.ts';

export class CreatureSpeakOp extends GameOperation {
    constructor(
        protected readonly _speakingCreature : Creature, 
        protected readonly _speakType : SPEAK_TYPE, 
        protected readonly _speakMessage : string,
        protected readonly _player? : Player
        ){
        super();
    }

    private _cancelMessage : string | undefined;
    private _commandFunction : Function | undefined;

    public _internalOperations(): void {
        log.debug('CreatureSpeakOp');
        if (this._speakMessage[0] === '!'){
            //Command
            const command = this._speakMessage.split(' ')[0];

            switch (command){
                case '!item':{
                    const itemId = Number(this._speakMessage.split(' ')[1]);
                    if (isNaN(itemId)){
                        this._cancelMessage = 'Invalid item id';
                        return;
                    }else{
                        this._commandFunction = async () => {
                            const tile : MapTile | null = map.getTileAt(this._speakingCreature.position);
    
                            if (tile === null){
                                this._cancelMessage = RETURN_MESSAGE.UNKNOWN_ERROR;
                                return;
                            }
    
                            tile.addDownThing(new Item(itemId));
                            const msg = new AddThingToMapOP(itemId, this._speakingCreature.position);
                            await msg.execute();
                        }
                    }
                }
                break;
                case '!light': {
                    const level = Number(this._speakMessage.split(' ')[1]);
                    if (isNaN(level)){
                        this._cancelMessage = 'Invalid light level';
                        return;
                    }else{
                        this._commandFunction = async () => {
                            this._speakingCreature.lightInfo.level = level;
                            const creatureLifeSendOp = new SendCreatureLightOperation(this._speakingCreature);
                            await creatureLifeSendOp.execute();
                        }
                    }
                }
                break;
                case '!time': {
                    this._commandFunction = async () => {
                        const timeMsg = new SendTextMessageOperation(`Game world time: ${game.getHumanReadableTime()}`, MESSAGE_TYPE.RED_MESSAGE_CONSOLE, (this._speakingCreature as Player).client);
                        await timeMsg.execute();
                    }
                }
                break;
            }
        }
    }

    public async _networkOperations(): Promise<void> {
        if (this._cancelMessage === undefined){
            if (this._commandFunction !== undefined){
                await this._commandFunction();
            }else{
                const sendCreatureSpeakOp = new SendCreatureSpeakOperation(
                    this._speakMessage,
                    this._speakType,
                    this._speakingCreature.name,
                    this._speakingCreature.position
                );
    
                await sendCreatureSpeakOp.execute();
            }
        }else{
            if (this._player){
                const cancelOp = new SendCancelMessageOperation(this._cancelMessage, this._player.client);
                await cancelOp.execute();
            }
        }
    }
}