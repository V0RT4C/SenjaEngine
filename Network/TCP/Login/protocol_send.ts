import { OutgoingNetworkMessage } from "Network/Lib/OutgoingNetworkMessage.class.ts";
import { ip2int } from 'Network/Lib/ip.helpers.ts';

import { TCP } from 'Dependencies';
import { PROTOCOL_LOGIN_SEND } from 'Constants';
import { IDBAccountExtended, ILoginCharacter } from "Types";



export const sendError = async (message : string, client : TCP.Client) : Promise<void> => {
    const msg : OutgoingNetworkMessage = OutgoingNetworkMessage.withClient(client);
    msg.writeUint8(PROTOCOL_LOGIN_SEND.ERROR);
    msg.writeString(message);
    await msg.send();
}

export const sendCharacterList = async (account : IDBAccountExtended, client : TCP.Client) : Promise<void> => {
    const msg : OutgoingNetworkMessage = OutgoingNetworkMessage.withClient(client);
    msg.writeUint8(PROTOCOL_LOGIN_SEND.CHARACTER_LIST);
    msg.writeUint8(account.characters.length);

    for (const character of account.characters){
        console.log(character);
        msg.writeString(character.name);
        msg.writeString(character.world.name);
        msg.writeInt32LE(ip2int(character.world.ip));
        msg.writeUint16LE(character.world.port);
    }

    msg.writeUint32LE(999);
    await msg.send();
}


export const sendMessageOfTheDay = async (message : string, client : TCP.Client) : Promise<void> => {
    const msg : OutgoingNetworkMessage = OutgoingNetworkMessage.withClient(client);
    msg.writeUint8(PROTOCOL_LOGIN_SEND.MOTD);
    msg.writeString(message);
    await msg.send();
}