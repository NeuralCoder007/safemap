import { useState } from 'react';
import { MapView } from './MapView';
import { BentoBottomSheet } from './BentoBottomSheet';
import { usePlaces } from '../context/PlacesContext';
import { PLACE_TYPE_INFO } from '../data/mockData';
import type { PlaceType } from '../data/types';

const RECENCY_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
] as const;

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All categories' },
  ...(Object.keys(PLACE_TYPE_INFO) as PlaceType[]).map((k) => ({
    value: k,
    label: `${PLACE_TYPE_INFO[k].emoji} ${PLACE_TYPE_INFO[k].label}`,
  })),
];

export function ExploreTab() {
  const { places, filters, setFilters, loading, loadError } = usePlaces();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const searchResults = searchQuery.trim()
    ? places
        .filter((place) => {
          const q = searchQuery.toLowerCase();
          const typeLabel = PLACE_TYPE_INFO[place.type].label.toLowerCase();
          return (
            place.location.toLowerCase().includes(q) ||
            (place.name && place.name.toLowerCase().includes(q)) ||
            typeLabel.includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const handleSelectSearchResult = (placeId: string, lat: number, lng: number) => {
    setSelectedReportId(placeId);
    setMapCenter({ lat, lng });
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <div className="h-full relative flex flex-col">
      <div className="relative z-[1000] p-3 pb-1 bg-background">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
          <input
            type="text"
            placeholder="Search specific places..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
          />
          {showSearchResults && searchResults.length > 0 && (
            <>
              <div className="fixed inset-0 z-[9997]" onClick={() => setShowSearchResults(false)} />
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-[9998]"
                style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
              >
                {searchResults.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleSelectSearchResult(place.id, place.lat, place.lng)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <span className="text-xl flex-shrink-0">{PLACE_TYPE_INFO[place.type].emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 text-sm">
                        {place.name || place.location}
                      </div>
                      <div className="text-xs text-gray-500">{PLACE_TYPE_INFO[place.type].label}</div>
                    </div>
                    {place.lastChecked && (
                      <div className="text-xs text-gray-500 flex-shrink-0">{place.lastChecked}</div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 bg-white/95 backdrop-blur border-b border-gray-200 px-3 py-2 flex flex-wrap gap-2 items-center z-[500]">
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <span className="whitespace-nowrap">Category</span>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white max-w-[140px]"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <span className="whitespace-nowrap">Recency</span>
          <select
            value={filters.recency}
            onChange={(e) => setFilters({ recency: e.target.value })}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
          >
            {RECENCY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {loading && <span className="text-xs text-gray-400 ml-auto">Loading…</span>}
      </div>
      {loadError && (
        <div className="flex-shrink-0 bg-amber-50 text-amber-900 text-xs px-3 py-2 border-b border-amber-200">
          {loadError} — use <code className="text-[10px]">vercel dev</code> locally or deploy with KV
          env vars.
        </div>
      )}
      <div className="flex-1 min-h-0 relative">
        <MapView places={places} onSelectPlace={setSelectedReportId} mapCenter={mapCenter} />
      </div>

      {selectedReportId && (
        <BentoBottomSheet reportId={selectedReportId} onClose={() => setSelectedReportId(null)} />
      )}
    </div>
  );
}
