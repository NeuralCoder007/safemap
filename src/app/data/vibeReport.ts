import type { Place, PlaceType, Vibe, VibeTag } from './types';
import { formatDistanceToNow } from 'date-fns';
import { normalizeReportTags } from './vibeTagUtils';

/** Mirrors `StoredVibeReport` returned by `GET /api/reports`. */
export type VibeReport = {
  id: string;
  lat: number;
  lng: number;
  category: PlaceType;
  vibe: Vibe;
  tags: VibeTag[];
  recency: string;
  label?: string;
};

export function reportToMapPlace(r: VibeReport): Place {
  const tags = normalizeReportTags(r.tags as unknown as string[]);
  const vibeScore = r.vibe === 'safe' ? 100 : r.vibe === 'sketchy' ? 50 : 0;
  let relative: string;
  try {
    relative = formatDistanceToNow(new Date(r.recency), { addSuffix: true });
  } catch {
    relative = r.recency;
  }
  return {
    id: r.id,
    name: r.label,
    location: r.label ?? `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`,
    lat: r.lat,
    lng: r.lng,
    type: r.category,
    vibe: r.vibe,
    vibeScore,
    topTags: tags,
    reportCount: 1,
    confidence: 'low',
    lastChecked: relative,
  };
}
