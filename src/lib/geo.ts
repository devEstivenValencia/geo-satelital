type LngLat = [number, number];

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineKm([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * Punto medio por distancia recorrida (no por índice de vértice) y longitud
 * total, a partir de uno o varios tramos de línea concatenados en orden.
 */
export function lineMidpoint(segments: LngLat[][]): { point: LngLat; totalKm: number } | null {
  const points = segments.flat();
  if (points.length < 2) return null;

  const stepKm = points.slice(1).map((p, i) => haversineKm(points[i], p));
  const totalKm = stepKm.reduce((sum, d) => sum + d, 0);

  const halfKm = totalKm / 2;
  let acc = 0;
  for (let i = 0; i < stepKm.length; i++) {
    if (acc + stepKm[i] >= halfKm) {
      const t = stepKm[i] === 0 ? 0 : (halfKm - acc) / stepKm[i];
      const [lng1, lat1] = points[i];
      const [lng2, lat2] = points[i + 1];
      return { point: [lng1 + (lng2 - lng1) * t, lat1 + (lat2 - lat1) * t], totalKm };
    }
    acc += stepKm[i];
  }

  return { point: points[points.length - 1], totalKm };
}
