// src/components/FooterCTA.tsx
import React, { useEffect, useMemo, useState } from "react";
import ShareModal from "./ShareModal";

function useCurrentSection(selector = "main > section") {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        let best: { ratio: number; title: string | null } = { ratio: 0, title: null };
        entries.forEach((ent) => {
          const titleEl = ent.target.querySelector("h2, h1, [data-section-title]") as HTMLElement | null;
          const title = titleEl?.innerText ?? ent.target.getAttribute("aria-label") ?? null;
          if (ent.intersectionRatio > best.ratio && title) best = { ratio: ent.intersectionRatio, title };
        });
        if (best.title) setCurrent(best.title);
      },
      { threshold: [0.15, 0.5, 0.75] }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [selector]);

  return current;
}

export default function FooterCTA() {
  const current = useCurrentSection();
  const [open, setOpen] = useState(false);

  const shareUrl = useMemo(() => {
    // prefer canonical location, fall back to current location
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  useEffect(() => {
    // accessibility: hide if no sections found (safety)
    // noop
  }, []);

  return (
    <>
      <div className="fixed left-4 right-4 bottom-6 z-40 md:left-auto md:right-6 md:bottom-6">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4 rounded-full bg-black/40 border border-white/8 py-2 px-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              ⇧
            </div>
            <div>
              <div className="text-sm font-semibold">{current ?? "Playful Parallax"}</div>
              <div className="text-xs text-white/70">Ready to share</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm"
            >
              Share
            </button>
            <a
              href="/assets/hero-layer-1.svg"
              className="px-3 py-1 rounded-md bg-white/6 hover:bg-white/10 text-sm"
            >
              View art
            </a>
          </div>
        </div>
      </div>

      <ShareModal open={open} onClose={() => setOpen(false)} url={shareUrl} title="Share this demo" />
    </>
  );
}
