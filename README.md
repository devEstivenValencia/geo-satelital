# Mapa Oriente Antioqueño

Mapa web interactivo estilo Google Earth para presentaciones en vivo: imagen
satelital, vías de colores, pines y notas flotantes, con la posibilidad de
**prender y apagar cada capa** durante la presentación.

Construido con Vite + React + TypeScript + Tailwind + [shadcn/ui](https://ui.shadcn.com) +
[mapcn](https://mapcn.dev) (MapLibre GL JS). El basemap satelital es
Esri World Imagery (atribución obligatoria, visible en el mapa).

## Arrancar

```bash
npm install
npm run dev
```

## Uso durante una presentación

| Tecla | Acción |
| --- | --- |
| `→` / `AvPág` | Siguiente diapositiva (vuelo de cámara + capas de la diapositiva) |
| `←` / `RePág` | Diapositiva anterior |
| `Inicio` / `Fin` | Primera / última diapositiva |
| `F` | Pantalla completa |
| `P` | Mostrar/ocultar el panel de capas |
| `Esc` | Salir del modo diapositivas (navegación libre) |

El **panel de capas** (arriba a la izquierda) prende y apaga cada vía, pin o
nota individualmente, o grupos completos con el checkbox del grupo. El selector
inferior izquierdo cambia entre **Satélite / Híbrido / Calles**.

Las diapositivas se definen en `src/data/slides.ts`: cámara
(`center/zoom/pitch/bearing`) y qué capas quedan visibles (`"all"`, `"keep"` o
lista de ids).

## Importar tu mapa de Google Earth (KMZ/KML)

1. En Google Earth: clic derecho sobre la carpeta de tu proyecto →
   **Guardar lugar como…** → formato `.kmz` o `.kml`.
2. Convertir:

   ```bash
   npm run convert -- ~/ruta/a/mi-mapa.kmz            # escribe src/data/generated/
   npm run convert -- ~/ruta/a/mi-mapa.kmz --dry-run  # solo muestra el mapeo
   ```

3. Listo: cuando `src/data/generated/` tiene datos, la app los usa en lugar de
   los placeholders de `src/data/placeholder/` (para volver atrás, borra el
   contenido de `generated/`).

El conversor conserva colores y anchos de línea (resuelve `StyleMap` y el
formato de color `aabbggrr` de KML), agrupa las carpetas de Google Earth en los
grupos Vías/Pines/Notas, y separa cada vía nombrada y cada pin en su propia
capa para poder togglearlos individualmente. Los puntos con icono oculto
(`icon-scale: 0`) se tratan como notas de texto.

## Basemaps

- **Satélite** (default): Esri World Imagery, endpoint raster clásico sin API key.
- **Híbrido**: satélite + nombres/límites. Sin key usa el overlay raster clásico
  de Esri; con una API key gratuita de
  [ArcGIS Location Platform](https://location.arcgis.com/) (2M tiles/mes gratis)
  usa el servicio soportado de Basemap Styles v2 con etiquetas vectoriales —
  copia `.env.example` a `.env` y pon la key en `VITE_ARCGIS_API_KEY`.
- **Calles**: Carto Positron.

## Verificación

```bash
npm run build   # type-check + build
npm run dev &   # dev server
npm run e2e     # smoke test Playwright: satélite renderiza, toggles, teclado
```

Nota: en entornos con proxy de egreso, el smoke test tuneliza los tiles por
Node (`context.route`) porque el Chromium headless no atraviesa el proxy TLS.
