// Conversor KMZ/KML → GeoJSON por capas para src/data/generated/.
//
// Uso:
//   npm run convert -- ~/mi-mapa.kmz            # escribe src/data/generated/
//   npm run convert -- ~/mi-mapa.kmz --dry-run  # solo muestra la tabla de mapeo
//   npm run convert -- doc.kml --out otra/ruta
//
// Reglas de mapeo:
//   - Carpeta de primer nivel → grupo, según GROUP_MAP (o inferencia por geometría).
//   - Cada línea con nombre → una capa (segmentos con el mismo nombre se agrupan);
//     líneas sin nombre se agrupan por carpeta + color.
//   - Cada punto con icono visible → una capa de pin individual.
//   - Puntos sin icono (o con icon-scale 0) → capa de notas por carpeta.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import AdmZip from "adm-zip";
import { DOMParser } from "@xmldom/xmldom";
import { kmlWithFolders } from "@tmcw/togeojson";

// Carpeta de Google Earth (insensible a mayúsculas/acentos) → grupo de la app.
const GROUP_MAP = {
  vias: "vias",
  rutas: "vias",
  caminos: "vias",
  pines: "pines",
  marcadores: "pines",
  puntos: "pines",
  notas: "notas",
  etiquetas: "notas",
  textos: "notas",
};

const GROUP_LABEL = { vias: "Vías", pines: "Pines", notas: "Notas" };
const FALLBACK_ROUTE_COLORS = [
  "#00e5ff", "#4ade80", "#facc15", "#fb7185", "#a78bfa", "#fb923c",
  "#38bdf8", "#f472b6", "#a3e635", "#818cf8", "#f87171", "#2dd4bf", "#c084fc",
];

// Lugares nombrados en el pantallazo original (coords aproximadas), usados para
// auto-nombrar puntos/líneas cuando el KMZ llega como un único placemark con una
// GeometryCollection (sin carpetas ni nombres por punto — ver flattenGeometryCollection).
const GAZETTEER = [
  ["Intercambio Vial Roberto Hoyos Castaño", -75.345, 6.1726],
  ["Belén", -75.356, 6.19],
  ["Don Diego", -75.497, 6.088],
  ["El Santuario", -75.264, 6.137],
  ["Guarne", -75.443, 6.28],
  ["Llanogrande", -75.437, 6.108],
  ["Marinilla", -75.336, 6.174],
  ["Mall Indiana", -75.53, 6.16],
  ["Glorieta Aeropuerto", -75.4266, 6.1697],
  ["La Ceja", -75.431, 6.028],
  ["Rionegro", -75.377, 6.153],
  ["El Carmen de Viboral", -75.333, 6.085],
  ["Santa Elena", -75.497, 6.211],
];
const GAZETTEER_MAX_KM = 3.5;

// ── CLI ──
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const outFlag = args.indexOf("--out");
const outDir = outFlag !== -1 ? args[outFlag + 1] : "src/data/generated";
const input = args.find((a) => !a.startsWith("--") && a !== outDir);
if (!input) {
  console.error("Uso: node scripts/kml-to-geojson.mjs <archivo.kmz|.kml> [--out dir] [--dry-run]");
  process.exit(1);
}

// ── Leer KML (desempaquetar KMZ si aplica) ──
const raw = readFileSync(input);
let kmlText;
if (raw.subarray(0, 2).toString() === "PK") {
  const zip = new AdmZip(raw);
  const entry =
    zip.getEntry("doc.kml") ??
    zip.getEntries().find((e) => e.entryName.toLowerCase().endsWith(".kml"));
  if (!entry) {
    console.error("El KMZ no contiene ningún .kml");
    process.exit(1);
  }
  kmlText = zip.readAsText(entry);
} else {
  kmlText = raw.toString("utf-8");
}

const dom = new DOMParser().parseFromString(kmlText, "text/xml");
const tree = kmlWithFolders(dom);

// ── Utilidades ──
const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "capa";

const normKey = (s) => slug(s).replace(/-/g, "");

// KML codifica color como aabbggrr; togeojson ya lo normaliza a #rrggbb en
// `stroke`, pero dejamos el fallback por si llega un valor crudo.
function kmlColorToHex(c) {
  if (!c) return null;
  if (c.startsWith("#")) return c.slice(0, 7);
  if (/^[0-9a-fA-F]{8}$/.test(c)) {
    return "#" + c.slice(6, 8) + c.slice(4, 6) + c.slice(2, 4);
  }
  return null;
}

function stripAltitude(coords) {
  if (typeof coords[0] === "number") {
    return [Math.round(coords[0] * 1e6) / 1e6, Math.round(coords[1] * 1e6) / 1e6];
  }
  return coords.map(stripAltitude);
}

