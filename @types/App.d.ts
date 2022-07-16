export interface IGameOperation {
    execute() : Promise<void>,
    _internalOperations(...args : any) : boolean | Promise<boolean>,
    _networkOperations(...args : any) : boolean | Promise<boolean>
}

export interface StaticOperationCode {
    operationCode: number;
}

export interface IEnterGameDetails {
    os: number;
    version: number;
    gm: number;
    accountNumber: number;
    name: number;
    password: number;
}

export interface ILoginDetails {
    os: number;
    version: number;
    datSignature: number;
    sprSignature: number;
    picSignature: number;
    accountNumber: number;
    password: string;
    extraInfo: string;
}

export interface ILoginCharacter {
    name: string;
    world: string;
    ip: string;
    port: number;
}

export interface IItem {
    thingId: number;
    name: string;
}

export interface IOutfit {
    lookType: number;
    lookTypeEx: number;
    lookHead: number;
    lookBody: number;
    lookLegs: number;
    lookFeet: number;
    lookMount: number;
}

export interface ILightInfo {
    level: number;
    color: number;
}

export interface IPosition {
    x: number;
    y: number;
    z: number;
}

export interface ISkill {
    level: number;
    tries: number;
}

export interface IOTBMNode {
    type: any,
    nodes: any
}

export interface IOTBMTileFlags {
    protection: any;
    noPVP: any;
    noLogout: any;
    PVPZone: any;
    refresh: any;
}

export interface IOTBMNodeAttributes {
    text: string,
    spawnfile: string,
    housefile: string,
    houseDoorId: number,
    description: string,
    depotId: number,
    tileFlags: {
        protection: number,
        noPVP: number,
        noLogout: number,
        PVPZone: number,
        refresh: number
    },
    charges: number,
    count: number,
    tileId: number,
    actionId: number,
    uniqueId: number,
    destination: {
        x: number,
        y: number,
        z: number
    }
}

export interface IDBAccount {
    id : number;
    password : string;
    type : number;
    premdays : number;
    activatedAt : number;
}

export interface IDBAccountExtended {
    accountId : number;
    password : string;
    premdays : number;
    characters: {
        name : string;
        groupId : number;
        deleted : boolean;
        world : {
            name : string;
            ip : string;
            port : number;
        }
    }[]
}

export interface IDBPlayer {
    id: number;
    name: string;
    group: number;
    accountId: number;
    worldId: number;
    level: number;
    vocation: number;
    health: number;
    maxHealth: number;
    experience: number;
    outfit: {
        lookType: number;
        lookHead: number;
        lookBody: number;
        lookLegs: number;
        lookFeet: number;
    };
    magicLevel: number;
    mana: number;
    maxMana: number;
    manaSpent: number;
    soulPoints: number;
    townId: number;
    position: IPosition;
    capacity: number;
    sex: number;
    lastLogin: number;
    lastIp: string;
    skull: number;
    skullEndTime: number;
    lastLogout: number;
    onlineTimeMinutes: number;
    skillFist: number;
    skillFistTries: number;
    skillClub: number;
    skillClubTries: number;
    skillSword: number;
    skillSwordTries: number;
    skillAxe: number;
    skillAxeTries: number;
    skillDist: number;
    skillDistTries: number;
    skillShielding: number;
    skillShieldingTries: number;
    skillFishing: number;
    skillFishingTries: number;
    deleted: boolean;
}