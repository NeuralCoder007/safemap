import { formatDistanceToNow } from 'date-fns';
import { VIBE_TAG_INFO, PLACE_TYPE_INFO } from '../data/mockData';
import { usePlaces } from '../context/PlacesContext';
import type { VibeReport } from '../data/vibeReport';
import type { VibeTag } from '../data/types';

interface BentoBottomSheetProps {
  reportId: string;
  onClose: () => void;
}

function vibeLabelForReport(r: VibeReport): { label: string; color: string; bg: string } {
  const score = r.vibe === 'safe' ? 100 : r.vibe === 'sketchy' ? 50 : 0;
  const label = score >= 70 ? 'Safe Vibe' : score >= 40 ? 'Sketchy Vibe' : 'Unsafe Vibe';
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const bg = score >= 70 ? '#d1fae5' : score >= 40 ? '#fef3c7' : '#fee2e2';
  return { label, color, bg };
}

export function BentoBottomSheet({ reportId, onClose }: BentoBottomSheetProps) {
  const { reports } = usePlaces();
  const report = reports.find((r) => r.id === reportId);

  if (!report) return null;

  const { label: vibeLabel, color: vibeColor, bg: vibeBgColor } = vibeLabelForReport(report);
  const vibeScore = report.vibe === 'safe' ? 100 : report.vibe === 'sketchy' ? 50 : 0;

  let postedAgo: string;
  try {
    postedAgo = formatDistanceToNow(new Date(report.recency), { addSuffix: true });
  } catch {
    postedAgo = report.recency;
  }

  const tagList = report.tags as VibeTag[];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
        <div
          className="bg-white rounded-t-3xl max-h-[60vh] overflow-y-auto"
          style={{ boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="p-6 rounded-t-3xl" style={{ backgroundColor: vibeBgColor }}>
            <h2 className="font-semibold text-lg mb-1 text-gray-900">
              {report.label ?? `${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}`}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{PLACE_TYPE_INFO[report.category].emoji}</span>
              <span className="text-sm font-medium text-gray-600">
                {PLACE_TYPE_INFO[report.category].label}
              </span>
            </div>
            <div className="font-bold text-5xl mb-1" style={{ color: vibeColor }}>
              {vibeScore}%
            </div>
            <div className="font-medium text-xl text-gray-700">{vibeLabel}</div>
            <div className="mt-2 text-sm text-gray-600">Last checked: {postedAgo}</div>
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Vibe Tags</h3>
            {tagList.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {tagList.map((tag) => (
                  <div
                    key={tag}
                    className="bg-gray-50 rounded-xl p-4 text-center"
                    style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="text-2xl mb-1">{VIBE_TAG_INFO[tag].emoji}</div>
                    <div className="text-sm font-medium text-gray-700">{VIBE_TAG_INFO[tag].label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tags yet. Be the first to report!</p>
            )}
          </div>

          <div className="p-6 pb-8">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
