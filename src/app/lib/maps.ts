export function getStaticMapUrl(
  lat: number,
  lng: number,
  zoom = 16,
  width = 400,
  height = 300
): string {
  return `/api/static-map?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&zoom=${encodeURIComponent(
    zoom
  )}&width=${encodeURIComponent(width)}&height=${encodeURIComponent(height)}`;
}

export type GeocodeHit = {
  formattedAddress: string;
  lat: number;
  lng: number;
};

/** Google Places Autocomplete suggestion (keyword / partial search). */
export type PlacePrediction = {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
};

async function readJsonError(res: Response): Promise<string> {
  let msg = res.statusText;
  try {
    const payload = (await res.json()) as { error?: string };
    if (payload.error) msg = payload.error;
  } catch {
    /* ignore */
  }
  return msg;
}

export async function fetchPlacePredictions(input: string): Promise<PlacePrediction[]> {
  const q = input.trim();
  if (q.length < 2) return [];
  const res = await fetch(`/api/places-autocomplete?input=${encodeURIComponent(q)}`);
  if (!res.ok) {
    throw new Error(await readJsonError(res));
  }
  return (await res.json()) as PlacePrediction[];
}

export async function resolvePlaceById(placeId: string): Promise<GeocodeHit> {
  const res = await fetch(`/api/place-details?placeId=${encodeURIComponent(placeId)}`);
  if (!res.ok) {
    throw new Error(await readJsonError(res));
  }
  return (await res.json()) as GeocodeHit;
}

/** Full-address geocode fallback (server-side). */
export async function geocodeAddress(address: string): Promise<GeocodeHit[]> {
  const url = `/api/geocode?address=${encodeURIComponent(address.trim())}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(await readJsonError(res));
  }
  return (await res.json()) as GeocodeHit[];
}
