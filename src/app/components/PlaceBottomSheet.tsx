import { ThumbsUp, X, TrendingUp } from 'lucide-react';
import { MOCK_PLACES, MOCK_REPORTS, VIBE_TAG_INFO, PLACE_TYPE_INFO } from '../data/mockData';

interface PlaceBottomSheetProps {
  placeId: string;
  onClose: () => void;
  onAddReport: () => void;
}

export function PlaceBottomSheet({ placeId, onClose, onAddReport }: PlaceBottomSheetProps) {
  const place = MOCK_PLACES.find((p) => p.id === placeId);
  const reports = MOCK_REPORTS.filter((r) => r.placeId === placeId).slice(0, 3);

  if (!place) return null;

  const getVibeEmoji = () => {
    switch (place.vibe) {
      case 'safe':
        return '😊';
      case 'sketchy':
        return '😐';
      case 'unsafe':
        return '😨';
    }
  };

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
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up" style={{ zIndex: 9999 }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 pb-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{PLACE_TYPE_INFO[place.type].emoji}</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{place.name || place.location}</h2>
                {place.name && <p className="text-gray-500">{place.location}</p>}
              </div>
            </div>

            {/* Vibe Score */}
            <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r ${getVibeColor()} text-white shadow-lg`}>
              <span className="text-3xl">{getVibeEmoji()}</span>
              <div>
                <div className="text-xl font-bold capitalize">{place.vibe}</div>
                <div className="text-sm opacity-90">{place.reportCount} reports · {place.confidence} confidence</div>
              </div>
            </div>
          </div>

          {/* Top Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Most reported
            </h3>
            <div className="flex flex-wrap gap-2">
              {place.topTags.map((tag) => {
                const info = VIBE_TAG_INFO[tag];
                return (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-full text-sm font-medium"
                  >
                    <span>{info.emoji}</span>
                    {info.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Recent Reports */}
          {reports.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Recent vibes</h3>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {report.isVerified ? '✓ ' : ''}
                          {report.author}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {report.note && <p className="text-sm text-gray-700 mb-3">{report.note}</p>}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {report.tags.slice(0, 3).map((tag) => {
                          const info = VIBE_TAG_INFO[tag];
                          return (
                            <span key={tag} className="text-xs px-2 py-1 bg-white rounded-full">
                              {info.emoji}
                            </span>
                          );
                        })}
                      </div>
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{report.helpful}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Report Button */}
          <button
            onClick={onAddReport}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:scale-[1.02] transition-transform"
          >
            + Add your experience
          </button>
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
