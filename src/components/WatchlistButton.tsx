"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleWatchlistAction } from "@/app/actions";

export default function WatchlistButton({ slug, initial, signedIn }: { slug: string; initial: boolean; signedIn: boolean }) {
  const [inList, setInList] = useState(initial);
  const [pending, startTransition] = useTransition();
  const className =
    "flex items-center gap-2 rounded border border-white/40 bg-black/40 px-4 py-2.5 font-semibold hover:border-white disabled:opacity-60";

  if (!signedIn) {
    return (
      <Link href={`/login?next=/title/${slug}`} className={className} title="Sign in to save titles">
        + My List
      </Link>
    );
  }

  return (
    <button
      className={className}
      disabled={pending}
      aria-pressed={inList}
      onClick={() =>
        startTransition(async () => {
          setInList(await toggleWatchlistAction(slug));
        })
      }
    >
      {inList ? "✓ In My List" : "+ My List"}
    </button>
  );
}
