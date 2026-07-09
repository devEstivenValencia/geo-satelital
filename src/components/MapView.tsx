import { useCallback, type ReactNode } from "react";
import { Map, MapControls, type MapRef } from "@/components/ui/map";
import { BASEMAPS, INITIAL_CENTER, INITIAL_ZOOM, type BasemapId } from "@/lib/basemaps";

declare global {
  interface Window {
    __map?: MapRef;
  }
}

type MapViewProps = {
  basemap: BasemapId;
  children?: ReactNode;
  onMapReady?: (map: MapRef) => void;
};

export function MapView({ basemap, children, onMapReady }: MapViewProps) {
  const style = BASEMAPS[basemap].style;

  const handleRef = useCallback(
    (map: MapRef | null) => {
      if (!map) return;
      window.__map = map;
      onMapReady?.(map);
    },
    [onMapReady],
  );

  return (
    <Map
      ref={handleRef}
      theme="light"
      styles={{ light: style, dark: style }}
      center={INITIAL_CENTER}
      zoom={INITIAL_ZOOM}
      className="h-full w-full"
    >
      <MapControls position="bottom-right" showZoom showCompass showFullscreen />
      {children}
    </Map>
  );
}
