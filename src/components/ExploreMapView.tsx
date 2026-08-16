import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  MapPin,
  Star,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Maximize2,
  Minimize2,
  Navigation,
  Globe,
  CheckCircle2,
  Monitor,
  Wifi,
  Sparkles,
  ArrowRight,
  X,
  Building2,
  ChevronRight,
  LocateFixed,
  Sliders,
  Eye,
  Video,
  Camera,
  Mic,
  Zap,
  Briefcase,
  Search,
  BatteryCharging,
  Shield
} from 'lucide-react';
import { Space } from '../types';
import { useApp } from '../context/AppContext';

interface ExploreMapViewProps {
  spaces: Space[];
  onSelectSpace: (space: Space) => void;
  selectedSpaceId?: string | null;
  height?: string;
  isFullWidth?: boolean;
}

// Preset City Centers across Nigeria with spatial coordinates
const NIGERIAN_CITY_PRESETS: {
  name: string;
  label: string;
  sublabel: string;
  lat: number;
  lng: number;
  zoom: number;
  flag: string;
}[] = [
  { name: 'all', label: 'All Nigeria', sublabel: 'Nationwide', lat: 7.6, lng: 6.2, zoom: 3.4, flag: '🇳🇬' },
  { name: 'Lagos', label: 'Lagos', sublabel: 'Lekki, VI & Yaba', lat: 6.465, lng: 3.42, zoom: 6.5, flag: '🌊' },
  { name: 'Abuja', label: 'Abuja (FCT)', sublabel: 'Maitama & Wuse 2', lat: 9.08, lng: 7.48, zoom: 6.5, flag: '🏛️' },
  { name: 'Port Harcourt', label: 'Port Harcourt', sublabel: 'GRA Phase 2', lat: 4.82, lng: 7.05, zoom: 6.5, flag: '🛢️' },
  { name: 'Ibadan', label: 'Ibadan', sublabel: 'Bodija & Ring Road', lat: 7.42, lng: 3.91, zoom: 6.5, flag: '🌳' },
];

