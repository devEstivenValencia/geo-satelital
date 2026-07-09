import { GROUPS, type LayerDef, type LayerFile } from "@/lib/layer-types";

// Autodescubrimiento de capas: cuando `generated/` (salida del conversor KMZ)
// tiene archivos, gana sobre los placeholders — el cambio a datos reales no
// requiere tocar código.
const generated = import.meta.glob<LayerFile>("./generated/**/*.json", {
  eager: true,
  import: "default",
});
const placeholder = import.meta.glob<LayerFile>("./placeholder/**/*.json", {
  eager: true,
  import: "default",
});

const files = Object.keys(generated).length > 0 ? generated : placeholder;

export const layers: LayerDef[] = Object.values(files)
  .filter((f) => f.metadata)
  .map((f) => ({ ...f.metadata, data: f }))
  .sort(
    (a, b) =>
      GROUPS[a.group].order - GROUPS[b.group].order || a.order - b.order,
  );
