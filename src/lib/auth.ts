import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";

const SESSION_COOKIE = "openreel_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type User = { id: number; email: string; name: string };

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createUser(name: string, email: string, password: string): Promise<User | null> {
  const existing = db.prepare("SELECT 1 FROM users WHERE email = ?").get(email);
  if (existing) return null;
  const hash = await bcrypt.hash(password, 12);
  const info = db.prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)").run(email, name, hash);
  return { id: Number(info.lastInsertRowid), email, name };
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const row = db.prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").get(email) as
    | (User & { password_hash: string })
    | undefined;
  if (!row || !(await bcrypt.compare(password, row.password_hash))) return null;
  return { id: row.id, email: row.email, name: row.name };
}

export async function startSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(hashToken(token), userId, expiresAt);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  store.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > unixepoch()`,
    )
    .get(hashToken(token)) as User | undefined;
  return row ?? null;
});
