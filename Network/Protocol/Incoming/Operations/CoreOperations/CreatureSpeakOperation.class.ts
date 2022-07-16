import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import { SendAddThingToMapOperation } from "CoreSendOperations/SendAddThingToMapOperation.class.ts";
import { SendCreatureLightOperation } from "CoreSendOperations/SendCreatureLightOperation.class.ts";
import { SendCreatureSpeakOperation } from "CoreSendOperations/SendCreatureSpeakOperation.class.ts";
import { Creature } from "Creature";
import { MapTile } from "MapTile";
import { Item } from "Item";

import players from "Players";
import map from "Map";

import { StaticImplements } from "Decorators";
import { PROTOCOL_RECEIVE, SPEAK_TYPE } from "Constants";
import { StaticOperationCode } from "Types";

@StaticImplements<StaticOperationCode>()
export class CreatureSpeakOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.SPEAK;

    private _speakingCreature! : Creature;
    private _speakType! : SPEAK_TYPE;
    private _speakMessage! : string;

    public parseMessage() : void {
        this._speakType = this._msg.readUint8();
        this._speakMessage = this._msg.readString();
    }

    public _internalOperations(): boolean {
        const speakingCreature = players.getPlayerById(this._msg.client?.conn?.rid as number);

        if (speakingCreature === null){
            return false;
        }

        this._speakingCreature = speakingCreature;
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
                        const msg = new SendAddThingToMapOperation(itemId, this._speakingCreature.position);
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