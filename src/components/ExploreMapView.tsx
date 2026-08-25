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

export const ExploreMapView: React.FC = () => {
  const { spaces, setSelectedSpaceId, setCurrentView, formatPrice, resetFilters } = useApp();
  const [activeSpace, setActiveSpace] = useState<Space | null>(spaces[0] || null);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Map Header */}
      <div className="sticky top-16 z-30 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#1E2522] py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentView('explore')}
          className="flex items-center space-x-2 text-xs font-semibold text-[#9EABA3] hover:text-[#00C878] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List View</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#00C878]">
          <span className="w-2 h-2 rounded-full bg-[#00C878] animate-pulse" />
          <span>{spaces.length} Spaces Around Me</span>
        </div>
      </div>

      {/* Interactive Map Surface */}
      <div className="relative flex-1 min-h-[500px] w-full bg-[#121614] overflow-hidden flex flex-col justify-between">
        
        {/* Stylized Dark Nigeria Map Canvas */}
        <div className="absolute inset-0 bg-[#0D0D0D]">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#232D28_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Empty State Overlay */}
          {spaces.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
              <div className="p-8 rounded-3xl bg-[#141816]/95 border border-[#232D28] text-center space-y-4 max-w-sm backdrop-blur-md shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-[#18201B] border border-[#232D28] flex items-center justify-center mx-auto text-[#718079]">
                  <Search className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#F2F2F2]">No Workspaces Found</h3>
                  <p className="text-xs text-[#718079]">
                    No verified hubs match your active filters on the map. Try resetting your search filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-bold hover:bg-[#00E58B] transition-all inline-flex items-center space-x-1.5 cursor-pointer"
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

            return (
              <button
                key={space.id}
                type="button"
                onClick={() => setActiveSpace(space)}
                style={{ top: `${topOffset}%`, left: `${leftOffset}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all shadow-xl ${
                  isSelected
                    ? 'bg-[#00C878] text-[#0D0D0D] scale-125 z-20 ring-4 ring-[#00C878]/25'
                    : 'bg-[#18201B] text-[#F2F2F2] border border-[#232D28] hover:border-[#00C878] z-10'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{formatPrice(space.pricePerHour)}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Space Bottom Card Drawer */}
        {activeSpace && (
          <div className="relative z-20 max-w-xl mx-auto w-full p-4">
            <div className="p-4 rounded-3xl bg-[#141816] border border-[#232D28] shadow-2xl flex items-center gap-4">
              <img
                src={activeSpace.featuredImage}
                alt={activeSpace.title}
                className="w-24 h-24 rounded-2xl object-cover shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-[#00C878]">
                  <span>{activeSpace.neighborhood}, {activeSpace.city}</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.2 rounded ${
                    getSpaceAvailability(activeSpace).status === 'available_now'
                      ? 'bg-[#00C878]/20 text-[#00C878]'
                      : 'bg-[#1E2522] text-[#9EABA3]'
                  }`}>
                    {getSpaceAvailability(activeSpace).statusLabel}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#F2F2F2] truncate">{activeSpace.title}</h4>

                <div className="flex items-baseline space-x-1">
                  <span className="text-base font-extrabold text-[#00C878] font-mono">
                    {formatPrice(activeSpace.pricePerHour)}
                  </span>
                  <span className="text-xs text-[#718079]">/ hr</span>
                </div>

                <div className="pt-1 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpaceId(activeSpace.id);
                      setCurrentView('details');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-bold flex items-center space-x-1"
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
