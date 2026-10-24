import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-16 text-center">
      <h1 className="text-4xl font-bold">Lost your way?</h1>
      <p className="text-white/60">We couldn&apos;t find that page.</p>
      <Link href="/" className="rounded bg-white px-5 py-2 font-semibold text-black">
        OpenReel Home
      </Link>
    </div>
  );
}
