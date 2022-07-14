import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { IncomingGameOperation } from "ProtocolIncoming/Operations/IncomingGameOperation.abstract.ts";
import {
    SendFullInventoryOperation
} from "OutgoingSendOperations/CoreSendOperations/SendFullInventoryOperation.class.ts";
import {
    SendFullMapDescriptionOperation
} from "OutgoingSendOperations/CoreSendOperations/SendFullMapDescriptionOperation.class.ts";
import { SendWorldLightOperation } from "OutgoingSendOperations/CoreSendOperations/SendWorldLightOperation.class.ts";
import { SendPlayerStatsOperation } from "OutgoingSendOperations/CoreSendOperations/SendPlayerStatsOperation.class.ts";
import { SendMagicEffectOperation } from "OutgoingSendOperations/CoreSendOperations/SendMagicEffectOperation.class.ts";
import { SendFirstGameOperation } from "OutgoingSendOperations/CoreSendOperations/SendFirstGameOperation.class.ts";
import {
    SendLoginOrPendingOperation
} from "OutgoingSendOperations/CoreSendOperations/SendLoginOrPendingOperation.class.ts";
import {
    SendAddCreatureToMapOperation
} from "OutgoingSendOperations/CoreSendOperations/SendAddCreatureToMapOperation.class.ts";
import { Player } from "Player";

import players from "Players";
import map from "Map";
import game from "Game/Game.class.ts";
import db from "DB";

import { MESSAGE_TYPE, PROTOCOL_RECEIVE } from "Constants";
import { StaticImplements } from "Decorators";
import { StaticOperationCode } from "Types";
import { TCP } from 'Dependencies';
import { SendTextMessageOperation } from "OutgoingSendOperations/CoreSendOperations/SendTextMessageOperation.class.ts";
import { CLIENT_VERSION_MAX, CLIENT_VERSION_MIN } from "Config";

@StaticImplements<StaticOperationCode>()
export class EnterGameOperation extends IncomingGameOperation {
    public static operationCode = PROTOCOL_RECEIVE.ENTER_GAME;
    private _player : Player | undefined; // Only defined if enter game is successful
    private _os! : number;
    private _version! : number;
    private _rsaZero! : number;
    private _accountNumber! : number;
    private _name! : string;
    private _password! : string;

    public parseMessage(){
        this._os = this._msg.readUint16LE();
        this._version = this._msg.readUint16LE();
        this._rsaZero = this._msg.readUint8();
        this._accountNumber = this._msg.readUint32LE();
        this._name = this._msg.readString();
        this._password = this._msg.readString();
        this._msg.seek(this._msg.byteLength);
    }

    protected async _internalOperations(): Promise<boolean> {
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
                    player.id = this._msg.client?.conn?.rid as number;
                    player.client = this._msg.client as TCP.Client;
                }else{
                    player = players.loadPlayerFromDatabase(this._name, this._msg.client as TCP.Client);

                    if (player === null){
                        return false;
                    }
                    //player = players.createPlayer(this._name, this._msg.client as TCP.Client);
                    //player.setPosition(25, 25, 7);
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
            const msg = OutgoingNetworkMessage.withClient(this._player.client, SendFirstGameOperation.messageSize + SendLoginOrPendingOperation.messageSize + SendFullMapDescriptionOperation.messageSize);
            SendFirstGameOperation.writeToNetworkMessage(msg);
            SendLoginOrPendingOperation.writeToNetworkMessage(this._player.extId, msg);
            SendFullMapDescriptionOperation.writeToNetworkMessage(this._player.position, msg);
            await msg.send();

            const msg2 = OutgoingNetworkMessage.withClient(this._player.client, SendPlayerStatsOperation.messageSize + SendWorldLightOperation.messageSize + SendFullInventoryOperation.messageSize + SendTextMessageOperation.messageSize);
            SendPlayerStatsOperation.writeToNetworkMessage(this._player, msg2);
            SendWorldLightOperation.writeToNetworkMessage(game.worldLight.level, game.worldLight.color, msg2);
            SendFullInventoryOperation.writeToNetworkMessage(this._player, msg2);
            SendTextMessageOperation.writeToNetworkMessage('Welcome to Senja Engine V.0.0.1', MESSAGE_TYPE.RED_MESSAGE_CONSOLE, msg2);
            await msg2.send();

            //Send to spectators & player
            const msg3 = new OutgoingNetworkMessage(SendMagicEffectOperation.messageSize);
            SendMagicEffectOperation.writeToNetworkMessage(11, this._player.position, msg3);
            await msg3.sendToPlayersInAwareRange(this._player.position);

            //Send only to spectators
            const msg4 = new OutgoingNetworkMessage(SendAddCreatureToMapOperation.messageSize);
            SendAddCreatureToMapOperation.writeToNetworkMessage(this._player, msg4);
            await msg4.sendToPlayersInAwareRange(this._player.position, undefined, this._player);

            return true;
        }else{
            return false;
        }
    }
}