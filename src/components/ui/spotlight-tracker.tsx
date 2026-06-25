"use client";

import { useEffect, useRef } from "react";

/**
 * Drop inside any element that has the `spotlight-card` class. Tracks the
 * cursor over that parent and drives the --mx/--my CSS vars the glow reads.
 * Renders nothing visible. Works for any tag (links, articles, divs).
 */
export function SpotlightTracker() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect();
      el!.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el!.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return <span ref={ref} aria-hidden className="sr-only" />;
}
