import type { Metadata } from "next";
import { getAllTitles } from "@/lib/catalog";

export const metadata: Metadata = { title: "About & licenses" };

export default function AboutPage() {
  const titles = getAllTitles();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 sm:px-8">
      <h1 className="text-3xl font-bold">About OpenReel</h1>
      <p className="mt-4 text-white/80">
        OpenReel is a free streaming service. Every title is either in the public domain or released under a Creative
        Commons license that allows free redistribution, so there are no subscriptions and no ads. Video files are streamed
        directly from the{" "}
        <a href="https://archive.org" className="underline" target="_blank" rel="noreferrer">
          Internet Archive
        </a>
        .
      </p>
      <p className="mt-3 text-white/60 text-sm">
        Public-domain status can vary by country. If you believe a title is listed in error, please contact us and it will be
        removed.
      </p>
      <h2 className="mt-10 mb-4 text-xl font-semibold">Credits &amp; licenses</h2>
      <div className="overflow-x-auto rounded border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Year</th>
              <th className="px-4 py-2 font-medium">License</th>
              <th className="px-4 py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {titles.map((t) => (
              <tr key={t.slug} className="border-t border-white/10">
                <td className="px-4 py-2">{t.title}</td>
                <td className="px-4 py-2 text-white/60">{t.year}</td>
                <td className="px-4 py-2 text-white/60">{t.license}</td>
                <td className="px-4 py-2">
                  <a href={t.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                    archive.org
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
