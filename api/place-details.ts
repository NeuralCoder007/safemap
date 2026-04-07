import type { VercelRequest, VercelResponse } from '@vercel/node';

type DetailsResponse = {
  status: string;
  result?: {
    formatted_address?: string;
    geometry?: { location: { lat: number; lng: number } };
  };
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

  const placeId = typeof req.query.placeId === 'string' ? req.query.placeId.trim() : '';
  if (!placeId) {
    return res.status(400).json({ error: 'Missing placeId query parameter' });
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'formatted_address,geometry',
      key,
    });
    const upstream = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    );
    const data = (await upstream.json()) as DetailsResponse;

    if (data.status !== 'OK' || !data.result?.geometry?.location) {
      return res.status(400).json({
        error: data.error_message ?? data.status ?? 'Place details failed',
      });
    }

    const loc = data.result.geometry.location;
    return res.status(200).json({
      formattedAddress: data.result.formatted_address ?? '',
      lat: loc.lat,
      lng: loc.lng,
    });
  } catch {
    return res.status(500).json({ error: 'Place details request failed' });
  }
}
