import Image from "next/image";
import Link from "next/link";
import { formatDuration, type Title } from "@/lib/catalog";
import WatchlistButton from "./WatchlistButton";

export default function Hero({ title, inList, signedIn }: { title: Title; inList: boolean; signedIn: boolean }) {
  return (
    <section className="relative h-[75vh] min-h-[480px] w-full overflow-hidden">
      <Image src={title.backdropUrl} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
      <div className="absolute bottom-[18%] left-0 max-w-2xl px-4 sm:px-8 lg:px-12">
        <p className="mb-2 text-xs font-semibold tracking-[0.3em] text-brand uppercase">Featured · Free to watch</p>
        <h1 className="text-4xl font-black drop-shadow sm:text-6xl">{title.title}</h1>
        <p className="mt-3 text-sm text-white/70">
          {title.year} · {formatDuration(title.durationSeconds)} · {title.genres.join(" · ")}
        </p>
        <p className="mt-4 line-clamp-3 text-base text-white/90 sm:text-lg">{title.description}</p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/watch/${title.slug}`}
            className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-semibold text-black hover:bg-white/80"
          >
            <span aria-hidden>▶</span> Play
          </Link>
          <Link
            href={`/title/${title.slug}`}
            className="rounded bg-white/20 px-6 py-2.5 font-semibold backdrop-blur hover:bg-white/30"
          >
            More info
          </Link>
          <WatchlistButton slug={title.slug} initial={inList} signedIn={signedIn} />
        </div>
      </div>
    </section>
  );
}