export const ExploreMapView: React.FC<ExploreMapViewProps> = ({
  spaces,
  onSelectSpace,
  selectedSpaceId,
  height = '620px',
  isFullWidth = false,
}) => {
  const { formatPrice, currentCurrency, setSelectedSpace } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);

  // Map viewport state centered on Nigeria
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 7.6, lng: 6.2 });
  const [zoom, setZoom] = useState<number>(3.4);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startCenter, setStartCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  // Active space card in map drawer
  const [hoveredSpace, setHoveredSpace] = useState<Space | null>(null);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [showDensityOverlay, setShowDensityOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 600,
  });

  // Track container size dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 900,
          height: containerRef.current.clientHeight || 600,
        });
      }
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isFullscreen]);

  // Spherical Web Mercator Projection Math
  const projectCoordinates = useCallback(
    (lat: number, lng: number): { x: number; y: number; isVisible: boolean } => {
      const { width, height } = dimensions;

      // Base scale factor based on zoom
      const mapScale = 256 * Math.pow(2, zoom);

      // Longitude to X
      const lngX = ((lng + 180) / 360) * mapScale;
      const centerLngX = ((center.lng + 180) / 360) * mapScale;

      // Latitude to Y using Mercator
      const latRad = (lat * Math.PI) / 180;
      const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
      const latY = (1 - mercN / Math.PI) * (mapScale / 2);

      const centerLatRad = (center.lat * Math.PI) / 180;
      const centerMercN = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));
      const centerLatY = (1 - centerMercN / Math.PI) * (mapScale / 2);

      const screenX = width / 2 + (lngX - centerLngX);
      const screenY = height / 2 + (latY - centerLatY);

      const isVisible = screenX >= -100 && screenX <= width + 100 && screenY >= -100 && screenY <= height + 100;

      return { x: screenX, y: screenY, isVisible };
    },
    [center, zoom, dimensions]
  );

  // Dragging handlers for smooth pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-map-control')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartCenter({ lat: center.lat, lng: center.lng });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const scale = 256 * Math.pow(2, zoom);
    const dLng = -(dx / scale) * 360;
    const dLat = (dy / scale) * 180;

    setCenter({
      lat: Math.max(3.0, Math.min(14.5, startCenter.lat + dLat)),
      lng: Math.max(1.5, Math.min(15.5, startCenter.lng + dLng)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom wheel handling - allow normal page scroll unless user holds Ctrl/Cmd or map is in fullscreen
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || isFullscreen) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom(prev => Math.max(2.8, Math.min(7.8, prev + delta)));
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(2.8, Math.min(7.8, prev + delta)));
  };

  const handleJumpToCity = (preset: typeof NIGERIAN_CITY_PRESETS[0]) => {
    setCenter({ lat: preset.lat, lng: preset.lng });
    setZoom(preset.zoom);
  };

  const handleFitAll = () => {
    setCenter({ lat: 7.6, lng: 6.2 });
    setZoom(3.4);
    setActiveSpace(null);
  };

  // Filter spaces based on category and search
  const visibleMapSpaces = useMemo(() => {
    return (spaces || []).filter(space => {
      if (activeCategoryFilter !== 'all') {
        const target = activeCategoryFilter.toLowerCase();
        const subcat = (space.subcategory || '').toLowerCase();
        const primary = (space.primaryCategory || '').toLowerCase();
        const cat = ((space as any).category || '').toLowerCase();
        const type = (space.type || '').toLowerCase();
        
        const match =
          subcat.includes(target) ||
          target.includes(subcat) ||
          primary.includes(target) ||
          target.includes(primary) ||
          cat.includes(target) ||
          target.includes(cat) ||
          type.includes(target);

        if (!match) return false;
      }
      if (mapSearchQuery.trim()) {
        const q = mapSearchQuery.toLowerCase();
        const matchName = (space.name || '').toLowerCase().includes(q);
        const matchCity = (space.city || '').toLowerCase().includes(q);
        const matchNeigh = (space.neighborhood || '').toLowerCase().includes(q);
        const matchAmenity = (space.amenities || []).some(a => (a || '').toLowerCase().includes(q));
        if (!matchName && !matchCity && !matchNeigh && !matchAmenity) return false;
      }
      return true;
    });
  }, [spaces, activeCategoryFilter, mapSearchQuery]);

  // Nigerian City Clusters
  const cityClusters = useMemo(() => {
    const map = new Map<string, { city: string; lat: number; lng: number; count: number; totalOpenDesks: number; spaces: Space[] }>();

    (visibleMapSpaces || []).forEach(space => {
      if (!space.city || !space.coordinates) return;
      const existing = map.get(space.city);
      const openDesks = (space.desks || []).filter(d => d.status === 'available').length;

      if (!existing) {
        map.set(space.city, {
          city: space.city,
          lat: space.coordinates.lat,
          lng: space.coordinates.lng,
          count: 1,
          totalOpenDesks: openDesks,
          spaces: [space],
        });
      } else {
        existing.count += 1;
        existing.totalOpenDesks += openDesks;
        existing.spaces.push(space);
      }
    });

    return Array.from(map.values());
  }, [visibleMapSpaces]);

  // Total Open Desks
  const totalOpenDesks = useMemo(() => {
    return (visibleMapSpaces || []).reduce((sum, sp) => sum + (sp.desks || []).filter(d => d.status === 'available').length, 0);
  }, [visibleMapSpaces]);

  // Sync when selectedSpaceId prop changes
  useEffect(() => {
    if (selectedSpaceId) {
      const target = spaces.find(s => s.id === selectedSpaceId);
      if (target) {
        setActiveSpace(target);
        setCenter({ lat: target.coordinates.lat, lng: target.coordinates.lng });
        if (zoom < 5.0) setZoom(6.2);
      }
    }
  }, [selectedSpaceId, spaces]);

  // Quick category tags
  const mapCategories = [
    { id: 'all', label: 'All Spaces' },
    { id: 'coworking_hotdesk', label: '💻 Desks', icon: Briefcase },
    { id: 'private_office', label: '🏢 Offices', icon: Building2 },
    { id: 'podcast_studio', label: '🎙️ Podcasts', icon: Mic },
    { id: 'photography_studio', label: '📸 Studios', icon: Camera },
    { id: 'creator_studio', label: '🎥 Content', icon: Video },
    { id: 'meeting_room', label: '👥 Boardrooms', icon: Sparkles },
  ];

  return (
    <div
      ref={containerRef}
      id="explore-map-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ height: isFullscreen ? '100vh' : height }}
      className={`relative w-full rounded-3xl overflow-hidden border border-[#282828] shadow-xl select-none bg-[#0D0D0D] text-white transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Background Cartography & Topographic Nigeria Canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle coordinate dot matrix */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00C878_1.5px,transparent_1.5px)] [background-size:28px_28px]" />

        {/* Dynamic Vector Map & Nigerian Landmarks */}
        <svg className="w-full h-full absolute inset-0">
          <defs>
            <radialGradient id="oceanGrad" cx="50%" cy="100%" r="80%">
              <stop offset="0%" stopColor="#063B2A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0D0D0D" stopOpacity="0.0" />
            </radialGradient>
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#063B2A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00C878" stopOpacity="0.9" />
            </linearGradient>
            <pattern id="naijaGrid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#1F1F1F" strokeWidth="1" opacity="0.6" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#naijaGrid)" />

          {/* Atlantic Ocean / Gulf of Guinea Coastal Water Body */}
          {(() => {
            const coastPoint = projectCoordinates(4.2, 5.5);
            if (coastPoint.y < dimensions.height + 200) {
              return (
                <rect
                  x="0"
                  y={Math.max(0, coastPoint.y)}
                  width={dimensions.width}
                  height={Math.max(0, dimensions.height - coastPoint.y)}
                  fill="url(#oceanGrad)"
                />
              );
            }
            return null;
          })()}

          {/* Approximate Niger & Benue River Confluence Paths */}
          {(() => {
            const riverNW = projectCoordinates(10.5, 4.2); // River Niger North-West
            const riverConf = projectCoordinates(7.8, 6.7); // Lokoja Confluence
            const riverNE = projectCoordinates(9.3, 11.8);  // River Benue North-East
            const riverDelta = projectCoordinates(4.6, 6.2); // Niger Delta Coast

            return (
              <g opacity="0.4" stroke="url(#riverGrad)" fill="none" strokeLinecap="round">
                <path
                  d={`M ${riverNW.x} ${riverNW.y} Q ${(riverNW.x + riverConf.x) / 2 + 20} ${(riverNW.y + riverConf.y) / 2} ${riverConf.x} ${riverConf.y}`}
                  strokeWidth="2.5"
                />
                <path
                  d={`M ${riverNE.x} ${riverNE.y} Q ${(riverNE.x + riverConf.x) / 2} ${(riverNE.y + riverConf.y) / 2 - 10} ${riverConf.x} ${riverConf.y}`}
                  strokeWidth="2.5"
                />
                <path
                  d={`M ${riverConf.x} ${riverConf.y} Q ${(riverConf.x + riverDelta.x) / 2 - 15} ${(riverConf.y + riverDelta.y) / 2} ${riverDelta.x} ${riverDelta.y}`}
                  strokeWidth="3.5"
                />
              </g>
            );
          })()}

          {/* Regional Hub Density Pulse Waves */}
          {showDensityOverlay &&
            cityClusters.map(cluster => {
              const pos = projectCoordinates(cluster.lat, cluster.lng);
              if (!pos.isVisible) return null;
              const radius = Math.max(32, Math.min(130, 24 * zoom));

              return (
                <g key={`density-${cluster.city}`} className="transition-all duration-300">
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill="rgba(0, 200, 120, 0.08)"
                    stroke="rgba(0, 200, 120, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius * 0.45}
                    fill="rgba(0, 200, 120, 0.15)"
                  />
                </g>
              );
            })}

          {/* Nigerian Region / Landmark Text Labels */}
          {(() => {
            const lagosCoord = projectCoordinates(6.45, 3.42);
            const abujaCoord = projectCoordinates(9.08, 7.48);
            const phCoord = projectCoordinates(4.82, 7.05);
            const ibadanCoord = projectCoordinates(7.42, 3.91);
            const oceanCoord = projectCoordinates(3.6, 5.5);

            return (
              <g className="text-[11px] font-black uppercase tracking-widest fill-[#9A9A9A] opacity-60 select-none">
                {lagosCoord.isVisible && (
                  <text x={lagosCoord.x - 30} y={lagosCoord.y + 42} fill="#00C878" fontSize="10" fontWeight="bold">
                    LAGOS REGION
                  </text>
                )}
                {abujaCoord.isVisible && (
                  <text x={abujaCoord.x - 35} y={abujaCoord.y - 30} fill="#D6A83A" fontSize="10" fontWeight="bold">
                    FEDERAL CAPITAL (ABUJA)
                  </text>
                )}
                {phCoord.isVisible && (
                  <text x={phCoord.x - 35} y={phCoord.y + 38} fill="#00C878" fontSize="10" fontWeight="bold">
                    NIGER DELTA (PH)
                  </text>
                )}
                {ibadanCoord.isVisible && (
                  <text x={ibadanCoord.x - 45} y={ibadanCoord.y - 25} fill="#9A9A9A" fontSize="10" fontWeight="bold">
                    OYO / IBADAN
                  </text>
                )}
                {oceanCoord.isVisible && (
                  <text x={oceanCoord.x - 60} y={oceanCoord.y} fill="#063B2A" fontSize="11" fontWeight="bold" opacity="0.8">
                    ATLANTIC OCEAN (GULF OF GUINEA)
                  </text>
                )}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Top Map Control Bar: City Presets & In-Map Search */}
      <div className="interactive-map-control absolute top-3.5 left-3.5 right-3.5 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pointer-events-auto">
        {/* City Centering Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 bg-[#171717]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#282828] shadow-lg">
          {NIGERIAN_CITY_PRESETS.map(preset => {
            const isSelected =
              preset.name === 'all'
                ? zoom <= 3.8
                : Math.abs(center.lat - preset.lat) < 0.6 && Math.abs(center.lng - preset.lng) < 0.6;

            const cityCount = preset.name === 'all'
              ? spaces.length
              : spaces.filter(s => s.city.toLowerCase() === preset.name.toLowerCase()).length;

            return (
              <button
                key={preset.name}
                id={`map-jump-city-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleJumpToCity(preset)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00C878] text-[#0D0D0D] shadow-sm font-black'
                    : 'bg-[#222222] hover:bg-[#2A2A2A] text-[#9A9A9A] hover:text-white'
                }`}
              >
                <span>{preset.flag}</span>
                <span>{preset.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-[#0D0D0D] text-[#00C878]' : 'bg-[#333333] text-[#9A9A9A]'
                }`}>
                  {cityCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* In-Map Quick Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#9A9A9A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mapSearchQuery}
              onChange={(e) => setMapSearchQuery(e.target.value)}
              placeholder="Search Lekki, Studio, Starlink..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#171717]/95 backdrop-blur-md rounded-xl border border-[#282828] text-xs font-medium text-white placeholder:text-[#777777] focus:outline-none focus:border-[#00C878] transition-colors shadow-lg"
            />
            {mapSearchQuery && (
              <button
                onClick={() => setMapSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Hub Stats Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-[#171717]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#282828] text-xs shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#00C878] animate-pulse" />
            <span className="font-bold text-white">{visibleMapSpaces.length} Spaces</span>
            <span className="text-[#333333]">•</span>
            <span className="text-[#9A9A9A] font-medium">{totalOpenDesks} Stations</span>
          </div>
        </div>
      </div>

      {/* Category Pills Strip (Left Floating Toolbar) */}
      <div className="interactive-map-control absolute top-18 sm:top-16 left-3.5 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto bg-[#171717]/90 backdrop-blur-md p-1 rounded-xl border border-[#282828]">
        {mapCategories.map(cat => {
          const isSelected = activeCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#00C878] text-[#0D0D0D] font-black shadow-xs'
                  : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Space Markers on Nigerian Coordinates */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {(visibleMapSpaces || []).map(space => {
          if (!space.coordinates) return null;
          const coords = projectCoordinates(space.coordinates.lat, space.coordinates.lng);
          if (!coords.isVisible) return null;

          const isSelected = activeSpace?.id === space.id || selectedSpaceId === space.id;
          const isHovered = hoveredSpace?.id === space.id;
          const openDesks = (space.desks || []).filter(d => d.status === 'available').length;

          const getCategoryEmoji = () => {
            if (space.category === 'creator_studio') return '🎥';
            if (space.category === 'photography_studio') return '📸';
            if (space.category === 'podcast_studio') return '🎙️';
            if (space.category === 'private_office') return '🏢';
            if (space.category === 'meeting_room') return '👥';
            return '💼';
          };

          return (
            <div
              key={space.id}
              id={`map-marker-${space.id}`}
              style={{
                left: `${coords.x}px`,
                top: `${coords.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              onMouseEnter={() => setHoveredSpace(space)}
              onMouseLeave={() => setHoveredSpace(null)}
              onClick={() => {
                setActiveSpace(space);
                setSelectedSpace(space);
              }}
              className="interactive-map-control absolute pointer-events-auto cursor-pointer transition-all duration-200 group"
            >
              {/* Radar Pulsing Wave on Selected / Open Marker */}
              {isSelected && (
                <div className="absolute -inset-3 rounded-full bg-[#00C878]/40 animate-ping pointer-events-none" />
              )}

              {/* Marker Pill Card */}
              <div
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold shadow-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#00C878] text-[#0D0D0D] border-[#00C878] scale-110 ring-4 ring-[#00C878]/30 font-black'
                    : isHovered
                    ? 'bg-[#1F1F1F] text-[#00C878] border-[#00C878] scale-108 -translate-y-1'
                    : 'bg-[#171717]/95 text-white border-[#282828] hover:border-[#00C878] backdrop-blur-md'
                }`}
              >
                <span className="text-xs">{getCategoryEmoji()}</span>
                
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      openDesks > 0 ? 'bg-[#00C878] animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-xs font-black tracking-tight">{formatPrice(space.dailyRate)}</span>
                </div>

                <div className="flex items-center gap-0.5 text-[10px] opacity-90 pl-1 border-l border-current/20">
                  <Star className="w-2.5 h-2.5 fill-[#D6A83A] text-[#D6A83A]" />
                  <span>{space.rating}</span>
                </div>

                {/* Marker Arrow Point */}
                <div
                  className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b ${
                    isSelected
                      ? 'bg-[#00C878] border-[#00C878]'
                      : isHovered
                      ? 'bg-[#1F1F1F] border-[#00C878]'
                      : 'bg-[#171717] border-[#282828]'
                  }`}
                />
              </div>

              {/* City & Name Tag */}
              <div
                className={`mt-1.5 text-center text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#00C878] text-[#0D0D0D]'
                    : 'bg-[#121212]/90 text-[#9A9A9A] backdrop-blur-md border border-[#282828]'
                }`}
              >
                🇳🇬 {space.city || 'Nigeria'} • {(space.neighborhood || space.city || 'Workspace').split(',')[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Active Space Drawer Card */}
      {activeSpace && (
        <div
          id="map-space-preview-card"
          className="interactive-map-control absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-30 bg-[#171717]/95 backdrop-blur-xl text-white rounded-3xl border border-[#282828] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        >
          <div className="relative">
            <img
              src={activeSpace.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'}
              alt={activeSpace.name}
              className="w-full h-36 sm:h-40 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-black/40" />

            <button
              onClick={() => setActiveSpace(null)}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#063B2A] text-[#00C878] border border-[#00C878]/30">
                🇳🇬 {activeSpace.city || 'Nigeria'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00C878] text-[#0D0D0D] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0D] animate-pulse" />
                {(activeSpace.desks || []).filter(d => d.status === 'available').length} Open
              </span>
            </div>

            <div className="absolute bottom-2.5 right-2.5 bg-[#121212]/90 backdrop-blur-md text-[#D6A83A] px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-[#282828]">
              <Star className="w-3 h-3 fill-[#D6A83A] text-[#D6A83A]" />
              <span>{activeSpace.rating}</span>
              <span className="text-[10px] text-[#9A9A9A] font-normal">({activeSpace.reviewCount})</span>
            </div>
          </div>

          <div className="p-4 space-y-2.5">
            <div>
              <div className="text-[10px] font-bold text-[#00C878] uppercase tracking-wider">
                {activeSpace.neighborhood} • {activeSpace.address}
              </div>
              <h3 className="font-black text-white text-base leading-snug">
                {activeSpace.name}
              </h3>
              <p className="text-xs text-[#9A9A9A] line-clamp-1 mt-0.5 font-normal">
                {activeSpace.tagline}
              </p>
            </div>

            {/* Workstation feature highlights */}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#202020] border border-[#2D2D2D] text-[#00C878] font-semibold">
                <BatteryCharging className="w-3 h-3" /> 24/7 Solar Power
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#202020] border border-[#2D2D2D] text-sky-400 font-semibold">
                <Wifi className="w-3 h-3" /> Starlink 500M
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#202020] border border-[#2D2D2D] text-[#D6A83A] font-semibold">
                <Shield className="w-3 h-3" /> Keyless Entry
              </span>
            </div>

            {/* Price and Action CTA */}
            <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#9A9A9A]">Daily Rate</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-[#00C878]">
                    {formatPrice(activeSpace.dailyRate)}
                  </span>
                  <span className="text-[10px] text-[#9A9A9A]">/day</span>
                </div>
              </div>

              <button
                id="map-view-floorplan-btn"
                onClick={() => {
                  setSelectedSpace(activeSpace);
                  onSelectSpace(activeSpace);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs shadow-lg transition-all cursor-pointer"
              >
                <span>View Space & Book</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0D0D0D]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Map Controls (Right Edge) */}
      <div className="interactive-map-control absolute bottom-5 right-4 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Zoom Controls */}
        <div className="bg-[#171717]/90 backdrop-blur-md rounded-2xl border border-[#282828] shadow-xl p-1 flex flex-col items-center divide-y divide-[#262626]">
          <button
            id="map-zoom-in-btn"
            title="Zoom In"
            onClick={() => handleZoom(0.5)}
            className="p-2.5 rounded-xl text-[#9A9A9A] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            id="map-zoom-out-btn"
            title="Zoom Out"
            onClick={() => handleZoom(-0.5)}
            className="p-2.5 rounded-xl text-[#9A9A9A] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Fit All & Fullscreen Controls */}
        <div className="bg-[#171717]/90 backdrop-blur-md rounded-2xl border border-[#282828] shadow-xl p-1 flex flex-col items-center gap-1">
          <button
            id="map-fit-all-btn"
            title="Fit All Nigerian Hubs"
            onClick={handleFitAll}
            className="p-2.5 rounded-xl text-[#9A9A9A] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            id="map-toggle-density-btn"
            title="Toggle Spatial Density Circles"
            onClick={() => setShowDensityOverlay(!showDensityOverlay)}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              showDensityOverlay
                ? 'bg-[#063B2A] text-[#00C878]'
                : 'text-[#9A9A9A] hover:bg-[#222222]'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            id="map-fullscreen-btn"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl text-[#9A9A9A] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3.5 left-4 z-10 flex items-center gap-2.5 text-[10px] text-[#9A9A9A] bg-[#171717]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#282828] pointer-events-none">
        <div className="flex items-center gap-1 font-mono font-bold text-[#00C878]">
          <Compass className="w-3.5 h-3.5 text-[#00C878]" />
          <span>
            {center.lat.toFixed(2)}°N, {center.lng.toFixed(2)}°E
          </span>
        </div>
        <span className="text-[#333333]">|</span>
        <span>🇳🇬 OFIS Nigeria Spatial Cartography</span>
      </div>
    </div>
  );
};
