import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Row from "@/components/Row";
import TitleCard from "@/components/TitleCard";
import WatchlistButton from "@/components/WatchlistButton";
import { getCurrentUser } from "@/lib/auth";
import { formatDuration, getProgress, getSimilar, getTitle, isInWatchlist } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = getTitle((await params).slug);
  return title ? { title: title.title, description: title.description } : {};
}

export default async function TitlePage({ params }: Props) {
  const title = getTitle((await params).slug);
  if (!title) notFound();
  const user = await getCurrentUser();
  const resumeAt = user ? getProgress(user.id, title.slug) : 0;
  const similar = getSimilar(title);

  return (
    <>
      <section className="relative h-[70vh] min-h-[460px] w-full overflow-hidden">
        <Image src={title.backdropUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
        <div className="absolute bottom-[12%] left-0 max-w-3xl px-4 sm:px-8 lg:px-12">
          <h1 className="text-4xl font-black sm:text-6xl">{title.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
            <span>{title.year}</span>
            <span>{formatDuration(title.durationSeconds)}</span>
            <span className="rounded border border-white/30 px-1.5 text-xs">FREE</span>
            {title.genres.map((g) => (
              <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className="hover:text-white hover:underline">
                {g}
              </Link>
            ))}
          </p>
          <p className="mt-4 text-base text-white/90 sm:text-lg">{title.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/watch/${title.slug}`}
              className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-semibold text-black hover:bg-white/80"
            >
              <span aria-hidden>▶</span> {resumeAt > 0 ? `Resume from ${formatDuration(resumeAt)}` : "Play"}
            </Link>
            <WatchlistButton slug={title.slug} initial={user ? isInWatchlist(user.id, title.slug) : false} signedIn={Boolean(user)} />
          </div>
          <p className="mt-6 text-xs text-white/50">
            License: {title.license} ·{" "}
            <a href={title.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-white">
              Source
            </a>
          </p>
        </div>
      </section>
      {similar.length > 0 && (
        <Row title="More like this">
          {similar.map((t) => (
            <TitleCard key={t.slug} title={t} />
          ))}
        </Row>
      )}
    </>
  );
}
