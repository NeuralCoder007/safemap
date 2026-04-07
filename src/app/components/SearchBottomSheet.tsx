import { MapPin, TrendingUp, Plus } from 'lucide-react';
import { MOCK_PLACES, getVibeTagInfo, PLACE_TYPE_INFO } from '../data/mockData';

interface SearchBottomSheetProps {
  placeId: string;
  onClose: () => void;
  onViewReports: () => void;
  onReportPlace: () => void;
}

export function SearchBottomSheet({ placeId, onClose, onViewReports, onReportPlace }: SearchBottomSheetProps) {
  const place = MOCK_PLACES.find((p) => p.id === placeId);

  if (!place) return null;

  const getVibeColor = () => {
    switch (place.vibe) {
      case 'safe':
        return 'from-green-500 to-emerald-600';
      case 'sketchy':
        return 'from-yellow-500 to-orange-500';
      case 'unsafe':
        return 'from-red-500 to-rose-600';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 9998 }} onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up" style={{ zIndex: 9999 }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="px-6 pb-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{PLACE_TYPE_INFO[place.type].emoji}</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{place.name || place.location}</h2>
                {place.name && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{place.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Data Preview */}
            {place.reportCount > 0 && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${getVibeColor()} text-white mb-4`}>
                <span className="text-sm font-medium">{place.reportCount} reports</span>
                <span>•</span>
                <span className="text-sm font-medium capitalize">{place.confidence} confidence</span>
              </div>
            )}

            {/* Top Tags Preview */}
            {place.topTags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Most reported
                </h3>
                <div className="flex flex-wrap gap-2">
                  {place.topTags.slice(0, 3).map((tag) => {
                    const info = getVibeTagInfo(tag);
                    return (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                      >
                        <span>{info.emoji}</span>
                        {info.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onReportPlace}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Report this place
            </button>

            {place.reportCount > 0 && (
              <button
                onClick={onViewReports}
                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
              >
                View {place.reportCount} reports
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