function isLine(f) {
  return ["LineString", "MultiLineString"].includes(f.geometry?.type);
}
function isPoint(f) {
  return ["Point", "MultiPoint"].includes(f.geometry?.type);
}
function isNota(f) {
  const p = f.properties ?? {};
  return isPoint(f) && (!p.icon || p["icon-scale"] === 0);
}

function inferGroup(f) {
  if (isLine(f)) return "vias";
  if (isNota(f)) return "notas";
  if (isPoint(f)) return "pines";
  return "vias"; // polígonos u otros: se dibujan como contorno en vías
}

function kmBetween([lng1, lat1], [lng2, lat2]) {
  return Math.hypot(lng1 - lng2, lat1 - lat2) * 111;
}

function nearestGazetteerName(coord) {
  let best = null;
  let bestKm = Infinity;
  for (const [name, lng, lat] of GAZETTEER) {
    const km = kmBetween(coord, [lng, lat]);
    if (km < bestKm) {
      bestKm = km;
      best = name;
    }
  }
  return bestKm <= GAZETTEER_MAX_KM ? best : null;
}

// Asignación greedy sin repetición: se procesan los pares (punto, nombre) del
// más cercano al más lejano, así un punto lejano no le "roba" el nombre a uno
// más cercano que compita por el mismo lugar.
function assignGazetteerNames(coords) {
  const pairs = [];
  coords.forEach((coord, i) => {
    for (const [name, lng, lat] of GAZETTEER) {
      const km = kmBetween(coord, [lng, lat]);
      if (km <= GAZETTEER_MAX_KM) pairs.push({ i, name, km });
    }
  });
  pairs.sort((a, b) => a.km - b.km);
  const nameForIdx = new Map();
  const usedNames = new Set();
  for (const { i, name } of pairs) {
    if (nameForIdx.has(i) || usedNames.has(name)) continue;
    nameForIdx.set(i, name);
    usedNames.add(name);
  }
  return nameForIdx;
}

// Placemark único con una GeometryCollection (Google Earth "Guardar lugar como"
// sobre una sola Place, sin carpetas): se aplana cada Point/LineString en su
// propia capa, con nombre auto-asignado por cercanía al gazetteer y color
// rotado (los colores originales no se conservan en este tipo de export).
function flattenGeometryCollection(item) {
  const { feature, folders } = item;
  const geoms = feature.geometry.geometries ?? [];

  const pointGeomIdxs = [];
  const pointCoords = [];
  geoms.forEach((g, i) => {
    if (g.type === "Point") {
      pointGeomIdxs.push(i);
      pointCoords.push(g.coordinates);
    }
  });
  const nameByPointOrder = assignGazetteerNames(pointCoords);
  const nameByGeomIdx = new Map();
  pointGeomIdxs.forEach((geomIdx, order) => {
    if (nameByPointOrder.has(order)) nameByGeomIdx.set(geomIdx, nameByPointOrder.get(order));
  });

  let unnamedCount = 0;
  let routeIdx = 0;
  const usedRouteNames = new Map();
  const uniqueRouteName = (name) => {
    const count = (usedRouteNames.get(name) ?? 0) + 1;
    usedRouteNames.set(name, count);
    return count === 1 ? name : `${name} (${count})`;
  };

  const out = [];
  for (const [i, g] of geoms.entries()) {
    if (g.type === "Point") {
      const name = nameByGeomIdx.get(i) ?? `Punto sin nombre ${++unnamedCount}`;
      out.push({
        feature: { type: "Feature", properties: { name }, geometry: g },
        folders,
        group: "pines",
      });
    } else if (g.type === "LineString" || g.type === "MultiLineString") {
      const coords = g.type === "LineString" ? g.coordinates : g.coordinates[0];
      const start = nearestGazetteerName(coords[0]);
      const end = nearestGazetteerName(coords[coords.length - 1]);
      routeIdx++;
      const color = FALLBACK_ROUTE_COLORS[(routeIdx - 1) % FALLBACK_ROUTE_COLORS.length];
      let name;
      if (start && end && start !== end) name = `Vía ${start} – ${end}`;
      else if (start || end) name = `Vía cerca de ${start ?? end}`;
      else name = `Ruta ${routeIdx}`;
      name = uniqueRouteName(name);
      out.push({
        feature: { type: "Feature", properties: { name, stroke: color }, geometry: g },
        folders,
        group: "vias",
      });
    }
    // otros tipos de geometría dentro de la colección (Polygon, etc.) se ignoran.
  }
  return out;
}

