import { Database } from "bun:sqlite";

// Single file DB — good enough for a single-server indie game.
// Change the path if you want it stored somewhere else (e.g. server/data/game.sqlite)
export const db = new Database("game.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );
`);

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}