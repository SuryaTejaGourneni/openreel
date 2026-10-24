import type { Title } from "@/lib/catalog";
import TitleCard from "./TitleCard";

export default function TitleGrid({ titles }: { titles: Title[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {titles.map((t) => (
        <TitleCard key={t.slug} title={t} />
      ))}
    </div>
  );
}
