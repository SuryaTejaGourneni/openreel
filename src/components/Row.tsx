"use client";

import Link from "next/link";
import { useRef } from "react";

export default function Row({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <section className="group/row relative my-8">
      <div className="mb-2 flex items-baseline gap-3 px-4 sm:px-8 lg:px-12">
        <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-white/50 hover:text-white">
            See all ›
          </Link>
        )}
      </div>
      <div className="relative">
        <button
          aria-label={`Scroll ${title} left`}
          onClick={() => scroll(-1)}
          className="absolute inset-y-0 left-0 z-20 hidden w-10 bg-black/50 text-3xl opacity-0 transition group-hover/row:opacity-100 sm:block lg:w-12"
        >
          ‹
        </button>
        <div
          ref={scroller}
          className="no-scrollbar grid auto-cols-[45%] grid-flow-col gap-2 overflow-x-auto scroll-smooth px-4 py-3 sm:auto-cols-[30%] sm:px-8 md:auto-cols-[23%] lg:auto-cols-[18.5%] lg:px-12"
        >
          {children}
        </div>
        <button
          aria-label={`Scroll ${title} right`}
          onClick={() => scroll(1)}
          className="absolute inset-y-0 right-0 z-20 hidden w-10 bg-black/50 text-3xl opacity-0 transition group-hover/row:opacity-100 sm:block lg:w-12"
        >
          ›
        </button>
      </div>
    </section>
  );
}
