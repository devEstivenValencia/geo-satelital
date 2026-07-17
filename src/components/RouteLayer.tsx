import type { Feature, LineString } from "geojson";
import { MapGeoJSON, MapMarker, MarkerContent } from "@/components/ui/map";
import type { LayerDef } from "@/lib/layer-types";
import { lineMidpoint } from "@/lib/geo";

// Contorno oscuro bajo la línea de color, como en Google Earth.
// Si el orden de capas da problemas al cambiar de basemap, apagar aquí.
const ROUTE_CASING = true;

const ROUND: { "line-cap": "round"; "line-join": "round" } = {
  "line-cap": "round",
  "line-join": "round",
};

export function RouteLayer({ layer }: { layer: LayerDef }) {
  const segments = layer.data.features
    .filter((f): f is Feature<LineString> => f.geometry.type === "LineString")
    .map((f) => f.geometry.coordinates as [number, number][]);
  const midpoint = lineMidpoint(segments);

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
        }}
      />
      {midpoint && (
        <MapMarker longitude={midpoint.point[0]} latitude={midpoint.point[1]} anchor="center">
          <MarkerContent>
            <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: layer.color }}
              />
              {midpoint.totalKm.toFixed(1)} km
            </div>
          </MarkerContent>
        </MapMarker>
      )}
    </>
  );
}
