import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 px-4 py-10 text-sm text-white/50 sm:px-8 lg:px-12">
      <p>
        OpenReel streams public-domain and Creative Commons films, free for everyone. Videos are hosted by the{" "}
        <a href="https://archive.org" className="underline hover:text-white" target="_blank" rel="noreferrer">
          Internet Archive
        </a>
        .
      </p>
      <p className="mt-2">
        <Link href="/about" className="underline hover:text-white">
          About &amp; licenses
        </Link>
      </p>
    </footer>
  );
}
