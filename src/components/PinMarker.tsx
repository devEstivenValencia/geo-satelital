import { MapMarker, MarkerContent } from "@/components/ui/map";
import type { LayerDef } from "@/lib/layer-types";

function Pushpin({ color }: { color: string }) {
  return (
    <svg
      width="26"
      height="34"
      viewBox="0 0 26 34"
      className="drop-shadow-[1px_2px_2px_rgba(0,0,0,0.6)]"
    >
      <line x1="13" y1="15" x2="13" y2="33" stroke="#5b4a00" strokeWidth="2.5" />
      <circle cx="13" cy="10" r="8.5" fill={color} stroke="#6b5800" strokeWidth="1.5" />
      <circle cx="10" cy="7" r="2.6" fill="#fff6c0" opacity="0.85" />
    </svg>
  );
}

export function PinMarker({ layer }: { layer: LayerDef }) {
  return (
    <>
      {layer.data.features.map((f, i) => {
        if (f.geometry.type !== "Point") return null;
        const [lng, lat] = f.geometry.coordinates as [number, number];
        const name = (f.properties?.name as string) ?? layer.name;
        return (
          <MapMarker key={i} longitude={lng} latitude={lat} anchor="bottom">
            <MarkerContent>
              <div className="relative">
                <Pushpin color={layer.color} />
                <span className="ge-label absolute left-[26px] top-1 text-[13px]">
                  {name}
                </span>
              </div>
            </MarkerContent>
          </MapMarker>
        );
      })}
    </>
  );
}
