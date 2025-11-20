import React, { useEffect, useRef, useState } from "react";
import ParallaxLayer from "./ParallaxLayer";

export default function Hero() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setPointer({ x, y });
    };

    const onScroll = () => setScrollY(window.scrollY || window.pageYOffset);

    const node = rootRef.current;
    node?.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      node?.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // compute transforms for three depth layers
  const layerTransform = (depth: number) => {
    const dx = pointer.x * (1 - depth) * 18; // pointer parallax
    const dy = pointer.y * (1 - depth) * 12 + scrollY * depth * 0.02; // include scroll
    return `translate3d(${dx}px, ${dy}px, 0)`;
  };

  return (
    <section
      ref={rootRef}
      className="relative h-[70vh] sm:h-[65vh] overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0"
        style={{ transform: layerTransform(1), transition: "transform 200ms linear" }}
      >
        <ParallaxLayer src="/assets/hero-layer-3.svg" depth={1} />
      </div>

      <div
        className="absolute inset-0"
        style={{ transform: layerTransform(0.6), transition: "transform 220ms linear" }}
      >
        <ParallaxLayer src="/assets/hero-layer-2.svg" depth={0.6} />
      </div>

      <div
        className="absolute inset-0"
        style={{ transform: layerTransform(0.2), transition: "transform 240ms linear" }}
      >
        <ParallaxLayer src="/assets/hero-layer-1.svg" depth={0.2} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <h1 id="hero-title" className="text-4xl md:text-6xl font-extrabold drop-shadow-lg text-white">
          Playful Parallax Portfolio
        </h1>
        <p className="mt-4 max-w-xl text-center text-white/80">
          Interactive hero with pointer and scroll parallax. Toggle accessible mode to reduce motion.
        </p>
      </div>
    </section>
  );
}
