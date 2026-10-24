import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import catalog from "../../data/catalog.json";

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "openreel.db");

function init(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS titles (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      year INTEGER,
      description TEXT NOT NULL,
      genres TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      video_url TEXT NOT NULL,
      poster_url TEXT NOT NULL,
      backdrop_url TEXT NOT NULL,
      license TEXT NOT NULL,
      source_url TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL REFERENCES titles(slug) ON DELETE CASCADE,
      added_at INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (user_id, slug)
    );
    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL REFERENCES titles(slug) ON DELETE CASCADE,
      position_seconds REAL NOT NULL,
      duration_seconds REAL NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (user_id, slug)
    );
  `);

  const upsert = db.prepare(`
    INSERT INTO titles (slug, title, year, description, genres, duration_seconds, video_url, poster_url, backdrop_url, license, source_url, featured)
    VALUES (@slug, @title, @year, @description, @genres, @durationSeconds, @videoUrl, @posterUrl, @backdropUrl, @license, @sourceUrl, @featured)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title, year = excluded.year, description = excluded.description, genres = excluded.genres,
      duration_seconds = excluded.duration_seconds, video_url = excluded.video_url, poster_url = excluded.poster_url,
      backdrop_url = excluded.backdrop_url, license = excluded.license, source_url = excluded.source_url, featured = excluded.featured
  `);
  db.transaction(() => {
    for (const t of catalog) {
      upsert.run({
        ...t,
        genres: JSON.stringify(t.genres),
        backdropUrl: t.backdropUrl ?? t.posterUrl,
        featured: t.featured ? 1 : 0,
      });
    }
  })();

  return db;
}

const globalForDb = globalThis as unknown as { __openreelDb?: Database.Database };

export const db = globalForDb.__openreelDb ?? init();
if (process.env.NODE_ENV !== "production") globalForDb.__openreelDb = db;
