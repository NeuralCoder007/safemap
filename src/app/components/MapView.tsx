import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '../data/types';
import { PLACE_TYPE_INFO } from '../data/mockData';

interface MapViewProps {
  places: Place[];
  onSelectPlace: (placeId: string) => void;
  mapCenter?: { lat: number; lng: number } | null;
}

export function MapView({ places, onSelectPlace, mapCenter }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([37.7749, -122.4194], 12);

    // Day mode tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '©OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers with colored round icons
    places.forEach((place) => {
      const color = place.vibeScore >= 70 ? '#10b981' : place.vibeScore >= 40 ? '#f59e0b' : '#ef4444';
      const emoji = PLACE_TYPE_INFO[place.type].emoji;

      const icon = L.divIcon({
        className: 'round-marker',
        html: `<div style="position:relative;width:36px;height:36px;">
            <div style="width:36px;height:36px;background:${color};border:2px solid white;border-radius:50%;
              box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">
              ${emoji}
            </div>
          </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(mapRef.current!)
        .on('click', () => onSelectPlace(place.id));

      markersRef.current.push(marker);
    });
  }, [places, onSelectPlace]);

  useEffect(() => {
    if (!mapRef.current || !mapCenter) return;
    mapRef.current.setView([mapCenter.lat, mapCenter.lng], 15, {
      animate: true,
      duration: 0.5,
    });
  }, [mapCenter]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}
