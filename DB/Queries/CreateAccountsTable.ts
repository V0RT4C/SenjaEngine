export default function(){
    return `CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER NOT NULL,
  password VARCHAR(255) NOT NULL,
  type INTEGER NOT NULL DEFAULT 1,
  premdays INTEGER NOT NULL DEFAULT 0,
  activated_at UNSIGNED BIG INT NOT NULL DEFAULT 0,
  UNIQUE(id))`
}