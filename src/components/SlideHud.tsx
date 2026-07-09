import { useEffect, useState } from "react";
import type { Slide } from "@/data/slides";

type SlideHudProps = {
  slides: Slide[];
  slideIndex: number | null;
};

export function SlideHud({ slides, slideIndex }: SlideHudProps) {
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (slideIndex === null) return;
    setFaded(false);
    const t = setTimeout(() => setFaded(true), 3000);
    return () => clearTimeout(t);
  }, [slideIndex]);

  if (slideIndex === null) return null;
  const slide = slides[slideIndex];

  return (
    <div
      className={`pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/70 px-5 py-2 text-white shadow-lg backdrop-blur transition-opacity duration-700 ${
        faded ? "opacity-25" : "opacity-100"
      }`}
    >
      <span className="font-medium">{slide.titulo}</span>
      <span className="ml-3 text-sm text-white/70">
        {slideIndex + 1} / {slides.length}
      </span>
    </div>
  );
}
