import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { getCurrentUser } from "@/lib/auth";
import { getProgress, getTitle } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = getTitle((await params).slug);
  return title ? { title: `Watch ${title.title}` } : {};
}

export default async function WatchPage({ params }: Props) {
  const title = getTitle((await params).slug);
  if (!title) notFound();
  const user = await getCurrentUser();

  return (
    <VideoPlayer
      slug={title.slug}
      title={title.title}
      src={title.videoUrl}
      poster={title.backdropUrl}
      startAt={user ? getProgress(user.id, title.slug) : 0}
      signedIn={Boolean(user)}
    />
  );
}
