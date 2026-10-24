# OpenReel

A free, Netflix-style streaming platform for public-domain and Creative Commons films. No subscriptions and no ads. The videos are streamed directly from the [Internet Archive](https://archive.org).

## Features

- Netflix-style home page: a featured hero, genre rows, "Continue watching" and "My List"
- Title pages with "More like this" suggestions, plus license and source credits for every film
- A player that plays MP4 and HLS (`.m3u8`) files (HLS uses `hls.js` lazily), resumes where you left off and saves your progress every 10s
- Search by title, genre, year or description; a browse page you can filter by genre
- Email/password accounts (bcrypt hashes, httpOnly session cookies that are stored hashed in SQLite)
- An About page listing the license and source of every title

## Stack

Next.js 15 (App Router, server actions) · TypeScript · Tailwind CSS v4 · SQLite (`better-sqlite3`) · zod

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

The SQLite database is created at `data/openreel.db` on first request. Titles from `data/catalog.json` are upserted into it at startup. To store the database somewhere else, set `DATABASE_PATH`.

## Managing the catalog

The catalog is generated from Internet Archive item metadata:

1. Add an entry to `data/sources.json`. It needs the Archive identifier (`id`), `title`, `year`, `genres` and `description`, and can optionally set `featured`, `license` and `artworkAt` (in seconds).
2. Run `npm run catalog`. This fetches metadata, picks the best browser-playable H.264 MP4 and writes `data/catalog.json`.
3. Run `npm run artwork`. This uses `ffmpeg` to grab a still frame from each film into `public/artwork/` for cards and the hero.

Only add titles that are verifiably public domain (in the countries you serve) or licensed for free redistribution (e.g. CC BY / CC BY-SA / CC0).

## Deploying (Fly.io)

The app runs as a single Node server with SQLite on a persistent Fly volume (`/data`).

```bash
fly launch --no-deploy --copy-config --name <app-name>   # first time only
fly volumes create openreel_data --size 1 --region iad   # first time only
fly deploy
```

It is installable as a home-screen app on phones, tablets and desktops (web app manifest + icons).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run catalog` | Regenerate `data/catalog.json` from `data/sources.json` |
| `npm run artwork` | Extract artwork frames (needs `ffmpeg`) |
