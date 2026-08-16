import React, { useState } from 'react';
import {
  Monitor,
  Armchair,
  Sun,
  Volume2,
  Zap,
  Cable,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  Coffee,
  PhoneCall,
  DoorOpen,
  Users,
  Settings2,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Space, Desk, DeskStatus, DeskZone } from '../types';
import { useApp } from '../context/AppContext';

interface FloorPlanProps {
  space: Space;
  interactive?: boolean;
  onDeskSelect?: (desk: Desk) => void;
  selectedDeskId?: string;
  isHostMode?: boolean;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  space,
  interactive = true,
  onDeskSelect,
  selectedDeskId,
  isHostMode = false,
}) => {
  const {
    setSelectedDesk,
    setIsCheckoutModalOpen,
    updateDeskStatus,
    showToast,
    currentUser,
  } = useApp();

  const [hoveredDesk, setHoveredDesk] = useState<Desk | null>(null);
  const [activeTabZone, setActiveTabZone] = useState<string>('all');

  const spaceDesks = space?.desks || [];
  const selectedDesk = spaceDesks.find(d => d.id === selectedDeskId) || hoveredDesk || spaceDesks[0];

  const handleDeskClick = (desk: Desk) => {
    if (!interactive) return;

    if (onDeskSelect) {
      onDeskSelect(desk);
    } else {
      setSelectedDesk(desk);
    }
  };

  const handleQuickReserve = (desk: Desk, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (desk.status !== 'available' && !isHostMode) {
      showToast(`Station ${desk.code} is currently ${desk.status}. Please select an available pod.`, 'warning');
      return;
    }
    setSelectedDesk(desk);
    setIsCheckoutModalOpen(true);
  };

  const getStatusColor = (status: DeskStatus) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-[#063B2A]/40 hover:bg-[#063B2A]/70',
          border: 'border-[#00C878]/60',
          badge: 'bg-[#063B2A] text-[#00C878] border-[#00C878]/30',
          dot: 'bg-[#00C878]',
          label: 'Available Now',
        };
      case 'reserved':
        return {
          bg: 'bg-[#1C2833]/50 hover:bg-[#1C2833]/80',
          border: 'border-sky-500/40',
          badge: 'bg-[#1C2833] text-sky-400 border-sky-500/30',
          dot: 'bg-sky-400',
          label: 'Reserved',
        };
      case 'occupied':
        return {
          bg: 'bg-[#2A2010]/50 hover:bg-[#2A2010]/80',
          border: 'border-[#D6A83A]/40',
          badge: 'bg-[#2A2010] text-[#D6A83A] border-[#D6A83A]/30',
          dot: 'bg-[#D6A83A]',
          label: 'Occupied',
        };
      case 'maintenance':
        return {
          bg: 'bg-[#1F1F1F]',
          border: 'border-[#333333]',
          badge: 'bg-[#252525] text-[#9A9A9A] border-[#333333]',
          dot: 'bg-[#777777]',
          label: 'Maintenance',
        };
    }
  };

  const getZoneBadge = (zone: DeskZone) => {
    switch (zone) {
      case 'quiet':
        return { label: 'Quiet Library', color: 'bg-[#063B2A] text-[#00C878] border-[#00C878]/30' };
      case 'window':
        return { label: 'Natural Light', color: 'bg-[#1C2833] text-sky-400 border-sky-500/30' };
      case 'collaborative':
        return { label: 'Collaborative Hub', color: 'bg-[#2A2010] text-[#D6A83A] border-[#D6A83A]/30' };
      case 'standing':
        return { label: 'Standing Ergonomic', color: 'bg-[#1A2E26] text-[#00C878] border-[#00C878]/30' };
      case 'executive':
        return { label: 'Executive Pod', color: 'bg-[#251E33] text-purple-400 border-purple-500/30' };
    }
  };

  const filteredDesks = activeTabZone === 'all'
    ? spaceDesks
    : spaceDesks.filter(d => d.zone === activeTabZone);

  const availableCount = spaceDesks.filter(d => d.status === 'available').length;
  const occupiedCount = spaceDesks.filter(d => d.status === 'occupied').length;
  const reservedCount = spaceDesks.filter(d => d.status === 'reserved').length;

  return (
    <div className="bg-[#171717] rounded-3xl border border-[#282828] shadow-xl overflow-hidden text-white">
      {/* Floor Plan Header */}
      <div className="p-4 sm:p-6 border-b border-[#262626] bg-[#121212]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                Interactive Layout & Station Selector
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#063B2A] text-[#00C878] border border-[#00C878]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C878] animate-pulse"></span>
                {availableCount} Available
              </span>
            </div>
            <p className="text-xs text-[#9A9A9A] mt-0.5 font-normal">
              Click any station on the architectural layout to inspect equipment, power outlets, and live status.
            </p>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C878]"></span>
              <span className="text-[#9A9A9A] font-medium">Available ({availableCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span className="text-[#9A9A9A] font-medium">Reserved ({reservedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D6A83A]"></span>
              <span className="text-[#9A9A9A] font-medium">Occupied ({occupiedCount})</span>
            </div>
          </div>
        </div>

        {/* Zone Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-wider whitespace-nowrap">Zone:</span>
          {['all', 'quiet', 'window', 'collaborative', 'standing'].map(zoneKey => (
            <button
              key={zoneKey}
              onClick={() => setActiveTabZone(zoneKey)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTabZone === zoneKey
                  ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm'
                  : 'bg-[#202020] text-[#9A9A9A] hover:bg-[#2A2A2A] hover:text-white border border-[#2D2D2D]'
              }`}
            >
              {zoneKey === 'all' ? 'All Stations' : zoneKey.charAt(0).toUpperCase() + zoneKey.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floor Plan Stage + Detail Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#262626]">
        {/* Left / Center Floor Plan Grid Map */}
        <div className="lg:col-span-7 xl:col-span-8 p-4 sm:p-6 bg-[#0D0D0D] flex flex-col justify-between">
          {/* Facility Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#171717] border border-[#282828] text-xs text-stone-200">
              <Coffee className="w-4 h-4 text-[#D6A83A] shrink-0" />
              <div className="truncate">
                <span className="font-bold block truncate">Coffee Lounge</span>
                <span className="text-[10px] text-[#9A9A9A]">Complimentary</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#171717] border border-[#282828] text-xs text-stone-200">
              <PhoneCall className="w-4 h-4 text-[#00C878] shrink-0" />
              <div className="truncate">
                <span className="font-bold block truncate">Phone Booths</span>
                <span className="text-[10px] text-[#9A9A9A]">Soundproof</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#171717] border border-[#282828] text-xs text-stone-200">
              <Users className="w-4 h-4 text-[#00C878] shrink-0" />
              <div className="truncate">
                <span className="font-bold block truncate">Meeting Pods</span>
                <span className="text-[10px] text-[#9A9A9A]">4K AirPlay</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#171717] border border-[#282828] text-xs text-stone-200">
              <DoorOpen className="w-4 h-4 text-[#00C878] shrink-0" />
              <div className="truncate">
                <span className="font-bold block truncate">Smart Entry</span>
                <span className="text-[10px] text-[#9A9A9A]">Turnstile PIN</span>
              </div>
            </div>
          </div>

          {/* Architectural Desks Grid Canvas */}
          <div className="bg-[#141414] p-4 sm:p-6 rounded-2xl border border-dashed border-[#2D2D2D]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider mb-4">
              <span>Primary Workspace Zone</span>
              <span className="flex items-center gap-1 text-[#D6A83A]">
                <Sun className="w-3.5 h-3.5" /> High Natural Light
              </span>
            </div>

            {/* Grid of Desks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredDesks.map(desk => {
                const statusStyle = getStatusColor(desk.status);
                const isSelected = (selectedDeskId === desk.id) || (selectedDesk?.id === desk.id);

                return (
                  <div
                    key={desk.id}
                    id={`floorplan-desk-${desk.code}`}
                    onClick={() => handleDeskClick(desk)}
                    onMouseEnter={() => setHoveredDesk(desk)}
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer select-none group flex flex-col justify-between min-h-[110px] ${
                      statusStyle.bg
                    } ${
                      isSelected
                        ? 'border-[#00C878] ring-2 ring-[#00C878]/30 shadow-lg scale-[1.02] z-10 bg-[#1A1A1A]'
                        : `${statusStyle.border} hover:border-[#00C878]/40`
                    }`}
                  >
                    {/* Desk Code & Status Dot */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-white">
                        {desk.code}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot} ${desk.status === 'available' ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Desk Mini Equipment Preview */}
                    <div className="my-1.5">
                      <div className="text-[11px] font-bold text-white line-clamp-1">
                        {desk.name.split('(')[1]?.replace(')', '') || desk.zone}
                      </div>
                      <div className="text-[10px] text-[#9A9A9A] truncate flex items-center gap-1 mt-0.5">
                        <Monitor className="w-3 h-3 text-[#00C878] shrink-0" />
                        <span className="truncate">{desk.standingMotorized ? 'Standing' : 'Standard'} • {desk.monitorSetup.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Occupant Avatar or Reserve Pill */}
                    <div className="pt-1 border-t border-[#262626] flex items-center justify-between text-[10px]">
                      {desk.status === 'occupied' && desk.currentOccupant ? (
                        <span className="text-[#D6A83A] font-medium flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> In Session
                        </span>
                      ) : desk.status === 'reserved' ? (
                        <span className="text-sky-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Booked
                        </span>
                      ) : desk.status === 'maintenance' ? (
                        <span className="text-[#9A9A9A] font-medium">Service</span>
                      ) : (
                        <span className="text-[#00C878] font-bold flex items-center gap-1 group-hover:underline">
                          <CheckCircle2 className="w-3 h-3 text-[#00C878]" /> Ready
                        </span>
                      )}

                      <span className="text-[9px] font-bold uppercase text-[#9A9A9A]">
                        {desk.zone.slice(0, 4)}
                      </span>
                    </div>

                    {/* Hover quick action overlay on available desks */}
                    {desk.status === 'available' && !isHostMode && (
                      <button
                        onClick={(e) => handleQuickReserve(desk, e)}
                        className="absolute inset-0 bg-[#0D0D0D]/95 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center shadow-lg cursor-pointer"
                      >
                        <span className="text-xs font-black flex items-center gap-1 text-[#00C878]">
                          Reserve Station <ArrowRight className="w-3 h-3" />
                        </span>
                        <span className="text-[10px] text-[#9A9A9A]">Instant Pass</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider mt-4">
              <span>Main Reception & Security</span>
              <span className="text-[#00C878]">High-Speed Starlink Backbone</span>
            </div>
          </div>
        </div>

        {/* Right Desk Inspector & Real-Time Specifications Panel */}
        <div className="lg:col-span-5 xl:col-span-4 p-5 sm:p-6 bg-[#171717] flex flex-col justify-between">
          {selectedDesk ? (
            <div className="space-y-5">
              {/* Selected Desk Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-[#00C878] px-2.5 py-1 bg-[#063B2A] rounded-xl border border-[#00C878]/30">
                      {selectedDesk.code}
                    </span>
                    <div>
                      <h4 className="font-black text-white text-sm">{selectedDesk.name}</h4>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getZoneBadge(selectedDesk.zone).color}`}>
                        {getZoneBadge(selectedDesk.zone).label}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(selectedDesk.status).badge}`}>
                    {getStatusColor(selectedDesk.status).label}
                  </span>
                </div>
              </div>

              {/* Desk Specifications Grid */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#9A9A9A] uppercase tracking-wider">
                  Hardware & Ergonomics Specs
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#1F1F1F] border border-[#2D2D2D]">
                    <Monitor className="w-4 h-4 text-[#00C878] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Display Setup</div>
                      <div className="text-[#9A9A9A] text-[11px] font-normal">{selectedDesk.monitorSetup}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#1F1F1F] border border-[#2D2D2D]">
                    <Armchair className="w-4 h-4 text-[#00C878] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Seating & Desk Type</div>
                      <div className="text-[#9A9A9A] text-[11px] font-normal">
                        {selectedDesk.chairType} • {selectedDesk.standingMotorized ? 'Motorized Standing Desk' : 'Fixed Desk'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1F1F1F] border border-[#2D2D2D]">
                      <Sun className="w-4 h-4 text-[#D6A83A] shrink-0" />
                      <div>
                        <div className="font-bold text-white">Daylight</div>
                        <div className="text-[11px] text-[#D6A83A]">{'★'.repeat(selectedDesk.daylightRating)}{'☆'.repeat(5 - selectedDesk.daylightRating)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1F1F1F] border border-[#2D2D2D]">
                      <Volume2 className="w-4 h-4 text-[#00C878] shrink-0" />
                      <div>
                        <div className="font-bold text-white">Noise Level</div>
                        <div className="text-[11px] text-[#9A9A9A] truncate font-normal">{selectedDesk.noiseLevel}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1F1F1F] border border-[#2D2D2D] text-stone-200">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                      <span>{selectedDesk.hasPowerOutlet ? 'Surge Protected' : 'No outlet'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <Cable className="w-3.5 h-3.5 text-sky-400" />
                      <span>{selectedDesk.hasLanCable ? '1Gbps LAN Port' : 'Starlink Wi-Fi'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coworker Action Button */}
              {!isHostMode && (
                <div className="pt-2">
                  {selectedDesk.status === 'available' ? (
                    <button
                      id={`reserve-desk-cta-btn-${selectedDesk.code}`}
                      onClick={() => handleQuickReserve(selectedDesk)}
                      className="w-full py-3 px-4 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#0D0D0D]" />
                      <span>Reserve Station {selectedDesk.code}</span>
                      <ArrowRight className="w-4 h-4 text-[#0D0D0D]" />
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#202020] border border-[#2D2D2D] text-center text-xs text-[#9A9A9A] flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4 text-[#9A9A9A]" />
                      <span>Station {selectedDesk.code} is currently {selectedDesk.status}.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#9A9A9A]">
              <Armchair className="w-10 h-10 mb-2 opacity-30 text-[#00C878]" />
              <p className="text-xs font-medium">Select a station on the layout to inspect specs & availability</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
