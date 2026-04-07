import type { VibeTag } from './types';

/** Current tag ids stored on new reports */
export const CANONICAL_VIBE_TAGS: readonly VibeTag[] = [
  'break-in',
  'theft',
  'harassment',
  'noise',
  'unsafe-night',
  'poor-lighting',
  'scam',
  'clean-safe',
  'suspicious-people',
];

const CANONICAL = new Set<string>(CANONICAL_VIBE_TAGS);

/** Older reports may still have these; map to one canonical tag */
export const LEGACY_VIBE_TAG_ALIASES: Record<string, VibeTag> = {
  'creepy-vibes': 'suspicious-people',
  'sketchy-people': 'suspicious-people',
};

export const VIBE_TAG_INFO: Record<VibeTag, { label: string; emoji: string }> = {
  'break-in': { label: 'Break-in', emoji: '🚪' },
  theft: { label: 'Theft', emoji: '👝' },
  harassment: { label: 'Harassment', emoji: '😰' },
  noise: { label: 'Noise', emoji: '🔊' },
  'unsafe-night': { label: 'Unsafe at Night', emoji: '🌙' },
  'poor-lighting': { label: 'Poor Lighting', emoji: '💡' },
  scam: { label: 'Scam', emoji: '🚨' },
  'clean-safe': { label: 'Safe & Clean', emoji: '✨' },
  'suspicious-people': { label: 'Suspicious People', emoji: '🤔' },
};

function humanizeUnknown(raw: string): string {
  return raw
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Resolve legacy / unknown strings to a canonical tag, or null if unrecognized */
export function normalizeVibeTag(raw: string): VibeTag | null {
  const t = raw.trim();
  if (LEGACY_VIBE_TAG_ALIASES[t]) return LEGACY_VIBE_TAG_ALIASES[t];
  if (CANONICAL.has(t)) return t as VibeTag;
  return null;
}

/** Dedupe after merging aliases (e.g. creepy-vibes + sketchy-people → one Suspicious People) */
export function normalizeReportTags(tags: string[]): VibeTag[] {
  const seen = new Set<VibeTag>();
  const out: VibeTag[] = [];
  for (const raw of tags) {
    const v = normalizeVibeTag(String(raw));
    if (v === null || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

/** Safe for UI: handles legacy keys and odd stored values */
export function getVibeTagInfo(raw: string): { label: string; emoji: string } {
  const v = normalizeVibeTag(raw);
  if (v != null) return VIBE_TAG_INFO[v];
  return { label: humanizeUnknown(raw), emoji: '📌' };
}
