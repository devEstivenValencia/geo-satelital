import { useState } from "react";
import { MapView } from "@/components/MapView";
import { RouteLayer } from "@/components/RouteLayer";
import { PinMarker } from "@/components/PinMarker";
import { NotaLabel } from "@/components/NotaLabel";
import { BasemapSwitcher } from "@/components/BasemapSwitcher";
import { useLayerVisibility } from "@/hooks/useLayerVisibility";
import { layers } from "@/data/registry";
import type { BasemapId } from "@/lib/basemaps";
import type { LayerDef } from "@/lib/layer-types";

function LayerRenderer({ layer }: { layer: LayerDef }) {
  switch (layer.kind) {
    case "route":
      return <RouteLayer layer={layer} />;
    case "pin":
      return <PinMarker layer={layer} />;
    case "label":
      return <NotaLabel layer={layer} />;
  }
}

export default function App() {
  const [basemap, setBasemap] = useState<BasemapId>("satelite");
  const { visible } = useLayerVisibility(layers);

  return (
    <div className="relative h-dvh w-full">
      <MapView basemap={basemap}>
        {layers.map(
          (layer) =>
            visible[layer.id] && <LayerRenderer key={layer.id} layer={layer} />,
        )}
      </MapView>
      <BasemapSwitcher value={basemap} onChange={setBasemap} />
    </div>
  );
}
