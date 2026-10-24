import Image from "next/image";
import Link from "next/link";
import { formatDuration, type Title } from "@/lib/catalog";

export default function TitleCard({ title, progress }: { title: Title; progress?: number }) {
  return (
    <Link
      href={progress !== undefined ? `/watch/${title.slug}` : `/title/${title.slug}`}
      className="group relative block w-full shrink-0 overflow-hidden rounded-md bg-white/5 ring-white/0 transition duration-300 hover:z-10 hover:scale-105 hover:ring-2 hover:ring-white/70 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
    >
      <div className="relative aspect-video">
        <Image
          src={title.backdropUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <h3 className="line-clamp-1 text-sm font-semibold">{title.title}</h3>
          <p className="text-xs text-white/60">
            {title.year} · {formatDuration(title.durationSeconds)}
          </p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="h-1 bg-white/20" aria-label={`${Math.round(progress * 100)}% watched`}>
          <div className="h-full bg-brand" style={{ width: `${Math.min(100, progress * 100)}%` }} />
        </div>
      )}
    </Link>
  );
}
