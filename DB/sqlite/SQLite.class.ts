import log from 'Logger';
import { Database } from "../Database.class.ts";
import { sqliteDB } from "Dependencies";
import { DEVELOPMENT_MODE } from "Config";

import CreateAccountsTable from "../Queries/CreateAccountsTable.ts";
import CreateCharactersTable from "../Queries/CreateCharactersTable.ts";
import CreateWorldsTable from "../Queries/CreateWorldsTable.ts";
import AccountExtendedView from "../Queries/Views/AccountExtendedView.sql.ts";
import { IDBAccount, IDBAccountExtended, IDBPlayer } from "Types";
import { Player } from "Game/Player/Player.class.ts";
import db from "DB";

export class SQLite extends Database {
    constructor(private readonly _path : string){
        super();
        this._db = new sqliteDB(this._path);
    }

    private _db : any;

    public up(){
        this._db.query(CreateAccountsTable());
        this._db.query(CreateCharactersTable());
        this._db.query(CreateWorldsTable());
    }

    public tryInsertDevData(){
        if (DEVELOPMENT_MODE){
            try {
                this._db.query(`INSERT INTO accounts (id, password) VALUES (8899, '8899')`);
            }catch(err){
                if (err.message.includes('UNIQUE')){
                    log.debug(`Default account already exists.`);
                }else{
                    throw err;
                }
            }

            try {
                this._db.query(`INSERT INTO characters (account_id, world_id, name) VALUES (8899, 1, 'Holy Ghost')`);
                this._db.query(`INSERT INTO characters (account_id, world_id, name) VALUES (8899, 1, 'Holy God')`);
            }catch(err){
                if (err.message.includes('UNIQUE')){
                    log.debug(`Default characters already exists.`);
                    this._db.query(`UPDATE characters SET world_id = 1 WHERE world_id ISNULL`);
                }else{
                    throw err;
                }
            }
        }else{
            this._db.query(`DELETE FROM accounts WHERE id = 8899`);
        }
    }

    public updateWorlds(){
        const worlds = JSON.parse(Deno.readTextFileSync('./Data/worlds.json'));
        this._db.query(`DROP TABLE worlds`);
        this._db.query(CreateWorldsTable());

        for (const world of worlds){
            this._db.query(`INSERT INTO worlds (name, ip, port) VALUES ('${world.name}', '${world.ip}', ${world.port})`);
        }
    }

    public getAccountById(id : number) : IDBAccount | null {
        const accounts : any[] = this._db.query(`SELECT * FROM accounts WHERE id = ${id} LIMIT 1`);
        let account : any = {};

        if (accounts.length > 0){
            [
                account.id,
                account.password,
                account.type,
                account.premdays,
                account.activatedAt
            ] = accounts[0];
        }else{
            return null;
        }

        return account;
    }

    public getAccountExtended(id : number) : IDBAccountExtended | null {
        const accounts: any[] = this._db.query(AccountExtendedView(id));
        const mappedAccount : any = {accountId: -1, password: '', premdays: 0, characters: []};

        if (accounts.length > 0){
            [mappedAccount.accountId, mappedAccount.password, mappedAccount.premdays] = accounts[0];

            for (const extendedInfo of accounts){
                const character : any = {};
                const world : any = {};
                [character.accountId, character.password, character.premdays, character.name, character.groupId, character.deleted, world.name, world.ip, world.port] = extendedInfo;
                character.world = world;
                character.deleted = character.deleted === 1 ? true : false;

                delete character.accountId;
                delete character.password;
                delete character.premdays;
                mappedAccount.characters.push(character);
            }

            return mappedAccount;
        }else{
            return null;
        }
    }

    public getPlayerByName(name : string) : IDBPlayer | null {
        const rawPlayer = db.query(`SELECT * FROM characters WHERE name = '${name}' LIMIT 1`);

        if (rawPlayer.length > 0){
            const player : IDBPlayer = { outfit: {}, position: {} } as IDBPlayer;
            [
                player.id,
                player.name,
                player.group,
                player.accountId,
                player.worldId,
                player.level,
                player.vocation,
                player.health,
                player.maxHealth,
                player.experience,
                player.outfit.lookBody,
                player.outfit.lookFeet,
                player.outfit.lookHead,
                player.outfit.lookLegs,
                player.outfit.lookType,
                player.lightLevel,
                player.magicLevel,
                player.mana,
                player.maxMana,
                player.manaSpent,
                player.soulPoints,
                player.townId,
                player.position.x,
                player.position.y,
                player.position.z,
                player.capacity,
                player.sex,
                player.lastLogin,
                player.lastIp,
                player.skull,
                player.skullEndTime,
                player.lastSave,
                player.onlineTimeMinutes,
                player.skillFist,
                player.skillFistTries,
                player.skillClub,
                player.skillClubTries,
                player.skillSword,
                player.skillSwordTries,
                player.skillAxe,
                player.skillAxeTries,
                player.skillDist,
                player.skillDistTries,
                player.skillShielding,
                player.skillShieldingTries,
                player.skillFishing,
                player.skillFishingTries,
                player.deleted
            ] = rawPlayer[0];

            player.deleted = player.deleted ? true : false;
            return player;
        }else{
            return null;
        }

    }

    public savePlayer(player : Player){
        this._db.query(`UPDATE characters SET
        lookType = ${player.outfit.lookType},
        lookHead = ${player.outfit.lookHead},
        lookBody = ${player.outfit.lookBody},
        lookLegs = ${player.outfit.lookLegs},
        lookFeet = ${player.outfit.lookFeet},
        position_x = ${player.position.x},
        position_y = ${player.position.y},
        position_z = ${player.position.z},
        light_level = ${player.lightInfo.level},
        last_login = ${player.loggedInAt},
        last_save = ${Date.now()}
        WHERE name = '${player.name}'
        `);
    }

    public query(query : string){
        return this._db.query(query);
    }

    public close() : void {
        return this._db.close();
    }
}