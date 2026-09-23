import React from 'react';
import { 
  Laptop, 
  Camera, 
  Presentation, 
  Mic2, 
  Building2, 
  Users, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpaceCategory } from '../types';

interface SpaceTypeItem {
  id: SpaceCategory | 'all';
  label: string;
  pillar: 'WORK' | 'CREATE' | 'MEET' | 'RECORD';
  count: number;
  description: string;
  image: string;
  icon: React.ElementType;
}

const SPACE_TYPES: SpaceTypeItem[] = [
  {
    id: 'coworking',
    label: 'Coworking Desks & Hubs',
    pillar: 'WORK',
    count: 8,
    description: 'Hot desks, ergonomic task chairs & quiet focus pods.',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&auto=format&fit=crop&q=80',
    icon: Laptop,
  },
  {
    id: 'photography',
    label: 'Photo & Video Studios',
    pillar: 'CREATE',
    count: 2,
    description: 'Cyclorama infinity walls, continuous lighting & vanity suites.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&auto=format&fit=crop&q=80',
    icon: Camera,
  },
  {
    id: 'meeting',
    label: 'Meeting & Boardrooms',
    pillar: 'MEET',
    count: 5,
    description: '4K displays, Polycom video conferencing & C-Suite salons.',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80',
    icon: Presentation,
  },
  {
    id: 'podcast',
    label: 'Acoustic Podcast Suites',
    pillar: 'RECORD',
    count: 3,
    description: 'Soundproofed vocal booths with Shure SM7B mics & multi-cam setups.',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    icon: Mic2,
  },
  {
    id: 'private_office',
    label: 'Private Team Offices',
    pillar: 'WORK',
    count: 4,
    description: 'Enclosed suites with biometric security & dedicated meeting areas.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=80',
    icon: Building2,
  },
  {
    id: 'event',
    label: 'Event Halls & Auditoriums',
    pillar: 'MEET',
    count: 2,
    description: '150-capacity venues with LED video walls & stage audio rigs.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    icon: Users,
  },
];

const PILLAR_STYLES = {
  WORK: {
    badgeBg: 'bg-[#14BEB8]/90 text-white',
    border: 'hover:border-[#14BEB8]',
    accentText: 'text-[#28D2CB]',
    selectedBorder: 'border-[#14BEB8] ring-2 ring-[#14BEB8]/40 shadow-lg shadow-[#14BEB8]/20'
  },
  CREATE: {
    badgeBg: 'bg-[#0EA5E9]/90 text-white',
    border: 'hover:border-[#0EA5E9]',
    accentText: 'text-[#38BDF8]',
    selectedBorder: 'border-[#0EA5E9] ring-2 ring-[#0EA5E9]/40 shadow-lg shadow-[#0EA5E9]/20'
  },
  MEET: {
    badgeBg: 'bg-[#FFA987] text-[#12383B]',
    border: 'hover:border-[#FFA987]',
    accentText: 'text-[#FFD0BD]',
    selectedBorder: 'border-[#FFA987] ring-2 ring-[#FFA987]/40 shadow-lg shadow-[#FFA987]/20'
  },
  RECORD: {
    badgeBg: 'bg-[#FF8C66] text-[#12383B]',
    border: 'hover:border-[#FF8C66]',
    accentText: 'text-[#FFA987]',
    selectedBorder: 'border-[#FF8C66] ring-2 ring-[#FF8C66]/40 shadow-lg shadow-[#FF8C66]/20'
  },
};

export const SpaceTypeSlider: React.FC = () => {
  const { activeCategory, setActiveCategory } = useApp();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      <div className="flex items-center justify-between pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#14BEB8]/10 text-[#006B70] dark:text-[#28D2CB] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-[#FFA987]" />
            <span>Pillars of Productivity</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#12383B] dark:text-white tracking-tight">
            Curated Space Pillars
          </h2>
          <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] mt-0.5">
            Explore verified physical workspaces across Nigeria
          </p>
        </div>

        {activeCategory !== 'all' && (
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="text-xs text-[#006B70] dark:text-[#28D2CB] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>Show all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {SPACE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = activeCategory === type.id;
          const pillarStyle = PILLAR_STYLES[type.pillar];

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setActiveCategory(isSelected ? 'all' : type.id);
                const target = document.getElementById('spaces-results-section');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`group relative rounded-3xl overflow-hidden text-left border transition-all duration-200 aspect-[4/5] flex flex-col justify-between p-3.5 sm:p-4 shadow-sm cursor-pointer ${
                isSelected 
                  ? pillarStyle.selectedBorder 
                  : `border-[#E2ECEB] dark:border-[#166D74] ${pillarStyle.border}`
              }`}
            >
              {/* Background Image */}
              <img
                src={type.image}
                alt={type.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Pillar Badge */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wider uppercase backdrop-blur-md ${pillarStyle.badgeBg}`}>
                  {type.pillar}
                </span>
                <div className={`p-1.5 rounded-xl backdrop-blur-md transition-colors ${
                  isSelected ? 'bg-[#14BEB8] text-white' : 'bg-black/60 text-white'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Specs */}
              <div className="relative z-10 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {type.label}
                </h3>
                <p className={`text-[10px] font-semibold ${pillarStyle.accentText}`}>
                  {type.count} Spaces Available
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
