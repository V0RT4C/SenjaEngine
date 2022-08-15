import log from 'Logger';
import map from "Map";
import { SendTextMessageOperation } from "CoreSendOperations/SendTextMessageOperation.class.ts";
import { Thing } from "Thing";
import { Player } from '../Player/Player.class.ts';
import { GameOperation } from '../GameOperation.abstract.ts';
import { MESSAGE_TYPE } from "Constants";
import { IPosition } from "Types";
import { Item } from '../Item.class.ts';
import { Creature } from '../Creature.class.ts';

export class LookAtOp extends GameOperation {
    constructor(
        protected readonly _player : Player, 
        protected readonly _position : IPosition, 
        protected readonly _thingId : number, 
        protected readonly _stackPosition : number,
        thing? : Thing,
        isCloseItem? : boolean
        ){ 
        super(); 

        if (thing){
            this._thing = thing;
            this._isCloseItem = isCloseItem ? isCloseItem : false;
        }
    }

    protected _thing! : Thing | null;
    protected _isCloseItem = false;


    protected _internalOperations(): void {
        log.debug(`LookAtOp`);
        log.debug(`[LookAtOp] - { x: ${this._position.x}, y: ${this._position.y}, z: ${this._position.z}, thingId: ${this._thingId}, stackPosition: ${this._stackPosition}}`);

        if (this._thing !== null && this._thing !== undefined){
            return;
        }
        else if (this._position.x === 65535){
            this._isCloseItem = true;

            if (0x40 & this._position.y){
                //Is container
                const containerId = this._position.y & 0x0F;
                const slotId = this._position.z;
                const container = this._player.getContainerById(containerId);

                if (container !== null){
                    this._thing = container.getItemBySlotId(slotId);
                }else{
                    this._thing = null;
                }
            }else{
                //Is inventory
                const slotId = this._position.y;
                this._thing = this._player.inventory.getItemReferenceFromInventory(slotId);
            }
        }
        else{
            const tile = map.getTileAt(this._position);
    
            if (tile !== null){
                this._thing = tile.getRealTopThing();
            }else{
                this._thing = null;
            }
        }

        return;
    }

    protected async _networkOperations(): Promise<void> {
        let message : string;

        if (this._thing !== null && this._isCloseItem){
            message = this._getItemMessage(this._thing as Item, true);
        }
        else if(this._thing !== null && (Math.abs(this._position.x - this._player.position.x) <= 1 && Math.abs(this._position.y - this._player.position.y) <= 1 && this._position.z === this._player.position.z)){
            if (this._thing === this._player){
                message = this._getSelfMessage();
            }
            else if (this._thing.isCreature()){
                message = this._getCreatureMessage(this._thing as Creature);
            }
            else if (this._thing.isItem()){
                message = this._getItemMessage(this._thing as Item, true);
            }
            else {
                message = `You see a thing with id: ${this._thingId}.\nPosition { x: ${this._position.x}, y: ${this._position.y}, z: ${this._position.z} }`;
            }
        }
        else if(this._thing !== null){
            //Look at a distance
            if (this._thing.isItem()){
                message = this._getItemMessage(this._thing as Item, false);
            }
            else if (this._thing.isCreature()){
                message = this._getCreatureMessage(this._thing as Creature);
            }
            else {
                message = `You see a thing with id: ${this._thingId}.\nPosition { x: ${this._position.x}, y: ${this._position.y}, z: ${this._position.z} }`;
            }
        }
        else {
            message = `You see something unknown.`;
        }

        const textMessage = new SendTextMessageOperation(message, MESSAGE_TYPE.GREEN_MESSAGE_SCREEN_CENTER_AND_CONSOLE, this._player.client);
        await textMessage.execute();
    }

    protected _getSelfMessage(){
        return `You see yourself. You are a player.`;
    }

    protected _getCreatureMessage(creature : Creature){
        if (creature.isPlayer()){
            return `You see another player.`;
        }
        else if (creature.isNPC()){
            return `You see ${creature.name}.`;
        }
        else {
            return `You see a ${creature.name}.`;
        }
    }

    protected _getItemMessage(item : Item, close = false){
        if (close){
            return `You see ${item.article ? item.article + ' ' : ''}${item.name}${item.isWeapon() ? ` Atk:(${item.attack} Def:${item.defence})` : ''}.${(this._thing as Item).weight ? `\nIt weighs ${item.weight} o.z.` : ''}${item.description ? `\n${item.description}` : ''}${item.text ? `\nYou read: ${item.text}` : ''}`;
        }else{
            return `You see ${item.article ? item.article + ' ' : ''}${item.name}.${item.text ? `\nYou read: ${item.text}` : ''}`
        }
    }

}