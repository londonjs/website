const BBOX_LON_DELTA = 0.004;
const BBOX_LAT_DELTA = 0.0025;
const BBOX_PRECISION = 5;

export function buildOsmEmbedUrl(lat: number, lon: number): string {
  const minLon = (lon - BBOX_LON_DELTA).toFixed(BBOX_PRECISION);
  const minLat = (lat - BBOX_LAT_DELTA).toFixed(BBOX_PRECISION);
  const maxLon = (lon + BBOX_LON_DELTA).toFixed(BBOX_PRECISION);
  const maxLat = (lat + BBOX_LAT_DELTA).toFixed(BBOX_PRECISION);

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${lat},${lon}`;
}

export function buildOsmLink(lat: number, lon: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}

export function buildOsmSearchLink(query: string): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}
