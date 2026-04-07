import type { VibeReport } from '../data/vibeReport';
import type { PlaceType, Vibe, VibeTag } from '../data/types';

export type ListFilters = {
  category?: string;
  recency?: string;
};

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
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<VibeReport[]>;
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
    throw new Error(msg);
  }
  return res.json() as Promise<VibeReport>;
}
