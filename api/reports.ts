import { randomUUID } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

const KV_KEY = 'safemap:reports';

const PLACE_TYPES = new Set([
  'parking',
  'street',
  'apartment',
  'airbnb',
  'campus',
  'transit',
  'work',
  'other',
]);

const VIBES = new Set(['unsafe', 'sketchy', 'safe']);

export type StoredVibeReport = {
  id: string;
  lat: number;
  lng: number;
  category: string;
  vibe: string;
  tags: string[];
  /** ISO 8601 — used for recency filtering */
  recency: string;
  /** Optional display label (e.g. geocoded address) */
  label?: string;
};

function hasKvEnv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function parseRecencyWindow(param: string | undefined): number | null {
  if (!param || param === 'all') return null;
  const hours: Record<string, number> = { '24h': 24, '7d': 24 * 7, '30d': 24 * 30 };
  const h = hours[param];
  if (h === undefined) return null;
  return h * 60 * 60 * 1000;
}

function filterReports(
  list: StoredVibeReport[],
  category: string | undefined,
  maxAgeMs: number | null
): StoredVibeReport[] {
  let out = list;
  if (category && category !== 'all') {
    out = out.filter((r) => r.category === category);
  }
  if (maxAgeMs != null) {
    const cutoff = Date.now() - maxAgeMs;
    out = out.filter((r) => {
      const t = new Date(r.recency).getTime();
      return !Number.isNaN(t) && t >= cutoff;
    });
  }
  return out;
}

async function readAll(): Promise<StoredVibeReport[]> {
  if (!hasKvEnv()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN are not set');
  }
  const raw = await kv.get<StoredVibeReport[]>(KV_KEY);
  return Array.isArray(raw) ? raw : [];
}

async function writeAll(list: StoredVibeReport[]): Promise<void> {
  await kv.set(KV_KEY, list);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (!hasKvEnv()) {
    if (req.method === 'GET') {
      return res.status(200).json([]);
    }
    return res.status(503).json({
      error:
        'Vercel KV is not configured. Link a KV store and set KV_REST_API_URL and KV_REST_API_TOKEN (see Vercel project Storage).',
    });
  }

  try {
    if (req.method === 'GET') {
      const list = await readAll();
      const category =
        typeof req.query.category === 'string' ? req.query.category : undefined;
      const recency = typeof req.query.recency === 'string' ? req.query.recency : 'all';
      const maxAge = parseRecencyWindow(recency);
      const filtered = filterReports(list, category, maxAge);
      return res.status(200).json(filtered);
    }

    if (req.method === 'POST') {
      const body = req.body as Record<string, unknown> | undefined;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'JSON body required' });
      }

      const lat = Number(body.lat);
      const lng = Number(body.lng);
      const category = String(body.category ?? '');
      const vibe = String(body.vibe ?? '');
      const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t)) : [];
      const label = body.label != null ? String(body.label) : undefined;

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ error: 'Invalid lat/lng' });
      }
      if (!PLACE_TYPES.has(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      if (!VIBES.has(vibe)) {
        return res.status(400).json({ error: 'Invalid vibe' });
      }

      const report: StoredVibeReport = {
        id: randomUUID(),
        lat,
        lng,
        category,
        vibe,
        tags,
        recency: new Date().toISOString(),
        label,
      };

      const existing = await readAll();
      existing.push(report);
      await writeAll(existing);
      return res.status(201).json(report);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
