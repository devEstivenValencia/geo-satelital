import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { MapRef } from "@/components/ui/map";
import type { Slide } from "@/data/slides";

type UsePresentationArgs = {
  map: MapRef | null;
  slides: Slide[];
  showExactly: (ids: string[]) => void;
  setAll: (on: boolean) => void;
  setPanelOpen: Dispatch<SetStateAction<boolean>>;
};

export function usePresentation({
  map,
  slides,
  showExactly,
  setAll,
  setPanelOpen,
}: UsePresentationArgs) {
  // null = navegación libre (sin diapositiva activa).
  const [slideIndex, setSlideIndex] = useState<number | null>(null);

  const goTo = useCallback(
    (i: number) => {
      if (!map || slides.length === 0) return;
      const idx = Math.max(0, Math.min(slides.length - 1, i));
      const slide = slides[idx];
      setSlideIndex(idx);
      map.flyTo({
        center: slide.camera.center,
        zoom: slide.camera.zoom,
        pitch: slide.camera.pitch ?? 0,
        bearing: slide.camera.bearing ?? 0,
        duration: slide.camera.duration ?? 2500,
        essential: true,
      });
      if (slide.visibleLayers === "all") setAll(true);
      else if (slide.visibleLayers !== "keep") showExactly(slide.visibleLayers);
    },
    [map, slides, showExactly, setAll],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          goTo(slideIndex === null ? 0 : slideIndex + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goTo(slideIndex === null ? 0 : slideIndex - 1);
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(slides.length - 1);
          break;
        case "f":
        case "F":
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen();
          break;
        case "p":
        case "P":
          setPanelOpen((o) => !o);
          break;
        case "Escape":
          setSlideIndex(null);
          setPanelOpen(true);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, slideIndex, slides.length, setPanelOpen]);

  return { slideIndex, goTo, exit: () => setSlideIndex(null) };
}
