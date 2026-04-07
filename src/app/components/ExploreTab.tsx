import { useEffect, useRef, useState } from 'react';
import { MapView } from './MapView';
import { BentoBottomSheet } from './BentoBottomSheet';
import { usePlaces } from '../context/PlacesContext';
import { PLACE_TYPE_INFO } from '../data/mockData';
import {
  fetchPlacePredictions,
  resolvePlaceById,
  type PlacePrediction,
} from '../lib/maps';

const SEARCH_DEBOUNCE_MS = 400;

export function ExploreTab() {
  const { places, loading, loadError } = usePlaces();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [googlePredictions, setGooglePredictions] = useState<PlacePrediction[]>([]);
  const [placesSearchLoading, setPlacesSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    setSearchError(null);
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setGooglePredictions([]);
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setPlacesSearchLoading(true);
      try {
        const list = await fetchPlacePredictions(searchQuery);
        setGooglePredictions(list);
        setSearchError(null);
      } catch (e) {
        setGooglePredictions([]);
        setSearchError(e instanceof Error ? e.message : 'Search failed');
      } finally {
        setPlacesSearchLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectSearchResult = (placeId: string, lat: number, lng: number) => {
    setSelectedReportId(placeId);
    setMapCenter({ lat, lng });
    setShowSearchResults(false);
    setSearchQuery('');
    setGooglePredictions([]);
  };

  const handleSelectGooglePlace = async (p: PlacePrediction) => {
    setShowSearchResults(false);
    setPlacesSearchLoading(true);
    setSearchError(null);
    try {
      const hit = await resolvePlaceById(p.placeId);
      setMapCenter({ lat: hit.lat, lng: hit.lng });
      setSearchQuery(hit.formattedAddress || p.description);
      setGooglePredictions([]);
      setSelectedReportId(null);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Could not open place');
    } finally {
      setPlacesSearchLoading(false);
    }
  };

  const listHasContent =
    searchResults.length > 0 ||
    googlePredictions.length > 0 ||
    placesSearchLoading ||
    Boolean(searchError);

  return (
    <div className="h-full relative flex flex-col">
      <div className="relative z-[1000] p-3 pb-1 bg-background">
        <div className="flex items-start gap-2">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
            <input
              type="text"
              placeholder="Search map or type a place (keywords)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
            />
          {searchError && (
            <p className="text-xs text-red-600 mt-1 px-1">{searchError}</p>
          )}
          {showSearchResults && searchQuery.trim() && listHasContent && (
            <>
              <div className="fixed inset-0 z-[9997]" onClick={() => setShowSearchResults(false)} />
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-[9998] max-h-80 overflow-y-auto"
                style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
              >
                {placesSearchLoading && (
                  <div className="px-4 py-2 text-xs text-gray-500">Searching places…</div>
                )}
                {searchResults.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50">
                    On this map
                  </div>
                )}
                {searchResults.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelectSearchResult(place.id, place.lat, place.lng)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
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
                {googlePredictions.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-t border-gray-100">
                    Places (Google)
                  </div>
                )}
                {googlePredictions.map((p) => (
                  <button
                    key={p.placeId}
                    type="button"
                    onClick={() => void handleSelectGooglePlace(p)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium text-gray-900 text-sm block">
                      {p.mainText ?? p.description.split(',')[0]}
                    </span>
                    <span className="text-xs text-gray-500 block truncate">
                      {p.secondaryText ?? p.description}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          </div>
          {loading && (
            <span className="text-xs text-gray-400 whitespace-nowrap pt-2.5 shrink-0">Loading…</span>
          )}
        </div>
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
