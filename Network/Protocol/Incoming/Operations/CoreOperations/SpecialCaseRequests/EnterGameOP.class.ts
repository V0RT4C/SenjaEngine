import log from 'Logger';
import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { SendFirstGameOperation } from "CoreSendOperations/SendFirstGameOperation.class.ts";
import { SendLoginOrPendingOperation } from "CoreSendOperations/SendLoginOrPendingOperation.class.ts";
import { SendFullMapDescriptionOperation } from "CoreSendOperations/SendFullMapDescriptionOperation.class.ts";
import { SendPlayerSkillsOperation } from "CoreSendOperations/SendPlayerSkillsOperation.class.ts";
import { SendPlayerStatsOperation } from "CoreSendOperations/SendPlayerStatsOperation.class.ts";
import { SendWorldLightOperation } from "CoreSendOperations/SendWorldLightOperation.class.ts";
import { SendFullInventoryOperation } from "CoreSendOperations/SendFullInventoryOperation.class.ts";
import { SendTextMessageOperation } from "CoreSendOperations/SendTextMessageOperation.class.ts";
import { SendMagicEffectOperation } from "CoreSendOperations/SendMagicEffectOperation.class.ts";
import { Player } from "Player";

import players from "Players";
import map from "Map";
import game from "Game/Game.class.ts";
import db from "DB";

import { CLIENT_VERSION_MAX, CLIENT_VERSION_MIN, WELCOME_MESSAGE } from "Config";
import { MESSAGE_TYPE, PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { TCP } from 'Dependencies';
import { GameOperation } from "Game/GameOperation.abstract.ts";
import { IncomingNetworkMessage } from "Network/Lib/IncomingNetworkMessage.class.ts";
import { AddCreatureToMapOP } from "CoreSendOperations/AddCreatureToMapOP.class.ts";
import events from 'Game/Events/EventEmitter.ts';
import { EVENT } from '../../../../../../Constants/events.const.ts';

@StaticImplements<StaticOperationCode>()
export class EnterGameOP extends GameOperation {
    constructor(msg : IncomingNetworkMessage){
        super();
        this._msg = msg;
    }

    public static operationCode = PROTOCOL_RECEIVE.ENTER_GAME;
    private _player : Player | undefined; // Only defined if enter game is successful
    private _os! : number;
    private _version! : number;
    private _rsaZero! : number;
    private _accountNumber! : number;
    private _name! : string;
    private _password! : string;
    private _msg : IncomingNetworkMessage;

    public parseMessage(){
        this._os = this._msg.readUint16LE();
        this._version = this._msg.readUint16LE();
        this._rsaZero = this._msg.readUint8();
        this._accountNumber = this._msg.readUint32LE();
        this._name = this._msg.readString();
        this._password = this._msg.readString();
        this._msg.seek(this._msg.byteLength);
    }

    protected _internalOperations(): boolean {
        log.debug('EnterGameOP');
        if (this._version < CLIENT_VERSION_MIN || this._version > CLIENT_VERSION_MAX){
            return false;
        }else{
            const account = db.getAccountById(this._accountNumber);

            if (account === null){
                return false;
            }

            let player : Player | null;
            if (account.password === this._password){
                if (players.playerIsOnline(this._name)){
                    player = players.getPlayerByName(this._name) as Player;
                    players.removePlayer(player.id);
                    player.id = this._msg.client?.conn?.rid as number;
                    player.client = this._msg.client as TCP.Client;
                    players.addPlayer(player);
                }else{
                    player = players.loadPlayerFromDatabase(this._name, this._msg.client as TCP.Client);

                    if (player === null){
                        return false;
                    }

                    players.addPlayer(player);
                    //Add to tile
                    let tile = map.getTileAt(player.position);
                    if (tile){
                        (tile as any).addCreature(player);
                    }
                }

                this._player = player;
                return true;
            }else{
                return false;
            }
        }
    }

    protected async _networkOperations(): Promise<boolean> {
        if (this._player !== undefined){
            //Send only to player
            const msg = OutgoingNetworkMessage.withClient(
                this._player.client,
                SendFirstGameOperation.messageSize +
                SendLoginOrPendingOperation.messageSize +
                SendFullMapDescriptionOperation.messageSize +
                SendPlayerSkillsOperation.messageSize +
                SendPlayerStatsOperation.messageSize +
                SendWorldLightOperation.messageSize +
                SendFullInventoryOperation.messageSize +
                SendTextMessageOperation.messageSize
            );
            SendFirstGameOperation.writeToNetworkMessage(msg);
            SendLoginOrPendingOperation.writeToNetworkMessage(this._player.extId, msg);
            SendPlayerSkillsOperation.writeToNetworkMessage(this._player, msg);
            SendPlayerStatsOperation.writeToNetworkMessage(this._player, msg);
            SendWorldLightOperation.writeToNetworkMessage(game.worldLight.level, game.worldLight.color, msg);
            SendFullInventoryOperation.writeToNetworkMessage(this._player, msg);
            SendTextMessageOperation.writeToNetworkMessage(`${WELCOME_MESSAGE}${`\nYour last visit ${this._player.previousVisit !== 0 ? `was on: ${(new Date(this._player.previousVisit).toDateString())}, ${(new Date(this._player.previousVisit).toTimeString())}` : 'was: never'}`}`, MESSAGE_TYPE.RED_MESSAGE_CONSOLE, msg);
            SendFullMapDescriptionOperation.writeToNetworkMessage(this._player.position, this._player, msg);
            await msg.send();

            //Send to spectators & player
            const msg2 = new OutgoingNetworkMessage(SendMagicEffectOperation.messageSize);
            SendMagicEffectOperation.writeToNetworkMessage(11, this._player.position, msg2);
            await msg2.sendToPlayersInAwareRange(this._player.position);

            //Send only to spectators
            const msg3 = new OutgoingNetworkMessage(AddCreatureToMapOP.messageSize);
            AddCreatureToMapOP.writeToNetworkMessage(this._player, this._player, msg3);
            await msg3.sendToPlayersInAwareRange(this._player.position, undefined, this._player);
            
            this._player.onLogin();
            events.emit(EVENT.PLAYER_LOGIN, { name: this._player.name });
            return true;
        }else{
            return false;
        }
    }

    public async execute(): Promise<void> {
        const internalOperationsIsAsync = this._internalOperations.constructor.name === 'AsyncFunction';

        try {
            if (internalOperationsIsAsync){
                if (await this._internalOperations()){
                    await this._networkOperations();
                }
            }else{
                if (this._internalOperations()){
                    await this._networkOperations();
                }
            }
        }catch(err){
            console.log(err);
        }
    }
}