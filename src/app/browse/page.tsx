import type { Metadata } from "next";
import Link from "next/link";
import TitleGrid from "@/components/TitleGrid";
import { getAllTitles, getGenres, getTitlesByGenre } from "@/lib/catalog";

export const metadata: Metadata = { title: "Browse" };

export default async function BrowsePage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const genre = (await searchParams).genre;
  const genres = getGenres();
  const titles = genre ? getTitlesByGenre(genre) : getAllTitles();
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? "border-white bg-white text-black" : "border-white/30 hover:border-white"}`;

  return (
    <div className="px-4 pt-28 sm:px-8 md:pt-24 lg:px-12">
      <h1 className="mb-4 text-2xl font-semibold">{genre ?? "All titles"}</h1>
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/browse" className={chip(!genre)}>
          All
        </Link>
        {genres.map((g) => (
          <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className={chip(g === genre)}>
            {g}
          </Link>
        ))}
      </div>
      <TitleGrid titles={titles} />
    </div>
  );
}
