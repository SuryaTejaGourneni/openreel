import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import TitleGrid from "@/components/TitleGrid";
import { getCurrentUser } from "@/lib/auth";
import { getWatchlist } from "@/lib/catalog";

export const metadata: Metadata = { title: "My List" };

export default async function MyListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my-list");
  const titles = getWatchlist(user.id);

  return (
    <div className="px-4 pt-28 sm:px-8 md:pt-24 lg:px-12">
      <h1 className="mb-6 text-2xl font-semibold">My List</h1>
      {titles.length === 0 ? (
        <p className="text-white/60">
          Nothing saved yet.{" "}
          <Link href="/browse" className="text-white underline">
            Browse titles
          </Link>{" "}
          and add them with &ldquo;+ My List&rdquo;.
        </p>
      ) : (
        <TitleGrid titles={titles} />
      )}
    </div>
  );
}
