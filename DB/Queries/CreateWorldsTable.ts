export default function(){
    return `CREATE TABLE IF NOT EXISTS worlds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            ip VARCHAR(15) NOT NULL,
            port INTEGER NOT NULL
            )`
}