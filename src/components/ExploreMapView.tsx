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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#111827] flex flex-col transition-colors">
      {/* Map Header */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#374151] py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentView('explore')}
          className="flex items-center space-x-2 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#16A34A] dark:hover:text-[#16A34A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List View</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#16A34A]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="font-bold">{spaces.length} Spaces Around Me</span>
        </div>
      </div>

      {/* Interactive Map Surface */}
      <div className="relative flex-1 min-h-[500px] w-full bg-[#F1F5F9] dark:bg-[#0D1117] overflow-hidden flex flex-col justify-between">
        
        {/* Stylized Nigeria Map Canvas with grid */}
        <div className="absolute inset-0 bg-[#F1F5F9] dark:bg-[#0F172A]">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 opacity-20 dark:opacity-15 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Empty State Overlay */}
          {spaces.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
              <div className="p-8 rounded-3xl bg-white/95 dark:bg-[#1F2937]/95 border border-[#E5E7EB] dark:border-[#374151] text-center space-y-4 max-w-sm backdrop-blur-md shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] flex items-center justify-center mx-auto text-[#6B7280] dark:text-[#9CA3AF]">
                  <Search className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">No Workspaces Found</h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    No verified hubs match your active filters on the map. Try resetting your search filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
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
                    ? 'bg-[#16A34A] text-white scale-115 z-20 ring-4 ring-[#16A34A]/30'
                    : 'bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A] z-10'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#16A34A] fill-[#16A34A]/20" />
                <span>{formatPrice(pricing.rate)}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Space Bottom Card Drawer */}
        {activeSpace && (
          <div className="relative z-20 max-w-xl mx-auto w-full p-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] shadow-xl flex items-center gap-4 transition-all">
              <img
                src={activeSpace.featuredImage}
                alt={activeSpace.title}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-[#E5E7EB] dark:border-[#374151]"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-[#16A34A]">
                  <span className="font-semibold">{activeSpace.neighborhood}, {activeSpace.city}</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    getSpaceAvailability(activeSpace).status === 'available_now'
                      ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A]'
                      : 'bg-[#F1F5F9] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}>
                    {getSpaceAvailability(activeSpace).statusLabel}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB] truncate">{activeSpace.title}</h4>

                <div className="flex items-baseline space-x-1">
                  <span className="text-base font-extrabold text-[#16A34A] font-mono">
                    {formatPrice(getSpacePricing(activeSpace).rate)}
                  </span>
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">/ {getSpacePricing(activeSpace).period}</span>
                </div>

                <div className="pt-1 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpaceId(activeSpace.id);
                      setCurrentView('details');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer transition-colors"
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
