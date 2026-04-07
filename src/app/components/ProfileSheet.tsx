import { X, Award, ThumbsUp, FileText } from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';

interface ProfileSheetProps {
  onClose: () => void;
}

export function ProfileSheet({ onClose }: ProfileSheetProps) {
  const getBadgeInfo = () => {
    switch (CURRENT_USER.badge) {
      case 'new':
        return { emoji: '🆕', label: 'New', color: 'from-gray-400 to-gray-500' };
      case 'verified':
        return { emoji: '✓', label: 'Verified', color: 'from-blue-500 to-blue-600' };
      case 'trusted':
        return { emoji: '⭐', label: 'Trusted', color: 'from-purple-500 to-purple-600' };
    }
  };

  const badge = getBadgeInfo();

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

        <div className="px-6 pb-8">
          {/* Profile Header */}
          <div className="text-center mb-8">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {CURRENT_USER.username.charAt(0).toUpperCase()}
            </div>

            {/* Username */}
            <h2 className="text-2xl font-bold mb-2">{CURRENT_USER.username}</h2>

            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} text-white`}>
              <span className="text-lg">{badge.emoji}</span>
              <span className="font-semibold">{badge.label}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-2">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-1">{CURRENT_USER.reportsPosted}</div>
              <div className="text-sm text-purple-700">Reports posted</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-2">
                <ThumbsUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-1">{CURRENT_USER.helpfulVotes}</div>
              <div className="text-sm text-blue-700">Helpful votes</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Your impact
            </h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌟</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">Community Helper</div>
                  <div className="text-sm text-gray-600">
                    Your reports helped {CURRENT_USER.helpfulVotes} people stay safe
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Level */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Next: Trusted</span>
              <span className="text-xs text-gray-500">7 more reports</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                style={{ width: `${(CURRENT_USER.reportsPosted / 10) * 100}%` }}
              />
            </div>
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
