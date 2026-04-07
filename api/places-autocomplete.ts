import type { VercelRequest, VercelResponse } from '@vercel/node';

type AutocompleteResponse = {
  status: string;
  predictions?: Array<{
    description: string;
    place_id: string;
    structured_formatting?: {
      main_text: string;
      secondary_text: string;
    };
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

  const input = typeof req.query.input === 'string' ? req.query.input.trim() : '';
  if (input.length < 2) {
    return res.status(200).json([]);
  }

  try {
    const params = new URLSearchParams({
      input,
      key,
    });
    const upstream = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    );
    const data = (await upstream.json()) as AutocompleteResponse;

    if (data.status === 'ZERO_RESULTS') {
      return res.status(200).json([]);
    }
    if (data.status !== 'OK' || !data.predictions?.length) {
      return res.status(400).json({
        error: data.error_message ?? data.status ?? 'Autocomplete failed',
      });
    }

    const out = data.predictions.slice(0, 8).map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text,
      secondaryText: p.structured_formatting?.secondary_text,
    }));
    return res.status(200).json(out);
  } catch {
    return res.status(500).json({ error: 'Autocomplete request failed' });
  }
}
