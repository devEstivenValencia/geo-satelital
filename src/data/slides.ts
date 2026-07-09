export interface SlideCamera {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
  /** Duración del vuelo en ms (default 2500). */
  duration?: number;
}

export interface Slide {
  id: string;
  titulo: string;
  camera: SlideCamera;
  /**
   * Capas visibles al entrar a la diapositiva:
   * lista de ids, "keep" (no tocar los toggles) o "all" (todas).
   */
  visibleLayers: string[] | "keep" | "all";
}

// Diapositivas de ejemplo sobre los datos placeholder; ajustar cuando
// entren los datos reales del KMZ.
export const slides: Slide[] = [
  {
    id: "overview",
    titulo: "Oriente Antioqueño",
    camera: { center: [-75.42, 6.13], zoom: 11.2 },
    visibleLayers: "all",
  },
  {
    id: "aeropuerto",
    titulo: "Aeropuerto JMC y Glorieta",
    camera: { center: [-75.4266, 6.1697], zoom: 13.4, pitch: 45, bearing: 25 },
    visibleLayers: ["ruta-cyan", "pin-glorieta-aeropuerto", "notas-lugares"],
  },
  {
    id: "llanogrande",
    titulo: "Corredor Llanogrande",
    camera: { center: [-75.44, 6.125], zoom: 13.2, pitch: 30 },
    visibleLayers: [
      "ruta-cyan",
      "pin-llanogrande",
      "pin-don-diego",
      "pin-mall-indiana",
      "notas-lugares",
    ],
  },
  {
    id: "rionegro",
    titulo: "Rionegro",
    camera: { center: [-75.377, 6.153], zoom: 13.3 },
    visibleLayers: ["ruta-verde", "notas-lugares"],
  },
  {
    id: "marinilla-santuario",
    titulo: "Marinilla y El Santuario",
    camera: { center: [-75.3, 6.15], zoom: 12.2 },
    visibleLayers: [
      "ruta-amarilla",
      "pin-belen",
      "pin-intercambio-roberto-hoyos",
      "notas-lugares",
    ],
  },
  {
    id: "cierre",
    titulo: "Panorama completo",
    camera: { center: [-75.42, 6.13], zoom: 11.2 },
    visibleLayers: "all",
  },
];
