import type { Metadata } from "next";
import TitleGrid from "@/components/TitleGrid";
import { searchTitles } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const results = searchTitles(q);

  return (
    <div className="px-4 pt-24 sm:px-8 lg:px-12">
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
