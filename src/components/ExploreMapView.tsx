import React, { useState } from 'react';
import { 
  MapPin, 
  Compass, 
  Zap, 
  Wifi, 
  Star, 
  ArrowLeft, 
  ChevronRight,
  Layers,
  Search,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space } from '../types';
import { getSpaceAvailability } from '../utils/availability';
import { getSpacePricing, formatSpaceRate } from '../utils/pricing';

export const ExploreMapView: React.FC = () => {
  const { spaces, setSelectedSpaceId, setCurrentView, formatPrice, resetFilters } = useApp();
  const [activeSpace, setActiveSpace] = useState<Space | null>(spaces[0] || null);

  return (
    <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#07383D] flex flex-col transition-colors text-[#12383B] dark:text-white">
      {/* Map Header */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#07383D]/95 backdrop-blur-md border-b border-[#E2ECEB] dark:border-[#166D74] py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentView('explore')}
          className="flex items-center space-x-2 text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#FFA987] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#FFA987]" />
          <span>Back to List View</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#006B70] dark:text-[#28D2CB]">
          <span className="w-2 h-2 rounded-full bg-[#14BEB8] animate-pulse" />
          <span className="font-bold">{spaces.length} Spaces Around Me</span>
        </div>
      </div>

      {/* Interactive Map Surface */}
      <div className="relative flex-1 min-h-[500px] w-full bg-[#F3F7F7] dark:bg-[#05272B] overflow-hidden flex flex-col justify-between">
        
        {/* Stylized Nigeria Map Canvas with grid */}
        <div className="absolute inset-0 bg-[#F3F7F7] dark:bg-[#05272B]">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 opacity-20 dark:opacity-15 bg-[radial-gradient(#14BEB8_1px,transparent_1px)] dark:bg-[radial-gradient(#166D74_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Empty State Overlay */}
          {spaces.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
              <div className="p-8 rounded-3xl bg-white/95 dark:bg-[#0B4A50]/95 border border-[#E2ECEB] dark:border-[#166D74] text-center space-y-4 max-w-sm backdrop-blur-md shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-center mx-auto text-[#FFA987]">
                  <Search className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#12383B] dark:text-white">No Workspaces Found</h3>
                  <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                    No verified hubs match your active filters on the map. Try resetting your search filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Map Pins */}
          {spaces.map((space, index) => {
            const isSelected = activeSpace?.id === space.id;
            // Spread nodes stylistically for visual browsing
            const topOffset = 25 + (index * 12) % 60;
            const leftOffset = 20 + (index * 15) % 65;
            const pricing = getSpacePricing(space);

            return (
              <button
                key={space.id}
                type="button"
                onClick={() => setActiveSpace(space)}
                style={{ top: `${topOffset}%`, left: `${leftOffset}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isSelected
                    ? 'bg-[#006B70] text-white scale-115 z-20 ring-4 ring-[#FFA987]/50 border border-[#FFA987]'
                    : 'bg-white dark:bg-[#0B4A50] text-[#12383B] dark:text-white border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#FFA987] z-10'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#FFA987] fill-[#FFA987]/30" />
                <span>{formatPrice(pricing.rate)}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Space Bottom Card Drawer */}
        {activeSpace && (
          <div className="relative z-20 max-w-xl mx-auto w-full p-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-xl flex items-center gap-4 transition-all">
              <img
                src={activeSpace.featuredImage}
                alt={activeSpace.title}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-[#E2ECEB] dark:border-[#166D74]"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-[#006B70] dark:text-[#28D2CB]">
                  <span className="font-semibold">{activeSpace.neighborhood}, {activeSpace.city}</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    getSpaceAvailability(activeSpace).status === 'available_now'
                      ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/25 text-[#006B70] dark:text-[#28D2CB]'
                      : 'bg-black/5 dark:bg-white/5 text-[#5D7A7D] dark:text-[#B8D1D0]'
                  }`}>
                    {getSpaceAvailability(activeSpace).statusLabel}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#12383B] dark:text-white truncate">{activeSpace.title}</h4>

                <div className="flex items-baseline space-x-1">
                  <span className="text-base font-extrabold text-[#006B70] dark:text-[#28D2CB] font-mono">
                    {formatPrice(getSpacePricing(activeSpace).rate)}
                  </span>
                  <span className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">/ {getSpacePricing(activeSpace).period}</span>
                </div>

                <div className="pt-1 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpaceId(activeSpace.id);
                      setCurrentView('details');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>View Space</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
