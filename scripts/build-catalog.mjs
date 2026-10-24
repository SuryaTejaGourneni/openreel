// Builds data/catalog.json from Internet Archive item metadata.
// Usage: node scripts/build-catalog.mjs
import { readFile, writeFile } from "node:fs/promises";

const sources = JSON.parse(await readFile(new URL("../data/sources.json", import.meta.url), "utf8"));

const PREFERRED_FORMATS = ["h.264 HD", "h.264", "h.264 IA", "MPEG4", "512Kb MPEG4"];

function stripHtml(s = "") {
  return String(Array.isArray(s) ? s.join(" ") : s)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function pickVideo(files) {
  const mp4s = files.filter((f) => /\.(mp4|m4v)$/i.test(f.name) && PREFERRED_FORMATS.includes(f.format));
  mp4s.sort((a, b) => {
    const fa = PREFERRED_FORMATS.indexOf(a.format);
    const fb = PREFERRED_FORMATS.indexOf(b.format);
    if (fa !== fb) return fa - fb;
    const ha = Math.min(Number(a.height) || 0, 1080);
    const hb = Math.min(Number(b.height) || 0, 1080);
    return hb - ha;
  });
  return mp4s[0];
}

function pickPoster(files) {
  const images = files.filter(
    (f) => f.source === "original" && /\.(jpe?g|png)$/i.test(f.name) && f.name !== "__ia_thumb.jpg" && !f.name.includes(".thumbs/"),
  );
  images.sort((a, b) => (Number(b.size) || 0) - (Number(a.size) || 0));
  return images[0];
}

function licenseLabel(url) {
  if (!url) return "Public Domain";
  const u = String(url).toLowerCase();
  if (u.includes("publicdomain/zero")) return "CC0 1.0 (Public Domain)";
  if (u.includes("publicdomain/mark")) return "Public Domain Mark 1.0";
  const m = u.match(/licenses\/([a-z-]+)\/([\d.]+)/);
  return m ? `CC ${m[1].toUpperCase()} ${m[2]}` : "Public Domain";
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const catalog = [];
for (const src of sources) {
  try {
    const res = await fetch(`https://archive.org/metadata/${src.id}`);
    const data = await res.json();
    const files = data.files ?? [];
    const video = pickVideo(files);
    if (!video) {
      console.warn(`skip ${src.id}: no playable mp4`);
      continue;
    }
    const m = data.metadata ?? {};
    const poster = pickPoster(files);
    const base = `https://archive.org/download/${src.id}`;
    const enc = (n) => n.split("/").map(encodeURIComponent).join("/");
    const title = src.title ?? stripHtml(m.title).replace(/\s*\(\d{4}\)\s*$/, "");
    catalog.push({
      slug: slugify(title),
      title,
      year: src.year ?? (Number(m.year) || null),
      description: src.description ?? stripHtml(m.description).slice(0, 600),
      genres: src.genres,
      durationSeconds: Math.round(Number(video.length) || 0),
      videoUrl: `${base}/${enc(video.name)}`,
      posterUrl: poster ? `${base}/${enc(poster.name)}` : `https://archive.org/services/img/${src.id}`,
      thumbnailUrl: `https://archive.org/services/img/${src.id}`,
      license: src.license ?? licenseLabel(m.licenseurl),
      sourceUrl: `https://archive.org/details/${src.id}`,
      archiveId: src.id,
      featured: Boolean(src.featured),
    });
    console.log(`ok   ${src.id} -> ${video.name} (${video.format}, ${video.height}p)`);
  } catch (err) {
    console.warn(`skip ${src.id}: ${err.message}`);
  }
}

await writeFile(new URL("../data/catalog.json", import.meta.url), JSON.stringify(catalog, null, 2) + "\n");
console.log(`wrote ${catalog.length} titles`);
