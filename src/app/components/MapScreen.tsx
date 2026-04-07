import { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MOCK_PLACES, PLACE_TYPE_INFO } from '../data/mockData';
import { PlaceType } from '../data/types';

interface MapScreenProps {
  onSelectPlace: (placeId: string) => void;
  onSelectPin?: (placeId: string) => void;
  onOpenReport: () => void;
  onOpenProfile: () => void;
}

export function MapScreen({ onSelectPlace, onSelectPin, onOpenReport, onOpenProfile }: MapScreenProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<PlaceType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const filteredPlaces = selectedFilter
    ? MOCK_PLACES.filter((p) => p.type === selectedFilter)
    : MOCK_PLACES;

  // Search autocomplete results
  const searchResults = searchQuery.trim()
    ? MOCK_PLACES.filter(
        (place) =>
          place.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (place.name && place.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          PLACE_TYPE_INFO[place.type].label.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([37.7749, -122.4194], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
    }).addTo(map);

    // Add zoom control to bottom right
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    filteredPlaces.forEach((place) => {
      const getVibeColor = () => {
        switch (place.vibe) {
          case 'safe':
            return '#10b981';
          case 'sketchy':
            return '#f59e0b';
          case 'unsafe':
            return '#ef4444';
        }
      };

      const color = getVibeColor();
      const icon = L.divIcon({
        html: `<div style="background: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.25);"></div>`,
        className: 'custom-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([place.lat, place.lng], { icon }).addTo(mapRef.current!);
      marker.on('click', () => (onSelectPin || onSelectPlace)(place.id));
      markersRef.current.push(marker);
    });
  }, [filteredPlaces, onSelectPlace, onSelectPin]);

  return (
    <div className="relative h-full">
      {/* Backdrop for autocomplete */}
      {showAutocomplete && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowAutocomplete(false)}
        />
      )}

      {/* Map */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-white/95 to-transparent pointer-events-none z-20">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          {/* Logo & Profile */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
              <span className="text-xl">🛡️</span>
              <span className="font-bold">SafeMap</span>
            </div>
            <button
              onClick={onOpenProfile}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Enter address or place (e.g. parking garage, apartment, street)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAutocomplete(e.target.value.trim().length > 0);
              }}
              onFocus={() => setShowAutocomplete(searchQuery.trim().length > 0)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Autocomplete Dropdown */}
            {showAutocomplete && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-80 overflow-y-auto z-20">
                {searchResults.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSearchQuery('');
                      setShowAutocomplete(false);
                      onSelectPlace(place.id);
                    }}
                    className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-50 last:border-none"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{PLACE_TYPE_INFO[place.type].emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {place.name || place.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{place.location}</span>
                        </div>
                      </div>
                      {place.reportCount > 0 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full whitespace-nowrap">
                          {place.reportCount} reports
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {(Object.keys(PLACE_TYPE_INFO) as PlaceType[]).map((type) => {
              const info = PLACE_TYPE_INFO[type];
              const isActive = selectedFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(isActive ? null : type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap shadow-md transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white scale-105'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span>{info.emoji}</span>
                  <span className="text-sm font-medium">{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Report Button */}
      <button
        onClick={onOpenReport}
        className="absolute bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full shadow-2xl hover:scale-105 transition-transform z-10"
      >
        <Plus className="w-6 h-6" />
        <span className="font-semibold">Report</span>
      </button>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
