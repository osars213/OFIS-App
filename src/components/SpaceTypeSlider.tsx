import React from 'react';
import { 
  Laptop, 
  Camera, 
  Presentation, 
  Mic2, 
  Building2, 
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpaceCategory } from '../types';

interface SpaceTypeItem {
  id: SpaceCategory | 'all';
  label: string;
  pillar: string;
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
    description: 'Hot desks, ergonomic Herman Miller task chairs & quiet focus pods.',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&auto=format&fit=crop&q=80',
    icon: Laptop,
  },
  {
    id: 'photography',
    label: 'Photo & Video Studios',
    pillar: 'CREATE',
    count: 2,
    description: 'Cyclorama infinity walls, continuous Aputure lighting & vanity suites.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&auto=format&fit=crop&q=80',
    icon: Camera,
  },
  {
    id: 'meeting',
    label: 'Meeting & Boardrooms',
    pillar: 'MEET',
    count: 5,
    description: '85" 4K displays, Polycom video conferencing & C-Suite salons.',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80',
    icon: Presentation,
  },
  {
    id: 'podcast',
    label: 'Acoustic Podcast Suites',
    pillar: 'RECORD',
    count: 3,
    description: 'Soundproofed vocal booths with Shure SM7B mics & multi-cam 4K rigs.',
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

export const SpaceTypeSlider: React.FC = () => {
  const { activeCategory, setActiveCategory } = useApp();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-[#F9FAFB] tracking-tight">
            Curated Space Pillars
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Explore spaces engineered for performance across Nigeria
          </p>
        </div>

        {activeCategory !== 'all' && (
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="text-xs text-[#16A34A] hover:underline font-semibold flex items-center space-x-1"
          >
            <span>Show all</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {SPACE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = activeCategory === type.id;

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
              className={`group relative rounded-2xl overflow-hidden text-left border transition-all duration-200 aspect-[4/5] flex flex-col justify-between p-3.5 sm:p-4 shadow-xs ${
                isSelected 
                  ? 'border-[#16A34A] ring-2 ring-[#16A34A]/30' 
                  : 'border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50'
              }`}
            >
              {/* Background Image */}
              <img
                src={type.image}
                alt={type.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Pillar Badge */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[9px] font-mono font-bold tracking-wider text-[#4ADE80]">
                  {type.pillar}
                </span>
                <div className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                  isSelected ? 'bg-[#16A34A] text-white' : 'bg-black/60 text-white'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Specs */}
              <div className="relative z-10 space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {type.label}
                </h3>
                <p className="text-[10px] text-gray-200 font-mono">
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
