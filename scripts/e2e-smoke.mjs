// Smoke test e2e: verifica que el mapa satelital renderiza, que los toggles
// de capas funcionan y que la navegación por teclado del modo presentación
// mueve la cámara. Uso: node scripts/e2e-smoke.mjs [urlBase] [dirSalida]
//
// Nota de entorno: en este runner el Chromium headless no puede completar el
// handshake TLS contra el proxy de egreso, así que las peticiones de tiles
// externos se interceptan con context.route() y se resuelven desde Node
// (Playwright APIRequestContext), que sí atraviesa el proxy.
import { chromium, request } from "playwright";
import { globSync, mkdirSync, statSync } from "node:fs";

const BASE_URL = process.argv[2] ?? "http://127.0.0.1:5173";
const OUT_DIR = process.argv[3] ?? "e2e-screenshots";
mkdirSync(OUT_DIR, { recursive: true });

function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base) return undefined;
  return globSync(`${base}/chromium-*/chrome-linux/chrome`)[0];
}

async function launch() {
  const opts = {
    headless: true,
    // WebGL por software: sin esto el canvas puede quedar en blanco en headless.
    args: ["--no-sandbox", "--use-angle=swiftshader"],
  };
  try {
    return await chromium.launch(opts);
  } catch {
    return await chromium.launch({ ...opts, executablePath: findChromium() });
  }
}

const failures = [];
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(name);
};

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

// Túnel Node para los tiles: cache en memoria para no repetir descargas.
const nodeFetch = await request.newContext({
  ...(process.env.HTTPS_PROXY && { proxy: { server: process.env.HTTPS_PROXY } }),
  ignoreHTTPSErrors: true, // el proxy del entorno re-termina TLS
});
const tileCache = new Map();
await context.route(
  (url) => url.host !== new URL(BASE_URL).host,
  async (route) => {
    const url = route.request().url();
    try {
      let hit = tileCache.get(url);
      if (!hit) {
        const resp = await nodeFetch.get(url, { timeout: 30_000 });
        hit = { status: resp.status(), headers: resp.headers(), body: await resp.body() };
        tileCache.set(url, hit);
      }
      await route.fulfill(hit);
    } catch {
      await route.abort();
    }
  },
);

const page = await context.newPage();
page.on("pageerror", (err) => console.log("  [pageerror]", err.message));

await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

// Check A: el basemap satelital carga tiles y pinta el canvas.
await page.waitForFunction(
  () => window.__map?.loaded() && window.__map?.areTilesLoaded(),
  { timeout: 90_000 },
);
await page.waitForTimeout(1000);
const shotA = `${OUT_DIR}/a-satelite.png`;
await page.screenshot({ path: shotA });
const sizeA = statSync(shotA).size;
check("A: satélite renderiza", sizeA > 150_000, `screenshot ${Math.round(sizeA / 1024)}KB`);

// Check B: apagar el switch de una ruta elimina su capa de línea.
const routeSwitch = page.getByRole("switch").first();
if ((await routeSwitch.count()) === 0) {
  console.log("SKIP  B: aún no hay panel de capas");
} else {
  const countRouteLayers = () =>
    page.evaluate(
      () =>
        window.__map.getStyle().layers.filter((l) => l.id.includes("ruta")).length,
    );
  const before = await countRouteLayers();
  await routeSwitch.click();
  await page.waitForTimeout(500);
  const after = await countRouteLayers();
  await page.screenshot({ path: `${OUT_DIR}/b-toggle.png` });
  check("B: toggle oculta ruta", after < before, `capas de ruta ${before} → ${after}`);
  await routeSwitch.click(); // restaurar
  await page.waitForTimeout(300);
}

// Check C: la flecha derecha vuela la cámara al siguiente slide.
const hasSlides = await page.evaluate(() => (window.__slides?.length ?? 0) > 1);
if (!hasSlides) {
  console.log("SKIP  C: aún no hay modo presentación");
} else {
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  await page.waitForFunction(() => !window.__map.isMoving(), { timeout: 20_000 });
  const { ok, detail } = await page.evaluate(() => {
    const slide = window.__slides[1];
    const c = window.__map.getCenter();
    const dz = Math.abs(window.__map.getZoom() - slide.camera.zoom);
    const dc = Math.hypot(c.lng - slide.camera.center[0], c.lat - slide.camera.center[1]);
    return { ok: dc < 1e-3 && dz < 0.2, detail: `Δcentro=${dc.toFixed(5)} Δzoom=${dz.toFixed(2)}` };
  });
  await page.screenshot({ path: `${OUT_DIR}/c-slide.png` });
  check("C: teclado vuela cámara", ok, detail);
}

await nodeFetch.dispose();
await browser.close();
if (failures.length > 0) {
  console.error(`\n${failures.length} checks fallaron: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nTodos los checks pasaron.");
