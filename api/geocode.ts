import type { VercelRequest, VercelResponse } from '@vercel/node';

type GeocodeResponse = {
  status: string;
  results?: Array<{
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
  }>;
  error_message?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.MAP_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'Missing MAP_API_KEY in environment variables' });
  }

  const address = typeof req.query.address === 'string' ? req.query.address.trim() : '';
  if (!address) {
    return res.status(400).json({ error: 'Missing address query parameter' });
  }

  try {
    const upstream = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(
        key
      )}`
    );
    const data = (await upstream.json()) as GeocodeResponse;
    if (data.status !== 'OK' || !data.results?.length) {
      return res.status(400).json({ error: data.error_message ?? data.status ?? 'Geocoding failed' });
    }
    return res.status(200).json(
      data.results.map((r) => ({
        formattedAddress: r.formatted_address,
        lat: r.geometry.location.lat,
        lng: r.geometry.location.lng,
      }))
    );
  } catch {
    return res.status(500).json({ error: 'Geocoding request failed' });
  }
}
