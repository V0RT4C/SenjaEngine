export default function(accountId : number){
    return `SELECT 
    accounts.id,
    accounts.password,
    accounts.premdays,
    characters.name,
    characters.group_id,
    characters.deleted,
    worlds.name,
    worlds.ip,
    worlds.port 
    FROM accounts 
    INNER JOIN characters ON accounts.id = characters.account_id 
    INNER JOIN worlds ON characters.world_id = worlds.id WHERE accounts.id = ${accountId}`
}
