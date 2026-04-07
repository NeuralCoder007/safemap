/** Maps raw errors to non-technical copy for people using the app. */
export function friendlySaveError(raw: string): string {
  const m = raw.toLowerCase();
  if (
    m.includes('kv') ||
    m.includes('vercel') ||
    m.includes('redis') ||
    m.includes('map_api') ||
    m.includes('storage') ||
    m.includes('503')
  ) {
    return "We couldn't save your vibe just now. Please try again in a moment.";
  }
  if (m.includes('400') || m.includes('invalid')) {
    return "Something about that spot didn't work. Try choosing the place again.";
  }
  return "We couldn't save your vibe. Please try again.";
}

export function friendlyLoadError(_raw: string): string {
  return "We're having trouble loading the map. Check your connection and try again.";
}
