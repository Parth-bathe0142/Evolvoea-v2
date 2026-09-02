import { db, type User } from "../db";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // Only 7 days

// ---------- Passwords ----------

export async function hashPassword(password: string): Promise<string> {
  // Bun's built-in password hashing — no external package needed.
  return Bun.password.hash(password, { algorithm: "argon2id" });
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return Bun.password.verify(password, hash);
}

// ---------- Users ----------

export function createUser(
  username: string,
  email: string,
  passwordHash: string
): User {
  const stmt = db.prepare(
    `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?) RETURNING *`
  );
  return stmt.get(username, email, passwordHash) as User;
}

export function findUserByUsername(username: string): User | null {
  return db
    .prepare(`SELECT * FROM users WHERE username = ?`)
    .get(username) as User | null;
}

export function findUserByEmail(email: string): User | null {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as
    | User
    | null;
}

// ---------- Sessions ----------

export function createSession(userId: number): {
  id: string;
  expiresAt: Date;
} {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`
  ).run(id, userId, expiresAt.toISOString());
  return { id, expiresAt };
}

export function getSession(sessionId: string): User | null {
  const row = db
    .prepare(
      `SELECT users.* FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`
    )
    .get(sessionId) as User | null;
  return row;
}

export function deleteSession(sessionId: string): void {
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(sessionId);
}
