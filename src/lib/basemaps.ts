import type { StyleSpecification } from "maplibre-gl";

// Los estilos deben ser constantes de módulo: el componente Map de mapcn
// compara por referencia y un objeto nuevo en cada render dispara setStyle.

export type BasemapId = "satelite" | "hibrido" | "calles";

const ESRI_ATTRIBUTION =
  "Esri, Maxar, Earthstar Geographics, and the GIS User Community";

// Esri World Imagery — orden de tiles {z}/{y}/{x} (no {x}/{y}).
const ESRI_IMAGERY_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

// Overlay de referencia (límites y nombres de lugares) para el modo híbrido sin API key.
const ESRI_REFERENCE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const sateliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    "esri-imagery": {
      type: "raster",
      tiles: [ESRI_IMAGERY_TILES],
      tileSize: 256,
      maxzoom: 19,
      attribution: ESRI_ATTRIBUTION,
    },
  },
  layers: [{ id: "esri-imagery", type: "raster", source: "esri-imagery" }],
};

const hibridoKeylessStyle: StyleSpecification = {
  version: 8,
  sources: {
    "esri-imagery": {
      type: "raster",
      tiles: [ESRI_IMAGERY_TILES],
      tileSize: 256,
      maxzoom: 19,
      attribution: ESRI_ATTRIBUTION,
    },
    "esri-reference": {
      type: "raster",
      tiles: [ESRI_REFERENCE_TILES],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    { id: "esri-imagery", type: "raster", source: "esri-imagery" },
    { id: "esri-reference", type: "raster", source: "esri-reference" },
  ],
};

// Con una API key gratuita de ArcGIS Location Platform (VITE_ARCGIS_API_KEY en .env)
// el híbrido usa el servicio soportado de Basemap Styles v2 (imagen + etiquetas vectoriales).
const arcgisKey = import.meta.env.VITE_ARCGIS_API_KEY as string | undefined;

const hibridoStyle: string | StyleSpecification = arcgisKey
  ? `https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/imagery?token=${arcgisKey}`
  : hibridoKeylessStyle;

const callesStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const BASEMAPS: Record<
  BasemapId,
  { label: string; style: string | StyleSpecification }
> = {
  satelite: { label: "Satélite", style: sateliteStyle },
  hibrido: { label: "Híbrido", style: hibridoStyle },
  calles: { label: "Calles", style: callesStyle },
};

// Cámara inicial: Oriente Antioqueño (Rionegro / La Ceja / Guarne / aeropuerto JMC).
export const INITIAL_CENTER: [number, number] = [-75.42, 6.13];
export const INITIAL_ZOOM = 11.2;
