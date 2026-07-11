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

// Diapositivas sobre los datos reales convertidos de MAPA.kmz. Los ids
// coinciden con los archivos en src/data/generated/ (ver npm run convert).
export const slides: Slide[] = [
  {
    id: "overview",
    titulo: "Oriente Antioqueño",
    camera: { center: [-75.42, 6.15], zoom: 11.2 },
    visibleLayers: "all",
  },
  {
    id: "aeropuerto",
    titulo: "Glorieta Aeropuerto",
    camera: { center: [-75.4361, 6.176], zoom: 13.6, pitch: 45, bearing: 25 },
    visibleLayers: [
      "pin-glorieta-aeropuerto",
      "pin-mall-indiana",
      "pin-santa-elena",
      "ruta-via-mall-indiana-glorieta-aeropuerto",
      "ruta-via-santa-elena-glorieta-aeropuerto",
    ],
  },
  {
    id: "llanogrande",
    titulo: "Corredor Llanogrande",
    camera: { center: [-75.43, 6.14], zoom: 13, pitch: 30 },
    visibleLayers: [
      "pin-llanogrande",
      "pin-guarne",
      "pin-la-ceja",
      "ruta-via-guarne-llanogrande",
      "ruta-via-la-ceja-llanogrande",
    ],
  },
  {
    id: "intercambio",
    titulo: "Intercambio Vial Roberto Hoyos Castaño",
    camera: { center: [-75.345, 6.173], zoom: 13.4 },
    visibleLayers: [
      "pin-intercambio-vial-roberto-hoyos-castano",
      "pin-belen",
      "pin-el-santuario",
      "ruta-via-belen-intercambio-vial-roberto-hoyos-castano",
      "ruta-via-el-santuario-intercambio-vial-roberto-hoyos-castano",
      "ruta-via-intercambio-vial-roberto-hoyos-castano-rionegro",
    ],
  },
  {
    id: "don-diego",
    titulo: "Don Diego",
    camera: { center: [-75.48, 6.09], zoom: 13.2 },
    visibleLayers: [
      "pin-don-diego",
      "pin-belen",
      "pin-la-ceja",
      "ruta-via-don-diego-belen",
      "ruta-via-la-ceja-don-diego",
    ],
  },
  {
    id: "cierre",
    titulo: "Panorama completo",
    camera: { center: [-75.42, 6.15], zoom: 11.2 },
    visibleLayers: "all",
  },
];
