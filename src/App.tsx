import { useState } from "react";
import { MapView } from "@/components/MapView";
import type { BasemapId } from "@/lib/basemaps";

export default function App() {
  const [basemap] = useState<BasemapId>("satelite");

  return (
    <div className="h-dvh w-full">
      <MapView basemap={basemap} />
    </div>
  );
}
