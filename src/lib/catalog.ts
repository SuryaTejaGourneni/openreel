import { db } from "./db";

export type Title = {
  slug: string;
  title: string;
  year: number | null;
  description: string;
  genres: string[];
  durationSeconds: number;
  videoUrl: string;
  posterUrl: string;
  backdropUrl: string;
  license: string;
  sourceUrl: string;
  featured: boolean;
};

export type TitleWithProgress = Title & { positionSeconds: number; progressDuration: number };

type Row = {
  slug: string;
  title: string;
  year: number | null;
  description: string;
  genres: string;
  duration_seconds: number;
  video_url: string;
  poster_url: string;
  backdrop_url: string;
  license: string;
  source_url: string;
  featured: number;
};

function toTitle(r: Row): Title {
  return {
    slug: r.slug,
    title: r.title,
    year: r.year,
    description: r.description,
    genres: JSON.parse(r.genres),
    durationSeconds: r.duration_seconds,
    videoUrl: r.video_url,
    posterUrl: r.poster_url,
    backdropUrl: r.backdrop_url,
    license: r.license,
    sourceUrl: r.source_url,
    featured: r.featured === 1,
  };
}

export function getAllTitles(): Title[] {
  return (db.prepare("SELECT * FROM titles ORDER BY title").all() as Row[]).map(toTitle);
}

export function getTitle(slug: string): Title | null {
  const row = db.prepare("SELECT * FROM titles WHERE slug = ?").get(slug) as Row | undefined;
  return row ? toTitle(row) : null;
}

export function getFeatured(): Title[] {
  return (db.prepare("SELECT * FROM titles WHERE featured = 1 ORDER BY title").all() as Row[]).map(toTitle);
}

export function getGenres(): string[] {
  const set = new Set<string>();
  for (const t of getAllTitles()) t.genres.forEach((g) => set.add(g));
  return [...set].sort();
}

export function getTitlesByGenre(genre: string): Title[] {
  return getAllTitles().filter((t) => t.genres.includes(genre));
}

export function searchTitles(query: string): Title[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllTitles().filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.genres.some((g) => g.toLowerCase().includes(q)) ||
      String(t.year ?? "").includes(q),
  );
}

export function getSimilar(title: Title, limit = 12): Title[] {
  return getAllTitles()
    .filter((t) => t.slug !== title.slug)
    .map((t) => ({ t, score: t.genres.filter((g) => title.genres.includes(g)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.t.title.localeCompare(b.t.title))
    .slice(0, limit)
    .map((x) => x.t);
}

export function getWatchlist(userId: number): Title[] {
  return (
    db
      .prepare("SELECT t.* FROM watchlist w JOIN titles t ON t.slug = w.slug WHERE w.user_id = ? ORDER BY w.added_at DESC")
      .all(userId) as Row[]
  ).map(toTitle);
}

export function isInWatchlist(userId: number, slug: string): boolean {
  return Boolean(db.prepare("SELECT 1 FROM watchlist WHERE user_id = ? AND slug = ?").get(userId, slug));
}

export function toggleWatchlist(userId: number, slug: string): boolean {
  if (isInWatchlist(userId, slug)) {
    db.prepare("DELETE FROM watchlist WHERE user_id = ? AND slug = ?").run(userId, slug);
    return false;
  }
  db.prepare("INSERT INTO watchlist (user_id, slug) VALUES (?, ?)").run(userId, slug);
  return true;
}

export function getContinueWatching(userId: number): TitleWithProgress[] {
  const rows = db
    .prepare(
      `SELECT t.*, p.position_seconds, p.duration_seconds AS progress_duration
       FROM progress p JOIN titles t ON t.slug = p.slug
       WHERE p.user_id = ? AND p.position_seconds > 10 AND p.position_seconds < p.duration_seconds * 0.95
       ORDER BY p.updated_at DESC`,
    )
    .all(userId) as (Row & { position_seconds: number; progress_duration: number })[];
  return rows.map((r) => ({ ...toTitle(r), positionSeconds: r.position_seconds, progressDuration: r.progress_duration }));
}

export function getProgress(userId: number, slug: string): number {
  const row = db.prepare("SELECT position_seconds, duration_seconds FROM progress WHERE user_id = ? AND slug = ?").get(userId, slug) as
    | { position_seconds: number; duration_seconds: number }
    | undefined;
  if (!row || row.position_seconds >= row.duration_seconds * 0.95) return 0;
  return row.position_seconds;
}

export function saveProgress(userId: number, slug: string, position: number, duration: number) {
  db.prepare(
    `INSERT INTO progress (user_id, slug, position_seconds, duration_seconds, updated_at)
     VALUES (?, ?, ?, ?, unixepoch())
     ON CONFLICT(user_id, slug) DO UPDATE SET position_seconds = excluded.position_seconds,
       duration_seconds = excluded.duration_seconds, updated_at = excluded.updated_at`,
  ).run(userId, slug, position, duration);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
