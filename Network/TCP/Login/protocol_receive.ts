import { sendError, sendCharacterList, sendMessageOfTheDay } from './protocol_send.ts';
import { TCP } from 'Dependencies';
import { NetworkMessage } from 'NetworkMessage';
import { PROTOCOL_LOGIN_RECEIVE } from 'Constants';
import db from 'DB';
import { CLIENT_VERSION_MAX, CLIENT_VERSION_MIN } from "Config";

export const parseNetworkMessage = (client: TCP.Client, data : Uint8Array) => {
    const buffer = new NetworkMessage(data);
    const _length : number = buffer.readUint16LE();
    const op : number = buffer.readUint8();

    switch(op){
        case PROTOCOL_LOGIN_RECEIVE.LOGIN:
            parseLogin(client, buffer);
        break;
        default:
            console.log(`Dont have that OP code: ${op}`);
    }
}

export const parseLogin = async (client : TCP.Client, buffer : NetworkMessage) : Promise<void> => {
    const _os : number = buffer.readUint16LE();
    const version : number = buffer.readUint16LE();
    const _datSignature : number = buffer.readUint32LE();
    const _sprSignature : number = buffer.readUint32LE();
    const _picSignature : number = buffer.readUint32LE();
    const accountNumber : number = buffer.readUint32LE();
    const password : string = buffer.readString();
    const _extraInfo : string = buffer.readString();

    if (version < CLIENT_VERSION_MIN || version > CLIENT_VERSION_MAX){
        return await sendError('Sorry, only client versions 7.6 are supported at the moment.', client);
    }

    const account = db.getAccountById(accountNumber);

    if (account === null){
        return await sendError('That account doesnt exist!', client);
    }

    if (account.password === password){
        const extendedAccount = db.getAccountExtended(accountNumber);

        if (extendedAccount === null){
            return await sendError('Something went wront, please try again.', client);
        }

        await sendCharacterList(extendedAccount, client);
    }else{
        await sendError('Wrong account number or password.', client);
    }
}