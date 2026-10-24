"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { logout } from "@/app/actions";

function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
      }}
    >
      <input
        aria-label="Search titles"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Titles, genres, years"
        className="w-36 rounded border border-white/20 bg-black/60 px-3 py-1.5 text-sm placeholder:text-white/40 focus:w-56 focus:border-white/60 focus:outline-none transition-all sm:w-48"
      />
    </form>
  );
}

export default function Navbar({ user }: { user: { name: string } | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/watch/")) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    ...(user ? [{ href: "/my-list", label: "My List" }] : []),
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-[#0b0b0f]/95 shadow-lg backdrop-blur" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 items-center gap-4 px-4 sm:gap-6 sm:px-8 lg:px-12">
        <Link href="/" className="text-2xl font-black tracking-tight text-brand">
          OPENREEL
        </Link>
        <ul className="hidden items-center gap-5 text-sm md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={pathname === l.href ? "font-semibold text-white" : "text-white/70 hover:text-white"}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:block">
            <Suspense>
              <SearchBox />
            </Suspense>
          </div>
          <Link href="/search" aria-label="Search" className="text-white/80 hover:text-white sm:hidden">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
          {user ? (
            <form action={logout} className="flex items-center gap-3">
              <span className="hidden text-sm text-white/70 sm:inline">Hi, {user.name}</span>
              <button className="text-sm text-white/70 hover:text-white">Sign out</button>
            </form>
          ) : (
            <Link href="/login" className="rounded bg-brand px-3 py-1.5 text-sm font-semibold hover:bg-brand-dark">
              Sign in
            </Link>
          )}
        </div>
      </nav>
      <ul className="no-scrollbar flex gap-5 overflow-x-auto px-4 pb-3 text-sm md:hidden">
        {links.map((l) => (
          <li key={l.href} className="shrink-0">
            <Link href={l.href} className={pathname === l.href ? "font-semibold text-white" : "text-white/70"}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
}
