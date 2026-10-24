import Hero from "@/components/Hero";
import Row from "@/components/Row";
import TitleCard from "@/components/TitleCard";
import { getCurrentUser } from "@/lib/auth";
import { getContinueWatching, getFeatured, getGenres, getTitlesByGenre, getWatchlist, isInWatchlist } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const featured = getFeatured();
  const hero = featured[Math.floor(Math.random() * featured.length)];
  const continueWatching = user ? getContinueWatching(user.id) : [];
  const myList = user ? getWatchlist(user.id) : [];

  return (
    <>
      {hero && <Hero title={hero} inList={user ? isInWatchlist(user.id, hero.slug) : false} signedIn={Boolean(user)} />}
      <div className="relative z-10 -mt-24">
        {continueWatching.length > 0 && (
          <Row title={`Continue watching for ${user!.name}`}>
            {continueWatching.map((t) => (
              <TitleCard key={t.slug} title={t} progress={t.positionSeconds / t.progressDuration} />
            ))}
          </Row>
        )}
        {myList.length > 0 && (
          <Row title="My List" href="/my-list">
            {myList.map((t) => (
              <TitleCard key={t.slug} title={t} />
            ))}
          </Row>
        )}
        <Row title="Featured">
          {featured.map((t) => (
            <TitleCard key={t.slug} title={t} />
          ))}
        </Row>
        {getGenres().map((genre) => (
          <Row key={genre} title={genre} href={`/browse?genre=${encodeURIComponent(genre)}`}>
            {getTitlesByGenre(genre).map((t) => (
              <TitleCard key={t.slug} title={t} />
            ))}
          </Row>
        ))}
      </div>
    </>
  );
}
