import { MapMarker, MarkerContent } from "@/components/ui/map";
import type { LayerDef } from "@/lib/layer-types";

export function NotaLabel({ layer }: { layer: LayerDef }) {
  return (
    <>
      {layer.data.features.map((f, i) => {
        if (f.geometry.type !== "Point") return null;
        const [lng, lat] = f.geometry.coordinates as [number, number];
        const text = (f.properties?.text as string) ?? "";
        return (
          <MapMarker key={i} longitude={lng} latitude={lat} anchor="center">
            <MarkerContent>
              <span className="ge-label text-[15px]">{text}</span>
            </MarkerContent>
          </MapMarker>
        );
      })}
    </>
  );
}
