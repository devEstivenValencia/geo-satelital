import { MapGeoJSON } from "@/components/ui/map";
import type { LayerDef } from "@/lib/layer-types";

// Contorno oscuro bajo la línea de color, como en Google Earth.
// Si el orden de capas da problemas al cambiar de basemap, apagar aquí.
const ROUTE_CASING = true;

const ROUND: { "line-cap": "round"; "line-join": "round" } = {
  "line-cap": "round",
  "line-join": "round",
};

export function RouteLayer({ layer }: { layer: LayerDef }) {
  return (
    <>
      {ROUTE_CASING && (
        <MapGeoJSON
          id={`${layer.id}-casing`}
          data={layer.data}
          fillPaint={false}
          lineLayout={ROUND}
          linePaint={{
            "line-color": "#0f172a",
            "line-width": 6.5,
            "line-opacity": 0.8,
          }}
        />
      )}
      <MapGeoJSON
        id={layer.id}
        data={layer.data}
        fillPaint={false}
        lineLayout={ROUND}
        linePaint={{
          "line-color": layer.color,
          "line-width": 3.5,
          "line-opacity": 0.95,
          ...(layer.dashed ? { "line-dasharray": [2, 1.6] } : {}),
        }}
      />
    </>
  );
}