// ── Recorrer el árbol de carpetas acumulando features con contexto ──
const collected = []; // { feature, folders: [nombres...], group }
function walk(node, folders) {
  if (node.type === "folder") {
    const name = node.meta?.name ?? "";
    for (const child of node.children ?? []) walk(child, [...folders, name]);
    return;
  }
  if (node.type === "root") {
    for (const child of node.children ?? []) walk(child, folders);
    return;
  }
  // Feature
  const top = folders.find((f) => GROUP_MAP[normKey(f)]);
  const group = top ? GROUP_MAP[normKey(top)] : inferGroup(node);
  collected.push({ feature: node, folders, group });
}
walk(tree, []);

// Expandir cualquier GeometryCollection en capas individuales (ver flattenGeometryCollection).
const expanded = collected.flatMap((item) =>
  item.feature.geometry?.type === "GeometryCollection"
    ? flattenGeometryCollection(item)
    : [item],
);
collected.length = 0;
collected.push(...expanded);

if (collected.length === 0) {
  console.error("El archivo no contiene placemarks convertibles.");
  process.exit(1);
}

// ── Agrupar features en capas ──
const layerMap = new Map(); // key → { meta-parcial, features }
let routeColorIdx = 0;

function upsert(key, init, feature) {
  let entry = layerMap.get(key);
  if (!entry) {
    entry = { ...init, features: [] };
    layerMap.set(key, entry);
  }
  entry.features.push(feature);
  return entry;
}

for (const { feature, folders, group } of collected) {
  const p = feature.properties ?? {};
  const name = (p.name ?? "").trim();
  const folderName = folders[folders.length - 1] ?? "";
  const geometry = { ...feature.geometry, coordinates: stripAltitude(feature.geometry.coordinates) };

  if (group === "vias" || isLine(feature)) {
    const color =
      kmlColorToHex(p.stroke) ??
      FALLBACK_ROUTE_COLORS[routeColorIdx++ % FALLBACK_ROUTE_COLORS.length];
    const layerName = name || (folderName ? `${folderName} (${color})` : `Ruta ${color}`);
    const key = `vias/${slug(name || folderName + "-" + color)}`;
    const entry = upsert(
      key,
      { group: "vias", kind: "route", name: layerName, color },
      { type: "Feature", properties: { name }, geometry },
    );
    if (kmlColorToHex(p.stroke)) entry.color = kmlColorToHex(p.stroke);
  } else if (group !== "pines" && (group === "notas" || isNota(feature))) {
    const key = `notas/${slug(folderName || "notas")}`;
    upsert(
      key,
      {
        group: "notas",
        kind: "label",
        name:
          folderName && normKey(folderName) !== "notas"
            ? `Notas: ${folderName}`
            : "Notas",
        color: "#ffffff",
      },
      { type: "Feature", properties: { text: name }, geometry },
    );
  } else {
    // Pin individual: una capa por placemark para poder togglearlo solo.
    const pinName = name || `Pin ${layerMap.size + 1}`;
    const key = `pines/${slug(pinName)}`;
    upsert(
      key,
      { group: "pines", kind: "pin", name: pinName, color: "#ffd400" },
      { type: "Feature", properties: { name: pinName }, geometry },
    );
  }
}

// ── Emitir ──
const orderByGroup = { vias: 0, pines: 0, notas: 0 };
const rows = [];
const outputs = [];
for (const [key, entry] of layerMap) {
  const [group, s] = key.split("/");
  const id = group === "pines" ? `pin-${s}` : group === "vias" ? `ruta-${s}` : `nota-${s}`;
  const order = ++orderByGroup[group];
  const file = join(outDir, group, `${s}.json`);
  outputs.push({
    file,
    json: {
      type: "FeatureCollection",
      metadata: {
        id,
        name: entry.name,
        group,
        kind: entry.kind,
        color: entry.color,
        defaultVisible: true,
        order,
      },
      features: entry.features,
    },
  });
  rows.push({
    archivo: file.replace(`${outDir}/`, ""),
    grupo: GROUP_LABEL[group],
    nombre: entry.name,
    color: entry.color,
    features: entry.features.length,
  });
}

console.log(`\nEntrada: ${basename(input)} — ${collected.length} placemarks → ${outputs.length} capas\n`);
console.table(rows);

if (dryRun) {
  console.log("(--dry-run: no se escribió nada)");
} else {
  for (const { file, json } of outputs) {
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, JSON.stringify(json, null, 1));
  }
  console.log(`Escrito en ${outDir}/ — la app usará estos datos en lugar de los placeholders.`);
  console.log("Para volver a los placeholders: borra el contenido de ese directorio.");
}
