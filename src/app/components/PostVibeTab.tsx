import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PLACE_TYPE_INFO, VIBE_TAG_INFO, MOCK_PLACES } from '../data/mockData';
import { usePlaces } from '../context/PlacesContext';
import type { PlaceType, VibeTag, Vibe } from '../data/types';
import {
  fetchPlacePredictions,
  geocodeAddress,
  resolvePlaceById,
  type GeocodeHit,
  type PlacePrediction,
} from '../lib/maps';

const DEBOUNCE_MS = 400;

export function PostVibeTab() {
  const { submitReport } = usePlaces();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [selectedHit, setSelectedHit] = useState<GeocodeHit | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [category, setCategory] = useState<PlaceType | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [selectedTags, setSelectedTags] = useState<VibeTag[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mockMatches = searchQuery.trim()
    ? MOCK_PLACES.filter(
        (place) =>
          place.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (place.name && place.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSelectedHit(null);
    } else if (
      selectedHit &&
      searchQuery.trim() !== selectedHit.formattedAddress.trim()
    ) {
      setSelectedHit(null);
    }
  }, [searchQuery, selectedHit]);

  useEffect(() => {
    setGeocodeError(null);
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setPredictions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPlacesLoading(true);
      try {
        const list = await fetchPlacePredictions(searchQuery);
        setPredictions(list);
        setGeocodeError(null);
      } catch (e) {
        setPredictions([]);
        setGeocodeError(e instanceof Error ? e.message : 'Could not search places');
      } finally {
        setPlacesLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectPrediction = async (p: PlacePrediction) => {
    setShowResults(false);
    setGeocodeError(null);
    setPlacesLoading(true);
    try {
      const hit = await resolvePlaceById(p.placeId);
      setSelectedHit(hit);
      setSearchQuery(hit.formattedAddress || p.description);
      setPredictions([]);
    } catch (e) {
      setGeocodeError(e instanceof Error ? e.message : 'Could not load place');
    } finally {
      setPlacesLoading(false);
    }
  };

  const handleSelectMock = (label: string, place: (typeof MOCK_PLACES)[0]) => {
    setSelectedHit({ formattedAddress: `${place.name ? `${place.name}, ` : ''}${place.location}`, lat: place.lat, lng: place.lng });
    setSearchQuery(label);
    setShowResults(false);
  };

  const handleToggleTag = (tag: VibeTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resolveSubmitHit = useCallback(async (): Promise<GeocodeHit | null> => {
    if (selectedHit && searchQuery.trim() === selectedHit.formattedAddress.trim()) {
      return selectedHit;
    }
    try {
      const list = await fetchPlacePredictions(searchQuery);
      if (list.length > 0) {
        const hit = await resolvePlaceById(list[0].placeId);
        setSelectedHit(hit);
        return hit;
      }
      const hits = await geocodeAddress(searchQuery);
      const hit = hits[0];
      if (hit) setSelectedHit(hit);
      return hit ?? null;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not resolve place');
      return null;
    }
  }, [selectedHit, searchQuery]);

  const handleSubmit = async () => {
    if (!category || !vibe || selectedTags.length === 0) {
      toast.error('Pick category, vibe, and at least one tag.');
      return;
    }
    const hit = await resolveSubmitHit();
    if (!hit) return;
    try {
      await submitReport({
        formattedAddress: hit.formattedAddress,
        lat: hit.lat,
        lng: hit.lng,
        type: category,
        vibe,
        tags: selectedTags,
      });
      toast.success('Your vibe is saved — switch to Explore to see it on the map.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "We couldn't save your vibe. Please try again.");
      return;
    }
    setSearchQuery('');
    setSelectedHit(null);
    setPredictions([]);
    setCategory(null);
    setVibe(null);
    setSelectedTags([]);
  };

  const categories: PlaceType[] = [
    'apartment',
    'airbnb',
    'campus',
    'parking',
    'office',
    'cafe',
    'library',
    'transit',
    'street',
    'other',
  ];
  const vibeButtons: { vibe: Vibe; emoji: string; label: string }[] = [
    { vibe: 'unsafe', emoji: '😨', label: 'NOPE' },
    { vibe: 'sketchy', emoji: '😐', label: 'SKETCHY' },
    { vibe: 'safe', emoji: '😊', label: 'SOLID' },
  ];

  const availableTags: VibeTag[] =
    category === 'apartment'
      ? ['break-in', 'noise', 'harassment', 'scam', 'clean-safe']
      : category === 'airbnb'
        ? ['clean-safe', 'scam', 'theft', 'noise']
        : category === 'campus'
          ? ['clean-safe', 'harassment', 'poor-lighting', 'sketchy-people']
          : category === 'parking'
            ? ['break-in', 'theft', 'poor-lighting', 'clean-safe']
            : category === 'office'
              ? ['clean-safe', 'theft', 'harassment', 'noise', 'sketchy-people']
              : category === 'cafe'
                ? ['clean-safe', 'noise', 'theft', 'harassment', 'sketchy-people', 'scam']
              : category === 'transit'
                ? ['harassment', 'creepy-vibes', 'sketchy-people', 'poor-lighting', 'clean-safe']
                : category === 'library'
                  ? [
                      'clean-safe',
                      'harassment',
                      'noise',
                      'poor-lighting',
                      'theft',
                      'creepy-vibes',
                      'sketchy-people',
                    ]
                  : category === 'street'
                    ? [
                        'unsafe-night',
                        'poor-lighting',
                        'creepy-vibes',
                        'sketchy-people',
                        'harassment',
                        'clean-safe',
                      ]
                    : [
                        'unsafe-night',
                        'poor-lighting',
                        'creepy-vibes',
                        'clean-safe',
                        'sketchy-people',
                        'harassment',
                        'break-in',
                        'theft',
                        'noise',
                        'scam',
                      ];

  const listOpen =
    showResults &&
    searchQuery.trim().length > 0 &&
    (mockMatches.length > 0 || predictions.length > 0 || placesLoading);

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-foreground font-semibold text-2xl">Drop the tea on a spot ☕</h1>
        <p className="text-sm text-gray-600">
          Search by keywords — cafés, stations, neighborhoods, or street names. You don&apos;t need the full address.
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="Search place or address (keywords OK)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
          />

          {geocodeError && <p className="text-sm text-red-600 mt-2">{geocodeError}</p>}

          {listOpen && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setShowResults(false)} />
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden z-[9999] max-h-72 overflow-y-auto"
                style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
              >
                {placesLoading && (
                  <div className="px-4 py-3 text-sm text-gray-500">Searching places…</div>
                )}
                {mockMatches.map((place) => (
                  <button
                    key={`mock-${place.id}`}
                    onClick={() => handleSelectMock(place.name || place.location, place)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    <span className="font-medium text-gray-800">{place.name || place.location}</span>
                    <span className="block text-xs text-gray-500">Sample spot · tap to use</span>
                  </button>
                ))}
                {predictions.map((p) => (
                  <button
                    key={p.placeId}
                    type="button"
                    onClick={() => void handleSelectPrediction(p)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    <span className="font-medium text-gray-900 block">
                      {p.mainText ?? p.description.split(',')[0]}
                    </span>
                    {(p.secondaryText || p.description) && (
                      <span className="text-xs text-gray-500 block truncate">
                        {p.secondaryText ?? p.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <h2 className="text-foreground font-medium text-lg mb-4">Pick a category</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div
                  className={`w-20 h-20 rounded-full text-3xl flex items-center justify-center transition-all ${
                    category === cat ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white hover:bg-gray-50'
                  }`}
                  style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
                >
                  {PLACE_TYPE_INFO[cat].emoji}
                </div>
                <span className={`text-xs font-medium ${category === cat ? 'text-blue-600' : 'text-gray-600'}`}>
                  {PLACE_TYPE_INFO[cat].label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {category && (
          <div>
            <h2 className="text-foreground font-medium text-lg mb-4">The Vibe Check</h2>
            <div className="grid grid-cols-3 gap-3">
              {vibeButtons.map((v) => (
                <button
                  key={v.vibe}
                  onClick={() => setVibe(v.vibe)}
                  className={`py-6 rounded-xl font-medium text-base transition-all ${
                    vibe === v.vibe
                      ? v.vibe === 'unsafe'
                        ? 'bg-red-500 text-white ring-2 ring-red-600'
                        : v.vibe === 'sketchy'
                          ? 'bg-yellow-400 text-gray-900 ring-2 ring-yellow-500'
                          : 'bg-green-500 text-white ring-2 ring-green-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="text-3xl mb-1">{v.emoji}</div>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {vibe && (
          <div>
            <h2 className="text-foreground font-medium text-lg mb-4">Quick Tags</h2>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                    selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
                >
                  {VIBE_TAG_INFO[tag].emoji} {VIBE_TAG_INFO[tag].label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <button
            onClick={handleSubmit}
            disabled={!searchQuery.trim() || !category || !vibe || selectedTags.length === 0}
            className={`w-full py-4 rounded-xl font-medium text-lg transition-colors ${
              searchQuery.trim() && category && vibe && selectedTags.length > 0
                ? 'bg-[#4A90E2] text-white hover:bg-blue-600 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
          >
            Post the Vibe ✨
          </button>
        </div>
      </div>
    </div>
  );
}
