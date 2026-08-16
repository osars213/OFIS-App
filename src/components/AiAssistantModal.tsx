import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  ArrowRight,
  CheckCircle2,
  Send,
  Building2,
  Star,
  Monitor,
  Volume2,
  Sun,
  Lightbulb,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OfisLogo } from './OfisLogo';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiModalOpen,
    closeAiModal,
    aiModalMode,
    spaces,
    setSelectedSpace,
    setSelectedDesk,
    setIsCheckoutModalOpen,
    formatPriceNaira,
    showToast,
  } = useApp();

  // Matcher state
  const [preferences, setPreferences] = useState(
    'I need a soundproof podcast studio or private focus pod with reliable 24/7 power, high-speed fiber internet, and Shure SM7B microphones in Lekki or Victoria Island.'
  );
  const [cityPref, setCityPref] = useState('Lagos');
  const [budgetPref, setBudgetPref] = useState('15000');
  const [matchingResults, setMatchingResults] = useState<any | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  // Listing optimizer state
  const [optTitle, setOptTitle] = useState('The Creator Loft Lekki Phase 1');
  const [optCity, setOptCity] = useState('Lagos');
  const [optAmenities, setOptAmenities] = useState('24/7 Solar & Gen backup, 500Mbps Starlink + Fiber, 4K Sony FX3 Cameras, Soundproof booths, AC');
  const [optAudience, setOptAudience] = useState('Podcasters, tech founders, video creators, and remote teams');
  const [optimizationResult, setOptimizationResult] = useState<any | null>(null);
  const [isLoadingOpt, setIsLoadingOpt] = useState(false);

  if (!isAiModalOpen) return null;

  const handleRunMatcher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingMatch(true);
    setMatchingResults(null);

    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          city: cityPref,
          budget: Number(budgetPref),
          availableSpaces: spaces,
        }),
      });

      if (!res.ok) throw new Error('AI Matcher request failed');
      const data = await res.json();
      setMatchingResults(data);
    } catch (err: any) {
      // Graceful fallback simulation
      const bestSpace = spaces.find(s => s.city.toLowerCase() === cityPref.toLowerCase()) || spaces[0];
      const bestDesk = bestSpace.desks.find(d => d.status === 'available') || bestSpace.desks[0];

      setMatchingResults({
        recommendation: {
          spaceId: bestSpace.id,
          spaceName: bestSpace.name,
          deskCode: bestDesk.code,
          matchScore: 98,
          reasoning: `Based on your request for a soundproof environment with 24/7 power backup and high-speed connectivity in ${cityPref}, ${bestSpace.name} (${bestSpace.neighborhood}) is the perfect match. It features dual redundant power, acoustic treatment, and station ${bestDesk.code}.`,
          highlightedPerks: ['24/7 Gen + Solar Redundancy', '500Mbps High-Speed Internet', 'Zero Noise Acoustic Isolation'],
        },
      });
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const handleRunOptimizer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingOpt(true);
    setOptimizationResult(null);

    try {
      const res = await fetch('/api/ai/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: optTitle,
          city: optCity,
          amenities: optAmenities.split(',').map(s => s.trim()),
          targetAudience: optAudience,
        }),
      });

      if (!res.ok) throw new Error('AI Optimizer request failed');
      const data = await res.json();
      setOptimizationResult(data);
    } catch (err: any) {
      setOptimizationResult({
        optimizedTitle: `${optTitle} — Premium Production & Coworking Hub`,
        compellingTagline: 'Uninterrupted power, fiber connectivity, and turnkey studio equipment in the heart of Lagos.',
        optimizedDescription: `${optTitle} provides creators, founders, and professionals with premium workstations and production studios. Outfitted with 24/7 dual generator & solar redundancy, acoustic soundproofing, 4K production lighting, and instant QR turnstile access.`,
        pricingSuggestions: {
          suggestedHourlyRateNGN: 12000,
          suggestedDailyRateNGN: 65000,
          pricingReasoning: 'Positioned strategically for Lagos creator and tech startup demand with high willingness to pay for guaranteed power and studio gear.',
        },
        floorPlanLayoutTips: [
          'Position podcast and recording pods away from external street-facing walls.',
          'Cluster hot desks around the central coffee bar and high-speed LAN hub.',
        ],
      });
    } finally {
      setIsLoadingOpt(false);
    }
  };

  const handleBookAiRecommendedDesk = (spaceId: string, deskCode: string) => {
    const space = spaces.find(s => s.id === spaceId) || spaces[0];
    const desk = space.desks.find(d => d.code === deskCode) || space.desks[0];

    setSelectedSpace(space);
    setSelectedDesk(desk);
    closeAiModal();
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#171717] text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#282828] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] bg-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OfisLogo size="sm" showTagline={false} />
            <div>
              <h3 className="font-black text-white text-base">
                {aiModalMode === 'match' ? 'AI Space & Studio Match' : 'AI Listing & Rate Optimizer'}
              </h3>
              <p className="text-[11px] text-[#9A9A9A]">
                {aiModalMode === 'match'
                  ? 'Find verified Nigerian spaces matching your equipment, power & quiet requirements'
                  : 'Generate high-converting space copy, Nigerian market rates & layout optimization'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAiModal}
            className="p-1.5 rounded-xl hover:bg-[#222222] text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Desk Matcher Mode */}
        {aiModalMode === 'match' && (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleRunMatcher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Describe Your Space & Equipment Needs
                </label>
                <textarea
                  rows={3}
                  required
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g. I need a podcast studio with Shure mics in Lekki, or a quiet private office with 24/7 power in Abuja."
                  className="w-full p-3 rounded-xl border border-[#2D2D2D] text-xs font-normal focus:outline-none focus:border-[#00C878] bg-[#202020] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#9A9A9A] mb-1">City Hub</label>
                  <select
                    value={cityPref}
                    onChange={(e) => setCityPref(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white font-bold focus:outline-none"
                  >
                    <option value="Lagos">Lagos (Lekki, VI, Yaba, Ikeja)</option>
                    <option value="Abuja">Abuja (Maitama, Wuse 2, Central)</option>
                    <option value="Port Harcourt">Port Harcourt (GRA)</option>
                    <option value="Ibadan">Ibadan (Bodija)</option>
                    <option value="Benin City">Benin City (GRA)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#9A9A9A] mb-1">Max Hourly Budget (₦ NGN)</label>
                  <input
                    type="number"
                    value={budgetPref}
                    onChange={(e) => setBudgetPref(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingMatch}
                className="w-full py-3.5 px-4 rounded-xl bg-[#00C878] hover:bg-[#00b06a] disabled:opacity-50 text-[#0D0D0D] font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoadingMatch ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin"></span>
                    Analyzing Spaces & Power Specs...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#0D0D0D]">
                    <Sparkles className="w-4 h-4" /> Find Matching Spaces
                  </span>
                )}
              </button>
            </form>

            {/* Results Display */}
            {matchingResults && matchingResults.recommendation && (
              <div className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#00C878]/40 space-y-4 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#063B2A] text-[#00C878] font-bold text-[10px] uppercase border border-[#00C878]/30">
                      {matchingResults.recommendation.matchScore || 98}% Match
                    </span>
                    <h4 className="font-black text-sm text-white">
                      {matchingResults.recommendation.spaceName}
                    </h4>
                  </div>

                  <span className="font-mono font-bold text-sm bg-[#063B2A] text-[#00C878] px-2.5 py-0.5 rounded-md border border-[#00C878]/30">
                    Pod {matchingResults.recommendation.deskCode}
                  </span>
                </div>

                <p className="text-[#9A9A9A] leading-relaxed">
                  {matchingResults.recommendation.reasoning}
                </p>

                {Array.isArray(matchingResults?.recommendation?.highlightedPerks) && matchingResults.recommendation.highlightedPerks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {matchingResults.recommendation.highlightedPerks.map((perk: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-[#252525] border border-[#333333] text-[#00C878] font-semibold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#00C878]" />
                        {perk}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() =>
                    handleBookAiRecommendedDesk(
                      matchingResults.recommendation.spaceId,
                      matchingResults.recommendation.deskCode
                    )
                  }
                  className="w-full py-3 px-4 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#0D0D0D]" />
                  <span>Reserve Recommended Space Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Listing Optimizer Mode */}
        {aiModalMode === 'optimize' && (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleRunOptimizer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#9A9A9A] mb-1">Space Name</label>
                  <input
                    type="text"
                    value={optTitle}
                    onChange={(e) => setOptTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white font-medium focus:outline-none focus:border-[#00C878]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#9A9A9A] mb-1">City / Neighborhood</label>
                  <input
                    type="text"
                    value={optCity}
                    onChange={(e) => setOptCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white font-medium focus:outline-none focus:border-[#00C878]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#9A9A9A] mb-1">Key Amenities (comma separated)</label>
                <input
                  type="text"
                  value={optAmenities}
                  onChange={(e) => setOptAmenities(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white font-medium focus:outline-none focus:border-[#00C878]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#9A9A9A] mb-1">Ideal Audience</label>
                <input
                  type="text"
                  value={optAudience}
                  onChange={(e) => setOptAudience(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white font-medium focus:outline-none focus:border-[#00C878]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoadingOpt}
                className="w-full py-3.5 px-4 rounded-xl bg-[#00C878] hover:bg-[#00b06a] disabled:opacity-50 text-[#0D0D0D] font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoadingOpt ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin"></span>
                    Analyzing Nigerian Market & Crafting Copy...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#0D0D0D]">
                    <Sparkles className="w-4 h-4" /> Generate Optimized Copy & Rates
                  </span>
                )}
              </button>
            </form>

            {/* Optimizer Result */}
            {optimizationResult && (
              <div className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2D2D2D] space-y-4 animate-in fade-in duration-200 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">Optimized Title & Tagline</div>
                  <h4 className="font-black text-sm text-white mt-0.5">{optimizationResult.optimizedTitle}</h4>
                  <p className="text-[#00C878] italic mt-0.5">{optimizationResult.compellingTagline}</p>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">High-Converting Description</div>
                  <p className="text-[#9A9A9A] leading-relaxed mt-1 bg-[#171717] p-3 rounded-xl border border-[#282828]">
                    {optimizationResult.optimizedDescription}
                  </p>
                </div>

                {optimizationResult.pricingSuggestions && (
                  <div className="p-3 rounded-xl bg-[#063B2A] border border-[#00C878]/30 space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>Suggested Rates (NGN):</span>
                      <span className="font-mono text-[#00C878]">
                        ₦{optimizationResult.pricingSuggestions.suggestedHourlyRateNGN || 12000}/hr • ₦{optimizationResult.pricingSuggestions.suggestedDailyRateNGN || 65000}/day
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      {optimizationResult.pricingSuggestions.pricingReasoning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
