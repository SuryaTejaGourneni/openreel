// Extracts a still frame from each catalog video (via ffmpeg) to use as hi-res card/hero artwork,
// then records it as backdropUrl in data/catalog.json.
// Usage: node scripts/extract-artwork.mjs [--force]
import { execFile } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);
const force = process.argv.includes("--force");
const catalogUrl = new URL("../data/catalog.json", import.meta.url);
const outDir = new URL("../public/artwork/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const catalog = JSON.parse(await readFile(catalogUrl, "utf8"));
const overrides = JSON.parse(await readFile(new URL("../data/sources.json", import.meta.url), "utf8"));

await Promise.all(
  catalog.map(async (t) => {
    const file = new URL(`${t.slug}.jpg`, outDir);
    const src = overrides.find((s) => s.id === t.archiveId);
    const at = src?.artworkAt ?? Math.max(5, Math.round(t.durationSeconds * 0.18));
    if (force || !existsSync(file)) {
      try {
        await run("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(at), "-i", t.videoUrl, "-frames:v", "1",
          "-vf", "scale='min(1280,iw)':-2", "-q:v", "3", file.pathname], { timeout: 120_000 });
        console.log(`ok   ${t.slug} @ ${at}s`);
      } catch (err) {
        console.warn(`fail ${t.slug}: ${err.message.split("\n")[0]}`);
      }
    }
    if (existsSync(file)) t.backdropUrl = `/artwork/${t.slug}.jpg`;
  }),
);

await writeFile(catalogUrl, JSON.stringify(catalog, null, 2) + "\n");
