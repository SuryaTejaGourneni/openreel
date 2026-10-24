import type { Metadata } from "next";
import TitleGrid from "@/components/TitleGrid";
import { searchTitles } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const results = searchTitles(q);

  return (
    <div className="px-4 pt-28 sm:px-8 md:pt-24 lg:px-12">
      <form action="/search" role="search" className="mb-6">
        <input
          name="q"
          defaultValue={q}
          aria-label="Search titles"
          placeholder="Search titles, genres, years"
          className="w-full max-w-xl rounded border border-white/20 bg-white/5 px-4 py-3 placeholder:text-white/40 focus:border-white/60 focus:outline-none"
        />
      </form>
      <h1 className="mb-6 text-2xl font-semibold">
        {q ? (
          <>
            Results for <span className="text-white/70">&ldquo;{q}&rdquo;</span>
          </>
        ) : (
          "Search"
        )}
      </h1>
      {!q ? (
        <p className="text-white/60">Type in the search box to find movies by title, genre or year.</p>
      ) : results.length === 0 ? (
        <p className="text-white/60">No titles match your search.</p>
      ) : (
        <TitleGrid titles={results} />
      )}
    </div>
  );
}
