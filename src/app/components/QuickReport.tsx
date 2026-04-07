import { useState } from 'react';
import { X, Check, MapPin, Search } from 'lucide-react';
import { PLACE_TYPE_INFO, VIBE_TAG_INFO, MOCK_PLACES } from '../data/mockData';
import { PlaceType, VibeTag, Vibe } from '../data/types';

interface QuickReportProps {
  onClose: () => void;
  preselectedPlaceId?: string | null;
}

export function QuickReport({ onClose, preselectedPlaceId }: QuickReportProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(preselectedPlaceId ? 1 : 0);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(preselectedPlaceId || null);
  const [placeSearch, setPlaceSearch] = useState('');
  const [showPlaceResults, setShowPlaceResults] = useState(false);
  const [placeType, setPlaceType] = useState<PlaceType | null>(null);
  const [selectedTags, setSelectedTags] = useState<VibeTag[]>([]);
  const [vibe, setVibe] = useState<Vibe>('sketchy');
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const placeSearchResults = placeSearch.trim()
    ? MOCK_PLACES.filter(
        (place) =>
          place.location.toLowerCase().includes(placeSearch.toLowerCase()) ||
          (place.name && place.name.toLowerCase().includes(placeSearch.toLowerCase())) ||
          PLACE_TYPE_INFO[place.type].label.toLowerCase().includes(placeSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  const selectedPlace = selectedPlaceId ? MOCK_PLACES.find((p) => p.id === selectedPlaceId) : null;

  const toggleTag = (tag: VibeTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-3xl p-12 max-w-md text-center animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thanks! 🎉</h2>
          <p className="text-gray-600">+1 helped others stay safe</p>
        </div>
      </div>
    );
  }

  const totalSteps = 5;
  const currentProgress = step === 0 ? 0 : step;

  return (
    <>
      {/* Backdrop for place search autocomplete */}
      {showPlaceResults && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 9999 }}
          onClick={() => setShowPlaceResults(false)}
        />
      )}

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in" style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold">Quick Report</h2>
            {step === 0 ? (
              <p className="text-sm text-gray-500">Find the place</p>
            ) : (
              <p className="text-sm text-gray-500">Step {step} of {totalSteps}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        {step > 0 && (
          <div className="px-6 pt-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-300"
                style={{ width: `${(currentProgress / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step 0: Find Place */}
          {step === 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Where did this happen?</h3>
              <p className="text-sm text-gray-500 mb-4">Search for the place or location</p>

              {/* Selected Place Display */}
              {selectedPlace && (
                <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{PLACE_TYPE_INFO[selectedPlace.type].emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {selectedPlace.name || selectedPlace.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {selectedPlace.location}
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="e.g. parking garage, apartment, street name"
                  value={placeSearch}
                  onChange={(e) => {
                    setPlaceSearch(e.target.value);
                    setShowPlaceResults(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => setShowPlaceResults(placeSearch.trim().length > 0)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500"
                  autoFocus
                />

                {/* Autocomplete Results */}
                {showPlaceResults && placeSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto z-20">
                    {placeSearchResults.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => {
                          setSelectedPlaceId(place.id);
                          setPlaceSearch('');
                          setShowPlaceResults(false);
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
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-500">
                Can't find it? Continue to add approximate location details
              </div>
            </div>
          )}

          {/* Step 1: Place Type */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">What type of place?</h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(PLACE_TYPE_INFO) as PlaceType[]).map((type) => {
                  const info = PLACE_TYPE_INFO[type];
                  const isSelected = placeType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setPlaceType(type)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{info.emoji}</div>
                      <div className="font-medium">{info.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Tags */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">What happened?</h3>
              <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(VIBE_TAG_INFO) as VibeTag[]).map((tag) => {
                  const info = VIBE_TAG_INFO[tag];
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{info.emoji}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 ml-auto" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Vibe Slider */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-6">How did it feel?</h3>
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">
                  {vibe === 'unsafe' && '😨'}
                  {vibe === 'sketchy' && '😐'}
                  {vibe === 'safe' && '😊'}
                </div>
                <div className="text-2xl font-bold capitalize">{vibe}</div>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => setVibe('unsafe')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    vibe === 'unsafe'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">😨</span>
                    <span className="font-semibold">Unsafe</span>
                  </div>
                </button>
                <button
                  onClick={() => setVibe('sketchy')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    vibe === 'sketchy'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">😐</span>
                    <span className="font-semibold">Sketchy</span>
                  </div>
                </button>
                <button
                  onClick={() => setVibe('safe')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    vibe === 'safe'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">😊</span>
                    <span className="font-semibold">Safe</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Optional Note */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Anything else? (optional)</h3>
              <p className="text-sm text-gray-500 mb-4">Keep it short</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Quick note about what happened..."
                rows={4}
                maxLength={140}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="text-right text-sm text-gray-400 mt-2">{note.length}/140</div>
            </div>
          )}

          {/* Step 5: Identity */}
          {step === 5 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">How do you want to post?</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsAnonymous(true)}
                  className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                    isAnonymous
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">🔒</span>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Anonymous</div>
                      <div className="text-sm text-gray-600">
                        Stay private, still help others
                      </div>
                    </div>
                    {isAnonymous && <Check className="w-6 h-6 text-purple-600" />}
                  </div>
                </button>
                <button
                  onClick={() => setIsAnonymous(false)}
                  className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                    !isAnonymous
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">✓</span>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Verified</div>
                      <div className="text-sm text-gray-600">
                        Build trust, get more helpful votes
                      </div>
                    </div>
                    {!isAnonymous && <Check className="w-6 h-6 text-purple-600" />}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
          <button
            onClick={
              step === 0
                ? () => setStep(1)
                : step === 5
                ? handleSubmit
                : () => setStep((s) => (s + 1) as any)
            }
            disabled={(step === 0 && !selectedPlaceId) || (step === 1 && !placeType)}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 5 ? 'Submit' : 'Continue'}
          </button>
        </div>

        <style>{`
          @keyframes scale-in {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}</style>
      </div>
      </div>
    </>
  );
}
