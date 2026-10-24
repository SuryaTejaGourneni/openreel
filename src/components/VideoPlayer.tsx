"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = {
  slug: string;
  title: string;
  src: string;
  poster: string;
  startAt: number;
  signedIn: boolean;
};

const SAVE_INTERVAL_MS = 10_000;

export default function VideoPlayer({ slug, title, src, poster, startAt, signedIn }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let destroyHls: (() => void) | undefined;
    let cancelled = false;

    const resume = () => {
      if (startAt > 0 && startAt < video.duration - 5) video.currentTime = startAt;
    };
    video.addEventListener("loadedmetadata", resume, { once: true });

    if (src.endsWith(".m3u8") && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) return;
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        destroyHls = () => hls.destroy();
      });
    } else {
      video.src = src;
    }
    video.play().catch(() => {});

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", resume);
      destroyHls?.();
    };
  }, [src, startAt]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !signedIn) return;
    let lastSaved = 0;

    const save = (force = false) => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const now = Date.now();
      if (!force && now - lastSaved < SAVE_INTERVAL_MS) return;
      lastSaved = now;
      const body = JSON.stringify({ slug, position: video.currentTime, duration: video.duration });
      if (force && navigator.sendBeacon) {
        navigator.sendBeacon("/api/progress", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
          () => {},
        );
      }
    };
    const onTime = () => save();
    const onPause = () => save(true);
    const onHide = () => document.visibilityState === "hidden" && save(true);

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onPause);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPause);
    return () => {
      save(true);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onPause);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPause);
    };
  }, [slug, signedIn]);

  return (
    <div className="group relative h-screen w-full bg-black">
      <video ref={videoRef} poster={poster} controls playsInline className="h-full w-full" aria-label={title} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent p-4 opacity-100 transition-opacity group-hover:opacity-100 sm:p-6">
        <Link href={`/title/${slug}`} className="pointer-events-auto text-2xl hover:text-white/70" aria-label="Back">
          ←
        </Link>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </div>
  );
}
