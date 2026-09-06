import React, { useState, useMemo } from 'react';
import { 
  Wifi, 
  Zap, 
  Armchair, 
  Monitor, 
  Coffee, 
  ShieldCheck, 
  Accessibility, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  SlidersHorizontal,
  Lock,
  Airplay,
  Mic2,
  Tv,
  Printer,
  Compass,
  Layers
} from 'lucide-react';
import { Space } from '../../types';

interface CategorizedAmenitiesProps {
  space: Space;
}

interface AmenityCategoryGroup {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  items: string[];
}

export const CategorizedAmenities: React.FC<CategorizedAmenitiesProps> = ({ space }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const categories = useMemo<AmenityCategoryGroup[]>(() => {
    const rawAmenities = space.amenities || [];
    
    // 1. Connectivity & Power
    const connectivityItems: string[] = [];
    if (space.internetSpeedMbps) connectivityItems.push(`${space.internetSpeedMbps} Mbps High-Speed Internet (${space.internetIsp || 'Dedicated Fiber'})`);
    if (space.hasBackupPower) connectivityItems.push(`${space.powerUptimeGuaranteePercent || 100}% Uptime Power Guarantee (${space.powerType || 'Dual Generator + Solar'})`);
    
    // 2. Comfort & Ergonomics
    const comfortItems: string[] = [];
    
    // 3. Business & AV
    const businessItems: string[] = [];
    
    // 4. Food & Refreshments
    const foodItems: string[] = [];
    
    // 5. Accessibility & Wellness
    const accessibilityItems: string[] = [];
    
    // 6. Security & Operations
    const securityItems: string[] = [];

    // Parse each raw amenity string into the most relevant category
    (rawAmenities || []).forEach((item) => {
      if (!item) return;
      const lower = item.toLowerCase();

      if (
        lower.includes('wifi') || 
        lower.includes('internet') || 
        lower.includes('fiber') || 
        lower.includes('starlink') || 
        lower.includes('ethernet') || 
        lower.includes('power') || 
        lower.includes('generator') || 
        lower.includes('inverter') || 
        lower.includes('solar') || 
        lower.includes('ups') || 
        lower.includes('plug') || 
        lower.includes('socket')
      ) {
        connectivityItems.push(item);
      } else if (
        lower.includes('chair') || 
        lower.includes('desk') || 
        lower.includes('herman') || 
        lower.includes('aeron') || 
        lower.includes('ergonomic') || 
        lower.includes('ac') || 
        lower.includes('air condition') || 
        lower.includes('climate') || 
        lower.includes('lounge') || 
        lower.includes('sofa') || 
        lower.includes('booth') || 
        lower.includes('lighting') || 
        lower.includes('standing')
      ) {
        comfortItems.push(item);
      } else if (
        lower.includes('screen') || 
        lower.includes('display') || 
        lower.includes('4k') || 
        lower.includes('monitor') || 
        lower.includes('tv') || 
        lower.includes('mic') || 
        lower.includes('podcast') || 
        lower.includes('sound') || 
        lower.includes('acoustic') || 
        lower.includes('shure') || 
        lower.includes('whiteboard') || 
        lower.includes('print') || 
        lower.includes('projector') || 
        lower.includes('av') || 
        lower.includes('camera') || 
        lower.includes('strobe') || 
        lower.includes('lighting') || 
        lower.includes('cyclorama') || 
        lower.includes('polycom')
      ) {
        businessItems.push(item);
      } else if (
        lower.includes('coffee') || 
        lower.includes('espresso') || 
        lower.includes('tea') || 
        lower.includes('water') || 
        lower.includes('kitchen') || 
        lower.includes('snack') || 
        lower.includes('beverage') || 
        lower.includes('barista') || 
        lower.includes('refreshment') || 
        lower.includes('fridge') || 
        lower.includes('microwave')
      ) {
        foodItems.push(item);
      } else if (
        lower.includes('wheelchair') || 
        lower.includes('elevator') || 
        lower.includes('lift') || 
        lower.includes('accessible') || 
        lower.includes('meditation') || 
        lower.includes('prayer') || 
        lower.includes('terrace') || 
        lower.includes('balcony') || 
        lower.includes('wellness') || 
        lower.includes('nursing')
      ) {
        accessibilityItems.push(item);
      } else if (
        lower.includes('security') || 
        lower.includes('cctv') || 
        lower.includes('guard') || 
        lower.includes('locker') || 
        lower.includes('access') || 
        lower.includes('parking') || 
        lower.includes('biometric') || 
        lower.includes('qr') || 
        lower.includes('turnstile') || 
        lower.includes('valet')
      ) {
        securityItems.push(item);
      } else {
        // Default to business / general comfort
        comfortItems.push(item);
      }
    });

    const groups: AmenityCategoryGroup[] = [
      {
        id: 'connectivity',
        name: 'Connectivity & Power',
        icon: Zap,
        description: 'High-speed data pipes and uninterrupted power redundancy',
        items: Array.from(new Set(connectivityItems)),
      },
      {
        id: 'comfort',
        name: 'Comfort & Ergonomics',
        icon: Armchair,
        description: 'Engineered for sustained focus and physical wellbeing',
        items: Array.from(new Set(comfortItems)),
      },
      {
        id: 'business',
        name: 'Business & Audio-Visual',
        icon: Monitor,
        description: 'Presentation, broadcast, and team collaboration equipment',
        items: Array.from(new Set(businessItems)),
      },
      {
        id: 'food',
        name: 'Food & Refreshments',
        icon: Coffee,
        description: 'Specialty beverages, barista coffee, and pantry essentials',
        items: Array.from(new Set(foodItems)),
      },
      {
        id: 'security',
        name: 'Security & Logistics',
        icon: ShieldCheck,
        description: 'Access control, 24/7 security personnel, and parking',
        items: Array.from(new Set(securityItems)),
      },
      {
        id: 'accessibility',
        name: 'Accessibility & Wellness',
        icon: Accessibility,
        description: 'Inclusive design, quiet spaces, and open-air zones',
        items: Array.from(new Set(accessibilityItems)),
      },
    ];

    // Only return categories that actually have items
    return groups.filter((g) => g.items.length > 0);
  }, [space]);

  const totalAmenityCount = useMemo(() => {
    return categories.reduce((sum, g) => sum + g.items.length, 0);
  }, [categories]);

  const displayedCategories = useMemo(() => {
    if (activeTab !== 'all') {
      return categories.filter((c) => c.id === activeTab);
    }
    return isExpanded ? categories : categories.slice(0, 3);
  }, [categories, isExpanded, activeTab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#F2F2F2]">Amenities & Inclusions</h3>
          <p className="text-xs text-[#9EABA3]">
            Verified on-site facilities, hardware, and hospitality specs ({totalAmenityCount} total)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#00C878] text-[#0D0D0D]'
                : 'bg-[#141816] text-[#9EABA3] hover:text-[#F2F2F2] border border-[#1E2522]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-[#00C878] text-[#0D0D0D]'
                  : 'bg-[#141816] text-[#9EABA3] hover:text-[#F2F2F2] border border-[#1E2522]'
              }`}
            >
              {cat.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Cards */}
      <div className="space-y-3.5">
        {displayedCategories.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.id}
              className="p-4 rounded-2xl bg-[#141816] border border-[#1E2522] space-y-3"
            >
              {/* Category Header */}
              <div className="flex items-center space-x-2.5 pb-2.5 border-b border-[#1E2522]">
                <div className="p-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878]">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F2F2F2]">{group.name}</h4>
                  <p className="text-[10px] text-[#718079]">{group.description}</p>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.items.map((item, idx) => (
                  <div
                    key={`${group.id}-${idx}`}
                    className="flex items-center space-x-2 text-xs text-[#9EABA3] p-2 rounded-xl bg-[#18201B]/60 border border-[#232D28]/60"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse All Button (if more than 3 categories and on 'all' view) */}
      {activeTab === 'all' && categories.length > 3 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 rounded-2xl bg-[#141816] hover:bg-[#18201B] border border-[#1E2522] hover:border-[#00C878]/40 text-xs font-semibold text-[#00C878] flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <span>
            {isExpanded
              ? 'Collapse Amenities'
              : `Show All ${categories.length} Categories (${totalAmenityCount} Amenities)`}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
