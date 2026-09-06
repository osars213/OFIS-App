import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeftRight, 
  Sparkles, 
  Check, 
  Share2, 
  Bookmark, 
  Zap, 
  Wifi, 
  Star, 
  MapPin, 
  Users, 
  Clock, 
  Coffee, 
  Car, 
  Wind, 
  Accessibility, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Layers, 
  Copy, 
  Calendar,
  CreditCard,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { compareService } from '../../services/compareService';
import { Space } from '../../types';
import { SavedComparisonsSection } from './SavedComparisonsSection';
import { getSpaceAvailability } from '../../utils/availability';
import { getSpacePricing } from '../../utils/pricing';

export const WorkspaceCompareModal: React.FC = () => {
  const {
    isCompareModalOpen,
    setIsCompareModalOpen,
    comparedSpaceIds,
    allSpaces,
    removeSpaceFromCompare,
    addSpaceToCompare,
    clearCompareList,
    filters,
    bookings,
    saveCurrentComparison,
    setCheckoutSpace,
    setIsCheckoutOpen,
    setSelectedSpaceId,
    setCurrentView,
    formatPrice,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'comparison' | 'saved'>('comparison');
  const [saveTitleInput, setSaveTitleInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isCompareModalOpen) return null;

  const selectedSpaces: Space[] = comparedSpaceIds
    .map(id => allSpaces.find(s => s.id === id))
    .filter((s): s is Space => Boolean(s));

  const count = selectedSpaces.length;
  const isReady = count >= 2;

  // Generate difference highlights
  const differenceHighlights = isReady ? compareService.generateDifferenceHighlights(selectedSpaces) : [];

  // Find min price & max speed for comparative badges
  const minPrice = isReady ? Math.min(...selectedSpaces.map(s => s.pricePerHour)) : 0;
  const maxSpeed = isReady ? Math.max(...selectedSpaces.map(s => s.internetSpeedMbps || 0)) : 0;
  const maxRating = isReady ? Math.max(...selectedSpaces.map(s => s.rating || 0)) : 0;

  const handleShare = async () => {
    if (!isReady) return;
    const shareData = compareService.generateComparisonShareText(selectedSpaces);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (err) {
        // Fallback to clipboard if share cancelled/unsupported
        copyToClipboard(shareData.text);
      }
    } else {
      copyToClipboard(shareData.text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }).catch(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    });
  };

  const handleSave = () => {
    if (!isReady) return;
    setIsSaving(true);
    setTimeout(() => {
      saveCurrentComparison(saveTitleInput);
      setIsSaving(false);
      setSaveSuccess(true);
      setSaveTitleInput('');
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 400);
  };

  const handleBook = (space: Space) => {
    setIsCompareModalOpen(false);
    setCheckoutSpace(space);
    setIsCheckoutOpen(true);
  };

  const handleViewDetails = (spaceId: string) => {
    setIsCompareModalOpen(false);
    setSelectedSpaceId(spaceId);
    setCurrentView('details');
  };

  // Suggested spaces to add when < 2 selected
  const suggestedSpaces = allSpaces
    .filter(s => !comparedSpaceIds.includes(s.id))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-6xl bg-[#121614] border border-[#1E2522] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* 1. MODAL HEADER & CONTROLS                                                */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-[#1E2522] bg-[#141816]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00C878]/15 border border-[#00C878]/30 flex items-center justify-center text-[#00C878]">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                  Workspace Compare &amp; Smart Match
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#00C878]/20 text-[#00C878] text-[10px] font-mono font-bold uppercase">
                  {count}/3 Selected
                </span>
              </div>
              <p className="text-xs text-[#718079]">
                Side-by-side specs, proprietary match scores, and automated difference analysis
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* View switcher tabs */}
            <div className="flex items-center bg-[#18201B] p-1 rounded-xl border border-[#232D28]">
              <button
                type="button"
                onClick={() => setActiveTab('comparison')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-[#00C878] text-[#0D0D0D] font-bold'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2]'
                }`}
              >
                Comparison
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                  activeTab === 'saved'
                    ? 'bg-[#00C878] text-[#0D0D0D] font-bold'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2]'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Saved</span>
              </button>
            </div>

            {/* Share Button */}
            {isReady && activeTab === 'comparison' && (
              <button
                type="button"
                id="share-comparison-btn"
                onClick={handleShare}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Share comparison summary"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#00C878]" />
                    <span className="text-[#00C878] hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#9EABA3]" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            )}

            {/* Save Button */}
            {isReady && activeTab === 'comparison' && (
              <button
                type="button"
                id="save-comparison-btn"
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Save comparison to profile"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#00C878]" />
                    <span className="text-[#00C878] hidden sm:inline">Saved!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-[#00C878]" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              id="close-compare-modal-btn"
              onClick={() => setIsCompareModalOpen(false)}
              className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT                                                           */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: SAVED COMPARISONS VIEW */}
          {activeTab === 'saved' && (
            <div className="max-w-2xl mx-auto py-2">
              <SavedComparisonsSection
                onSelectComparison={(comp) => {
                  setActiveTab('comparison');
                }}
              />
            </div>
          )}

          {/* TAB 2: COMPARISON MATRIX */}
          {activeTab === 'comparison' && (
            <>
              {/* --- 2A. EMPTY OR SINGLE SPACE STATE --- */}
              {!isReady ? (
                <div className="py-10 sm:py-14 text-center max-w-lg mx-auto space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-[#18201B] border border-[#232D28] flex items-center justify-center mx-auto text-[#00C878]">
                    <ArrowLeftRight className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-[#F2F2F2]">
                      {count === 1
                        ? `1 Workspace Selected: ${selectedSpaces[0]?.title}`
                        : 'Select Workspaces to Compare'}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#718079] leading-relaxed">
                      Choose at least <strong>2 workspaces</strong> (up to 3) to unlock side-by-side amenity matrices, proprietary Smart Match scores, and automatic difference callouts.
                    </p>
                  </div>

                  {/* Suggested Spaces to Add with 1-Click */}
                  <div className="pt-4 space-y-3 text-left">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#9EABA3] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00C878]" />
                      <span>Suggested Workspaces to Compare:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {suggestedSpaces.map((space) => (
                        <div
                          key={space.id}
                          className="p-3 rounded-2xl bg-[#18201B] border border-[#232D28] hover:border-[#00C878]/50 transition-all flex flex-col justify-between space-y-2.5"
                        >
                          <div className="space-y-1.5">
                            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[#121614]">
                              <img src={space.featuredImage} alt={space.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-xs font-bold text-[#F2F2F2] line-clamp-1">{space.title}</div>
                            <div className="text-[10px] text-[#718079]">{space.neighborhood}, {space.city}</div>
                            <div className="text-xs font-mono font-bold text-[#00C878]">
                              {formatPrice(space.pricePerHour)}/hr
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => addSpaceToCompare(space.id)}
                            className="w-full py-1.5 px-2.5 rounded-xl bg-[#00C878]/15 hover:bg-[#00C878] text-[#00C878] hover:text-[#0D0D0D] border border-[#00C878]/30 text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Compare</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCompareModalOpen(false)}
                      className="px-6 py-2.5 rounded-2xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] transition-colors"
                    >
                      Continue Browsing Workspaces
                    </button>
                  </div>
                </div>
              ) : (
                /* --- 2B. FULL SIDE-BY-SIDE COMPARISON TABLE --- */
                <div className="space-y-6">
                  
                  {/* --- DIFFERENCE HIGHLIGHTS BANNER --- */}
                  {differenceHighlights.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#141E19] border border-[#00C878]/30 space-y-2.5">
                      <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00C878]">
                        <Sparkles className="w-4 h-4 text-[#00C878]" />
                        <span>Key Difference Highlights</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                        {differenceHighlights.map((diff, idx) => (
                          <div
                            key={idx}
                            className="flex items-start space-x-2 text-xs text-[#E2E8E5] bg-[#0E1511]/80 p-2.5 rounded-xl border border-[#23352B]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00C878] shrink-0 mt-0.5" />
                            <span className="leading-snug">{diff.highlightText}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- SIDE-BY-SIDE MATRIX COLUMNS --- */}
                  <div className="overflow-x-auto pb-4">
                    <div className={`grid gap-4 min-w-[640px] ${
                      count === 2 ? 'grid-cols-2' : 'grid-cols-3'
                    }`}>
                      {selectedSpaces.map((space) => {
                        const smartScore = compareService.calculateSmartMatchScore(space, filters, bookings);
                        const bestForTag = compareService.getBestForLabel(space, selectedSpaces);
                        const availability = getSpaceAvailability(space);
                        const isLowestPrice = space.pricePerHour === minPrice;
                        const isFastestSpeed = space.internetSpeedMbps === maxSpeed && maxSpeed > 100;
                        const isHighestRating = space.rating === maxRating;

                        return (
                          <div
                            key={space.id}
                            className="bg-[#18201B] border border-[#232D28] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-5 relative group hover:border-[#00C878]/50 transition-all shadow-lg"
                          >
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removeSpaceFromCompare(space.id)}
                              className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 hover:bg-[#FF5C5C]/20 text-[#718079] hover:text-[#FF8585] transition-colors z-20 cursor-pointer"
                              title="Remove from comparison"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            {/* Header: Photo + Badges */}
                            <div className="space-y-3">
                              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#121614]">
                                <img
                                  src={space.featuredImage}
                                  alt={space.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                
                                {/* Top Category Tag */}
                                <div className="absolute top-2.5 left-2.5">
                                  <span className="px-2 py-0.5 rounded-md bg-[#0D0D0D]/85 backdrop-blur-md text-[10px] font-mono font-bold uppercase text-[#00C878] border border-[#232D28]">
                                    {space.category.toUpperCase()}
                                  </span>
                                </div>

                                {/* Bottom Live Availability */}
                                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-[#F2F2F2]">
                                  <span className="flex items-center space-x-1 bg-[#0D0D0D]/80 backdrop-blur-md px-2 py-0.5 rounded-md font-mono text-[#00C878]">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00C878] animate-pulse" />
                                    <span>{availability.statusLabel}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Title & Location */}
                              <div className="space-y-1">
                                <h4
                                  onClick={() => handleViewDetails(space.id)}
                                  className="text-sm sm:text-base font-bold text-[#F2F2F2] hover:text-[#00C878] cursor-pointer transition-colors line-clamp-1"
                                >
                                  {space.title}
                                </h4>
                                <div className="flex items-center space-x-1 text-xs text-[#718079]">
                                  <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                                  <span className="truncate">{space.neighborhood}, {space.city}</span>
                                </div>
                              </div>

                              {/* Smart Match Score & Best For Tag */}
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="p-2.5 rounded-xl bg-[#121E18] border border-[#00C878]/40 flex flex-col justify-center">
                                  <div className="text-[10px] font-mono font-semibold uppercase text-[#718079]">
                                    Smart Match
                                  </div>
                                  <div className="flex items-center space-x-1.5 text-[#00C878] font-mono font-black text-sm sm:text-base">
                                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                    <span>{smartScore}%</span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-[#141816] border border-[#232D28] flex flex-col justify-center">
                                  <div className="text-[10px] font-mono font-semibold uppercase text-[#718079]">
                                    Best For
                                  </div>
                                  <div className="text-xs font-bold text-[#F2F2F2] truncate">
                                    {bestForTag}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Section 1: PRICING */}
                            {(() => {
                              const spacePricing = getSpacePricing(space);
                              return (
                                <div className="space-y-2 pt-2 border-t border-[#232D28]">
                                  <div className="text-[11px] font-mono font-bold uppercase text-[#718079] tracking-wider">
                                    Rates &amp; Pricing
                                  </div>
                                  <div className="flex items-baseline justify-between p-2 rounded-xl bg-[#141816] border border-[#232D28]">
                                    <span className="text-xs text-[#9EABA3]">
                                      {spacePricing.basis === 'person' ? 'Per Person' : 'Base Rate'}
                                    </span>
                                    <div className="flex items-center space-x-1.5">
                                      {isLowestPrice && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00C878]/20 text-[#00C878] uppercase">
                                          Lowest
                                        </span>
                                      )}
                                      <span className="text-sm font-mono font-bold text-[#00C878]">
                                        {formatPrice(spacePricing.rate)}/{spacePricing.period}
                                      </span>
                                    </div>
                                  </div>
                                  {space.pricePerDay && spacePricing.period === 'hour' && (
                                    <div className="flex items-baseline justify-between p-2 rounded-xl bg-[#141816] border border-[#232D28]">
                                      <span className="text-xs text-[#9EABA3]">Full Day Pass</span>
                                      <span className="text-xs font-mono font-bold text-[#F2F2F2]">
                                        {formatPrice(space.pricePerDay)}/day
                                      </span>
                                    </div>
                                  )}
                                  {spacePricing.sessionDurationHours && (
                                    <div className="flex items-baseline justify-between p-2 rounded-xl bg-[#141816] border border-[#232D28]">
                                      <span className="text-xs text-[#9EABA3]">Session Duration</span>
                                      <span className="text-xs font-mono font-bold text-[#00C878]">
                                        {spacePricing.sessionDurationHours} hours / block
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Section 2: PERFORMANCE SPECS */}
                            <div className="space-y-2 pt-2 border-t border-[#232D28]">
                              <div className="text-[11px] font-mono font-bold uppercase text-[#718079] tracking-wider">
                                Power &amp; Connectivity
                              </div>
                              
                              {/* Internet Speed */}
                              <div className="flex items-center justify-between p-2 rounded-xl bg-[#141816] border border-[#232D28]">
                                <div className="flex items-center space-x-1.5 text-xs text-[#9EABA3]">
                                  <Wifi className="w-3.5 h-3.5 text-[#00C878]" />
                                  <span>Internet Speed</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  {isFastestSpeed && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00C878]/20 text-[#00C878] uppercase">
                                      Fastest
                                    </span>
                                  )}
                                  <span className="text-xs font-mono font-bold text-[#F2F2F2]">
                                    {space.internetSpeedMbps} Mbps
                                  </span>
                                </div>
                              </div>

                              {/* Internet ISP / Connection Type */}
                              <div className="flex items-center justify-between p-2 rounded-xl bg-[#141816] border border-[#232D28]">
                                <span className="text-xs text-[#9EABA3]">Connection Type</span>
                                <span className="text-[11px] font-semibold text-[#F2F2F2] truncate max-w-[140px]">
                                  {space.internetIsp || 'Dedicated Fiber'}
                                </span>
                              </div>

                              {/* Power Backup */}
                              <div className="flex items-center justify-between p-2 rounded-xl bg-[#141816] border border-[#232D28]">
                                <div className="flex items-center space-x-1.5 text-xs text-[#9EABA3]">
                                  <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                                  <span>24/7 Power Backup</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-[#00C878]">
                                  {space.powerUptimeGuaranteePercent || 99.8}% Uptime
                                </span>
                              </div>
                            </div>

                            {/* Section 3: CAPACITY & NOISE */}
                            <div className="space-y-2 pt-2 border-t border-[#232D28]">
                              <div className="text-[11px] font-mono font-bold uppercase text-[#718079] tracking-wider">
                                Capacity &amp; Environment
                              </div>

                              <div className="flex items-center justify-between p-2 rounded-xl bg-[#141816] border border-[#232D28]">
                                <div className="flex items-center space-x-1.5 text-xs text-[#9EABA3]">
                                  <Users className="w-3.5 h-3.5 text-[#00C878]" />
                                  <span>Capacity</span>
                                </div>
                                <span className="text-xs font-bold text-[#F2F2F2]">
                                  {space.capacity} {space.capacity === 1 ? 'Desk' : 'Seats'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between p-2 rounded-xl bg-[#141816] border border-[#232D28]">
                                <div className="flex items-center space-x-1.5 text-xs text-[#9EABA3]">
                                  <Volume2 className="w-3.5 h-3.5 text-[#718079]" />
                                  <span>Noise Level</span>
                                </div>
                                <span className="text-[11px] font-semibold text-[#F2F2F2]">
                                  {space.noiseLevel || 'Focused / Moderate'}
                                </span>
                              </div>
                            </div>

                            {/* Section 4: KEY AMENITIES CHECKLIST */}
                            <div className="space-y-2 pt-2 border-t border-[#232D28]">
                              <div className="text-[11px] font-mono font-bold uppercase text-[#718079] tracking-wider">
                                Amenities Checklist
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 text-xs">
                                {/* Parking */}
                                <div className={`p-2 rounded-xl flex items-center space-x-1.5 border ${
                                  (space.amenities || []).some(a => a && a.toLowerCase().includes('parking'))
                                    ? 'bg-[#121E18] text-[#00C878] border-[#00C878]/30'
                                    : 'bg-[#141816] text-[#718079] border-[#232D28]'
                                }`}>
                                  <Car className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate text-[11px]">Free Parking</span>
                                </div>

                                {/* Air Conditioning */}
                                <div className={`p-2 rounded-xl flex items-center space-x-1.5 border ${
                                  (space.amenities || []).some(a => a && (a.toLowerCase().includes('ac') || a.toLowerCase().includes('air') || a.toLowerCase().includes('conditioning')))
                                    ? 'bg-[#121E18] text-[#00C878] border-[#00C878]/30'
                                    : 'bg-[#141816] text-[#718079] border-[#232D28]'
                                }`}>
                                  <Wind className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate text-[11px]">Full AC</span>
                                </div>

                                {/* Coffee */}
                                <div className={`p-2 rounded-xl flex items-center space-x-1.5 border ${
                                  (space.amenities || []).some(a => a && (a.toLowerCase().includes('coffee') || a.toLowerCase().includes('tea') || a.toLowerCase().includes('cafe')))
                                    ? 'bg-[#121E18] text-[#00C878] border-[#00C878]/30'
                                    : 'bg-[#141816] text-[#718079] border-[#232D28]'
                                }`}>
                                  <Coffee className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate text-[11px]">Coffee / Tea</span>
                                </div>

                                {/* Accessibility */}
                                <div className={`p-2 rounded-xl flex items-center space-x-1.5 border ${
                                  (space.amenities || []).some(a => a && (a.toLowerCase().includes('access') || a.toLowerCase().includes('wheelchair') || a.toLowerCase().includes('elevator') || a.toLowerCase().includes('ramp')))
                                    ? 'bg-[#121E18] text-[#00C878] border-[#00C878]/30'
                                    : 'bg-[#141816] text-[#718079] border-[#232D28]'
                                }`}>
                                  <Accessibility className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate text-[11px]">Step-Free</span>
                                </div>
                              </div>
                            </div>

                            {/* Section 5: REPUTATION & HOURS */}
                            <div className="space-y-2 pt-2 border-t border-[#232D28]">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#9EABA3]">Rating &amp; Reviews</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3.5 h-3.5 fill-[#00C878] text-[#00C878]" />
                                  <span className="font-bold text-[#F2F2F2]">{space.rating}</span>
                                  <span className="text-[#718079]">({space.reviewsCount})</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#9EABA3]">Operating Hours</span>
                                <span className="text-[11px] font-mono text-[#F2F2F2]">
                                  {space.operatingHours?.open || '08:00'} - {space.operatingHours?.close || '20:00'}
                                </span>
                              </div>
                            </div>

                            {/* CTAs */}
                            <div className="pt-3 border-t border-[#232D28] space-y-2">
                              <button
                                type="button"
                                onClick={() => handleBook(space)}
                                className="w-full py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md active:scale-98 cursor-pointer"
                              >
                                <span>Book This Workspace</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleViewDetails(space.id)}
                                className="w-full py-2 rounded-xl bg-[#141816] hover:bg-[#1A201D] border border-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] transition-colors cursor-pointer"
                              >
                                View Listing Details
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add another workspace CTA if count === 2 */}
                  {count === 2 && (
                    <div className="p-4 rounded-2xl bg-[#18201B] border border-dashed border-[#2E3B34] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-[#9EABA3]">
                        You can compare <strong>1 more workspace</strong> (up to 3 total).
                      </div>
                      <div className="flex items-center space-x-2">
                        {suggestedSpaces.slice(0, 2).map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => addSpaceToCompare(s.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#141816] hover:bg-[#00C878] text-[#9EABA3] hover:text-[#0D0D0D] border border-[#232D28] text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add {s.title.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 3. MODAL FOOTER                                                           */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-[#1E2522] bg-[#141816]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-0 z-30">
          <div className="flex items-center space-x-2 text-xs text-[#718079]">
            <ShieldCheck className="w-4 h-4 text-[#00C878]" />
            <span>All workspaces audited for continuous 24/7 power, verified internet &amp; digital access pass</span>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {count > 0 && (
              <button
                type="button"
                onClick={clearCompareList}
                className="px-3 py-2 rounded-xl text-[#718079] hover:text-[#FF8585] text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCompareModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-bold text-[#F2F2F2] transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
