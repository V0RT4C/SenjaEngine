import { NetworkMessage } from "NetworkMessage";
import { TCP } from 'Dependencies';
import { Player } from "Player";
import map from "Map";

import { NETWORK_MESSAGE_SIZES } from "Constants";
import { IPosition } from "Types";
import players from "Game/Player/Players.class.ts";

export class OutgoingNetworkMessage extends NetworkMessage {
    constructor(...args : any){
        super(args[0] ? (args[0] + 2) : NETWORK_MESSAGE_SIZES.BUFFER_MAXSIZE);
        this._position = 2; //Reserve Bytes for uint16 message size
    }

    public static withClient(client : TCP.Client, msgSize?: number){
        const newOutgoingNetworkMessage = new OutgoingNetworkMessage(msgSize && msgSize !== 0 ? msgSize : undefined);
        newOutgoingNetworkMessage.setClient(client);
        return newOutgoingNetworkMessage;
    }

    public writeString(value : string) : void {
        this.writeUint16LE(value.length);

        for (let i=0; i < value.length; i++){
            this.writeUint8(value.charCodeAt(i));
        }
    }

    public writePosition(position : IPosition) : void {
        this.writeUint16LE(position.x);
        this.writeUint16LE(position.y);
        this.writeUint8(position.z);
    }

    public async sendToSpectators(centerPos : IPosition, originPlayer? : Player) : Promise<void> {
        //Union of spectators todo
        const spectators = map.getPlayersInAwareRange(centerPos);

        let networkMsgSize = this._position;
        const msg = this.getTrimmedMsg();

        for (const p of spectators){
            if (originPlayer === p){
                continue;
            }

            await (p as Player).client.write(msg);
        }
    }

    public async sendToPlayersInAwareRange(firstPos : IPosition, secondPos? : IPosition, excludePlayer? : Player){
        const spectatorsFirstPosition : Array<Player> = players.getPlayersInAwareRange(firstPos);
        let spectatorsSecondPosition : Array<Player> = [];

        if (secondPos !== undefined && secondPos !== null){
            spectatorsSecondPosition = players.getPlayersInAwareRange(secondPos);
        }

        const spectators = new Set([...spectatorsFirstPosition, ...spectatorsSecondPosition]);

        let networkMsgSize = this._position;
        const msg = this.getTrimmedMsg();

        for (const p of spectators){
            if (excludePlayer === p){
                continue;
            }

            await (p as Player).client.write(msg);
        }
    }

    public getTrimmedMsg() : Uint8Array {
        let networkMsgSize = this._position;
        let msg = new Uint8Array(this);
        msg = msg.slice(0, networkMsgSize);
        const byteLength = msg.byteLength - 2;
        msg[0] = (byteLength & 0xff);
        msg[1] = (byteLength >>> 8);
        return msg;
    }

    public async send() : Promise<void> {
        let networkMsgSize = this._position - 2;

        if (this._client !== undefined){
            await this._client.write(this.getTrimmedMsg());
        }else{
            throw new Error("Can't send network message. Client is undefined.");
        }
    }
}