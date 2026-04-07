import type { VibeReport } from '../data/vibeReport';
import type { PlaceType, Vibe, VibeTag } from '../data/types';
import { friendlyLoadError, friendlySaveError } from './userFacing';

export type ListFilters = {
  category?: string;
  recency?: string;
};

function normalizeCategory(category: string): PlaceType {
  if (category === 'work') return 'office';
  return category as PlaceType;
}

export async function fetchReports(filters: ListFilters): Promise<VibeReport[]> {
  const qs = new URLSearchParams();
  if (filters.category && filters.category !== 'all') {
    qs.set('category', filters.category);
  }
  if (filters.recency && filters.recency !== 'all') {
    qs.set('recency', filters.recency);
  }
  const res = await fetch(`/api/reports?${qs.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(friendlyLoadError(text || res.statusText));
  }
  const rows = (await res.json()) as VibeReport[];
  return rows.map((r) => ({
    ...r,
    category: normalizeCategory(r.category as unknown as string),
  }));
}

export type CreateReportBody = {
  lat: number;
  lng: number;
  category: PlaceType;
  vibe: Vibe;
  tags: VibeTag[];
  label?: string;
};

export async function createReport(body: CreateReportBody): Promise<VibeReport> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* use statusText */
    }
    throw new Error(friendlySaveError(msg));
  }
  const r = (await res.json()) as VibeReport;
  return {
    ...r,
    category: normalizeCategory(r.category as unknown as string),
  };
}
