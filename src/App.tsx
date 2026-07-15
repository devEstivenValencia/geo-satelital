import { useEffect, useState } from "react";
import { MapView } from "@/components/MapView";
import { RouteLayer } from "@/components/RouteLayer";
import { PinMarker } from "@/components/PinMarker";
import { NotaLabel } from "@/components/NotaLabel";
import { ZoneLayer } from "@/components/ZoneLayer";
import { BasemapSwitcher } from "@/components/BasemapSwitcher";
import { LayerPanel } from "@/components/LayerPanel";
import { SlideHud } from "@/components/SlideHud";
import { useLayerVisibility } from "@/hooks/useLayerVisibility";
import { usePresentation } from "@/hooks/usePresentation";
import { layers } from "@/data/registry";
import { slides } from "@/data/slides";
import type { MapRef } from "@/components/ui/map";
import type { BasemapId } from "@/lib/basemaps";
import type { LayerDef } from "@/lib/layer-types";

declare global {
  interface Window {
    __slides?: typeof slides;
  }
}

function LayerRenderer({ layer }: { layer: LayerDef }) {
  switch (layer.kind) {
    case "route":
      return <RouteLayer layer={layer} />;
    case "pin":
      return <PinMarker layer={layer} />;
    case "label":
      return <NotaLabel layer={layer} />;
    case "zone":
      return <ZoneLayer layer={layer} />;
  }
}

export default function App() {
  const [basemap, setBasemap] = useState<BasemapId>("satelite");
  const [panelOpen, setPanelOpen] = useState(true);
  const [map, setMap] = useState<MapRef | null>(null);
  const { visible, toggle, setGroup, setAll, showExactly } =
    useLayerVisibility(layers);
  const { slideIndex } = usePresentation({
    map,
    slides,
    showExactly,
    setAll,
    setPanelOpen,
  });

  useEffect(() => {
    window.__slides = slides;
  }, []);

  return (
    <div className="relative h-dvh w-full">
      <MapView basemap={basemap} onMapReady={setMap}>
        {layers.map(
          (layer) =>
            visible[layer.id] && <LayerRenderer key={layer.id} layer={layer} />,
        )}
      </MapView>
      <LayerPanel
        layers={layers}
        visible={visible}
        onToggle={toggle}
        onSetGroup={setGroup}
        onSetAll={setAll}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
      <BasemapSwitcher value={basemap} onChange={setBasemap} />
      <SlideHud slides={slides} slideIndex={slideIndex} />
    </div>
  );
}
