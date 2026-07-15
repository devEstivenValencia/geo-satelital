import { MapGeoJSON } from "@/components/ui/map";
import type { LayerDef } from "@/lib/layer-types";

// Zona/área anotada a mano (ej. "Ampliación Aeropuerto"): relleno translúcido
// más contorno del color de la capa.
export function ZoneLayer({ layer }: { layer: LayerDef }) {
  return (
    <MapGeoJSON
      id={layer.id}
      data={layer.data}
      fillPaint={{ "fill-color": layer.color, "fill-opacity": 0.28 }}
      linePaint={{ "line-color": layer.color, "line-width": 2.5, "line-opacity": 0.9 }}
    />
  );
}
