import type { FeatureCollection } from "geojson";

export type GroupId = "vias" | "pines" | "notas" | "anotaciones";
export type LayerKind = "route" | "pin" | "label" | "zone";

export interface LayerMetadata {
  id: string;
  /** Nombre mostrado en el panel de capas. */
  name: string;
  group: GroupId;
  kind: LayerKind;
  /** Color de la línea, relleno o acento del pin (hex). */
  color: string;
  defaultVisible: boolean;
  /** Orden dentro del grupo. */
  order: number;
  /** Dibuja la línea punteada en vez de sólida (solo kind:"route"). */
  dashed?: boolean;
}

/** Archivo de datos: FeatureCollection con `metadata` como foreign member. */
export interface LayerFile extends FeatureCollection {
  metadata: LayerMetadata;
}

export interface LayerDef extends LayerMetadata {
  data: FeatureCollection;
}

export const GROUPS: Record<GroupId, { label: string; order: number }> = {
  vias: { label: "Vías", order: 1 },
  pines: { label: "Pines", order: 2 },
  notas: { label: "Notas", order: 3 },
  anotaciones: { label: "Anotaciones", order: 4 },
};
