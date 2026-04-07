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

export async function geocodeAddress(address: string): Promise<GeocodeHit[]> {
  const url = `/api/geocode?address=${encodeURIComponent(address.trim())}`;
  const res = await fetch(url);
  if (!res.ok) {
    let msg = 'Geocoding failed';
    try {
      const payload = (await res.json()) as { error?: string };
      if (payload.error) msg = payload.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(msg);
  }
  return (await res.json()) as GeocodeHit[];
}
