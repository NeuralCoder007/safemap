import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.MAP_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'Missing MAP_API_KEY in environment variables' });
  }

  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const zoom = Number(req.query.zoom ?? 16);
  const width = Number(req.query.width ?? 400);
  const height = Number(req.query.height ?? 300);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'Invalid lat/lng' });
  }

  const size = `${Math.max(100, Math.min(640, Math.round(width)))}x${Math.max(100, Math.min(640, Math.round(height)))}`;
  const upstreamUrl =
    `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(lat)},${encodeURIComponent(
      lng
    )}` +
    `&zoom=${encodeURIComponent(zoom)}&size=${size}&maptype=roadmap&markers=color:red%7C${encodeURIComponent(
      lat
    )},${encodeURIComponent(lng)}&key=${encodeURIComponent(key)}`;

  try {
    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ error: 'Failed to fetch static map image' });
    }
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'image/png');
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buf);
  } catch {
    return res.status(500).json({ error: 'Static map request failed' });
  }
}
