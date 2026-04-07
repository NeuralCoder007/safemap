import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Place, PlaceType, Vibe, VibeTag } from '../data/types';
import type { VibeReport } from '../data/vibeReport';
import { reportToMapPlace } from '../data/vibeReport';
import { createReport, fetchReports } from '../lib/reportsApi';

export type ExploreFilters = {
  category: string;
  recency: string;
};

export type SubmitReportPayload = {
  formattedAddress: string;
  lat: number;
  lng: number;
  type: PlaceType;
  vibe: Vibe;
  tags: VibeTag[];
  note?: string;
};

type PlacesContextValue = {
  /** Raw reports from KV (after server-side filters) */
  reports: VibeReport[];
  /** Markers for the map */
  places: Place[];
  filters: ExploreFilters;
  setFilters: (patch: Partial<ExploreFilters>) => void;
  loading: boolean;
  loadError: string | null;
  refetch: () => Promise<void>;
  submitReport: (payload: SubmitReportPayload) => Promise<void>;
};

const PlacesContext = createContext<PlacesContextValue | null>(null);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<VibeReport[]>([]);
  const [filters, setFiltersState] = useState<ExploreFilters>({
    category: 'all',
    recency: 'all',
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const setFilters = useCallback((patch: Partial<ExploreFilters>) => {
    setFiltersState((f) => ({ ...f, ...patch }));
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReports({
        category: filters.category,
        recency: filters.recency,
      });
      setReports(data);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.recency]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const places = useMemo(() => reports.map(reportToMapPlace), [reports]);

  const submitReport = useCallback(
    async (payload: SubmitReportPayload) => {
      await createReport({
        lat: payload.lat,
        lng: payload.lng,
        category: payload.type,
        vibe: payload.vibe,
        tags: payload.tags,
        label: payload.formattedAddress,
      });
      await refetch();
    },
    [refetch]
  );

  const value = useMemo<PlacesContextValue>(
    () => ({
      reports,
      places,
      filters,
      setFilters,
      loading,
      loadError,
      refetch,
      submitReport,
    }),
    [reports, places, filters, setFilters, loading, loadError, refetch, submitReport]
  );

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces(): PlacesContextValue {
  const ctx = useContext(PlacesContext);
  if (!ctx) {
    throw new Error('usePlaces must be used within PlacesProvider');
  }
  return ctx;
}
