"use client";

import { useEffect, useRef, useState } from "react";

export function LandingCountUp({
  value,
  prefix = "$",
  locale = "es-AR",
}: {
  value: number;
  prefix?: string;
  locale?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      requestAnimationFrame(() => setDisplay(value));
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const duration = 1100;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.4 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{prefix}{display.toLocaleString(locale)}</span>;
}
