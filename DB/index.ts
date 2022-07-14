import { SQLite } from "./sqlite/SQLite.class.ts";

const db = new SQLite('./Data/sqlite.db');

db.up();
db.updateWorlds();
db.tryInsertDevData();

export default db;