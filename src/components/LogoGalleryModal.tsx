import React, { useState } from 'react';
import { X, Check, Eye, Sparkles, Layout, Compass, Shield, Key, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface LogoConcept {
  id: number;
  title: string;
  subtitle: string;
  category: 'Architectural Arch' | 'Doorway & Portal' | 'Monogram & Craft' | 'Geometric Modern';
  description: string;
  renderLogo: (mode: 'dark' | 'light') => React.ReactNode;
}

export const LOGO_CONCEPTS: LogoConcept[] = [
  // 1. The Handcrafted Emerald Arch & Glowing Door
  {
    id: 1,
    title: 'The Artisanal Portal',
    subtitle: 'Classic Open Door inside an Emerald Arch',
    category: 'Doorway & Portal',
    description: 'A handcrafted circular arch with warm, welcoming inner door light and a precision location marker on the letter "i".',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          {/* Emblem */}
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <defs>
                <linearGradient id="c1-grad" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="50%" stopColor="#16A34A" />
                  <stop offset="100%" stopColor="#84CC16" />
                </linearGradient>
                <radialGradient id="c1-glow" cx="50" cy="50" r="40">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Glow */}
              <circle cx="50" cy="50" r="32" fill="url(#c1-glow)" />
              {/* Door */}
              <polygon points="46,28 58,34 58,74 46,80" fill={isDark ? '#1F2937' : '#111827'} stroke="#374151" strokeWidth="1" />
              <polygon points="56,33 58,34 58,74 56,73" fill="#FDE047" />
              <circle cx="55" cy="55" r="1.2" fill="#FDE047" />
              {/* Outer Ring */}
              <path d="M 32 78 A 30 30 0 1 1 68 78 L 60 78 A 22 22 0 1 0 40 78 Z" fill="url(#c1-grad)" />
            </svg>
          </div>
          {/* Wordmark */}
          <div className="flex flex-col">
            <div className="flex items-center tracking-tight font-sans font-black text-2xl leading-none">
              <span className={isDark ? 'text-white' : 'text-slate-900'}>OF</span>
              <div className="relative inline-flex flex-col items-center mx-[1px]">
                <div className="w-2.5 h-3.5 -top-3 absolute flex items-center justify-center">
                  <svg viewBox="0 0 20 26" className="w-full h-full" fill="none">
                    <path d="M 10 26 C 10 26 20 15 20 10 C 20 4.5 15.5 0 10 0 C 4.5 0 0 4.5 0 10 C 0 15 10 26 10 26 Z" fill="#84CC16" />
                    <circle cx="10" cy="9" r="3.5" fill="#111827" />
                  </svg>
                </div>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>ı</span>
              </div>
              <span className={isDark ? 'text-white' : 'text-slate-900'}>S</span>
            </div>
            <span className="text-[8px] font-mono tracking-widest text-emerald-500 font-bold uppercase mt-1">
              PHYSICAL SPACES
            </span>
          </div>
        </div>
      );
    },
  },

  // 2. The Architectural Blueprint Monogram
  {
    id: 2,
    title: 'The Blueprint Nexus',
    subtitle: 'Isometric Floorplan Intersecting an Arch',
    category: 'Architectural Arch',
    description: 'Fine-line architectural elevation showing workspace volume, natural light, and structural precision.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <rect x="20" y="20" width="60" height="60" rx="12" stroke="#16A34A" strokeWidth="3" fill={isDark ? '#111827' : '#FFFFFF'} />
              <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="#16A34A" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <path d="M 35 65 A 15 15 0 0 1 65 65 L 50 40 Z" fill="#84CC16" fillOpacity="0.3" stroke="#84CC16" strokeWidth="2" />
              <circle cx="50" cy="40" r="3" fill="#FDE047" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className={`font-mono font-extrabold tracking-widest text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              OFIS<span className="text-emerald-500 font-bold">.</span>
            </div>
            <span className="text-[8px] font-mono tracking-[0.2em] text-slate-400 font-medium uppercase mt-0.5">
              ARCHITECTURAL HUB
            </span>
          </div>
        </div>
      );
    },
  },

  // 3. The Minimalist Keyhole Portal
  {
    id: 3,
    title: 'The Vault Pass',
    subtitle: 'Luxury Keyhole & Turnstile Gateway',
    category: 'Geometric Modern',
    description: 'Clean geometry combining the letter "O" with a secure access turnstile and golden illumination.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-11 h-11 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="42" fill={isDark ? '#1F2937' : '#F1F5F9'} stroke="#16A34A" strokeWidth="4" />
              <path d="M 50 25 C 40 25 36 33 36 40 C 36 46 42 50 44 54 L 42 75 L 58 75 L 56 54 C 58 50 64 46 64 40 C 64 33 60 25 50 25 Z" fill="#16A34A" />
              <circle cx="50" cy="40" r="5" fill="#FEF08A" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className={`font-serif font-black tracking-tight text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              OFIS
            </div>
            <span className="text-[8px] font-mono tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              INSTANT ACCESS
            </span>
          </div>
        </div>
      );
    },
  },

  // 4. The Origami Folded Desk & Portal
  {
    id: 4,
    title: 'The Origami Suite',
    subtitle: 'Handcrafted Faceted Geometric Sculpture',
    category: 'Monogram & Craft',
    description: 'Multifaceted 3D isometric plane in emerald tones creating an architectural sense of depth.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <polygon points="50,15 82,32 50,50 18,32" fill="#84CC16" />
              <polygon points="18,32 50,50 50,85 18,68" fill="#16A34A" />
              <polygon points="82,32 50,50 50,85 82,68" fill="#047857" />
              <polygon points="42,55 58,47 58,78 42,85" fill="#FEF08A" opacity="0.85" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={`font-sans font-black tracking-tighter text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              OFIS
            </span>
            <span className="text-[8px] font-sans font-bold tracking-widest text-lime-500 uppercase">
              SPACES & STUDIOS
            </span>
          </div>
        </div>
      );
    },
  },

  // 5. The Organic Sunburst Open Arch
  {
    id: 5,
    title: 'The Horizon Door',
    subtitle: 'Rising Sun Bursting Through an Open Archway',
    category: 'Doorway & Portal',
    description: 'Radiant sunrise rays emerging from an open workspace door, symbolizing clarity, focus, and energy.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path d="M 25 80 A 25 25 0 0 1 75 80 Z" fill="#FDE047" opacity="0.4" />
              <path d="M 50 10 L 50 25 M 25 25 L 35 35 M 75 25 L 65 35 M 10 50 L 25 50 M 90 50 L 75 50" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 35 80 L 35 45 A 15 15 0 0 1 65 45 L 65 80 Z" stroke="#16A34A" strokeWidth="4" fill={isDark ? '#111827' : '#FFFFFF'} />
              <polygon points="42,48 55,42 55,80 42,80" fill="#16A34A" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className={`font-sans font-extrabold tracking-tight text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              OFIS
            </div>
            <span className="text-[8px] font-mono tracking-widest text-amber-500 font-bold uppercase">
              ENERGY & WORKSPACE
            </span>
          </div>
        </div>
      );
    },
  },

  // 6. The Clean Swiss Pin & Door Arch
  {
    id: 6,
    title: 'The Swiss Metro Pin',
    subtitle: 'Precision Geo-Marker with Archway Cutout',
    category: 'Geometric Modern',
    description: 'Ultra-modern international typographic style with a location pin negative-space door arch.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-11 h-11 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path d="M 50 10 C 28 10 12 26 12 48 C 12 70 50 95 50 95 C 50 95 88 70 88 48 C 88 26 72 10 50 10 Z" fill="#16A34A" />
              <path d="M 38 68 L 38 42 A 12 12 0 0 1 62 42 L 62 68 Z" fill={isDark ? '#111827' : '#FFFFFF'} />
              <circle cx="56" cy="52" r="2" fill="#16A34A" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={`font-sans font-black tracking-tight text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ofis<span className="text-emerald-500">.</span>
            </span>
            <span className="text-[8px] font-mono tracking-widest text-slate-400 font-semibold uppercase">
              LOCAL SPACES
            </span>
          </div>
        </div>
      );
    },
  },

  // 7. The Luxury Brass & Emerald Monogram Emblem
  {
    id: 7,
    title: 'The Sovereign Badge',
    subtitle: 'Boutique Luxury Seal with Interlocking Monogram',
    category: 'Monogram & Craft',
    description: 'Executive aesthetic pairing an interlocking O-F monogram with a heraldic workspace threshold.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <rect x="15" y="15" width="70" height="70" rx="20" stroke="#CA8A04" strokeWidth="2.5" fill={isDark ? '#064E3B' : '#ECFDF5'} />
              <circle cx="50" cy="50" r="22" stroke="#16A34A" strokeWidth="3" />
              <path d="M 45 35 L 55 35 M 45 48 L 53 48 M 45 35 L 45 65" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={`font-serif tracking-widest font-bold text-2xl ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
              OFIS
            </span>
            <span className="text-[7.5px] font-mono tracking-[0.3em] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              PREMIUM SELECTION
            </span>
          </div>
        </div>
      );
    },
  },

  // 8. The Modern Neon Gateway
  {
    id: 8,
    title: 'The Cyber Threshold',
    subtitle: 'High-Contrast Neon Emerald Cyber Portal',
    category: 'Doorway & Portal',
    description: 'Futuristic aesthetic inspired by 24/7 high-speed fiber, Starlink connectivity, and instant smart-lock check-ins.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path d="M 20 85 L 20 30 A 30 30 0 0 1 80 30 L 80 85" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
              <path d="M 35 85 L 35 45 A 15 15 0 0 1 65 45 L 65 85" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" />
              <circle cx="50" cy="45" r="4" fill="#FEF08A" />
              <line x1="15" y1="85" x2="85" y2="85" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className={`font-mono font-black tracking-tighter text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              &lt;OFIS/&gt;
            </div>
            <span className="text-[8px] font-mono tracking-widest text-green-400 font-bold uppercase">
              CONNECTED NODES
            </span>
          </div>
        </div>
      );
    },
  },

  // 9. The Japanese Joinery Arch
  {
    id: 9,
    title: 'The Zen Torii Portal',
    subtitle: 'Handcrafted Timber Joinery Archway',
    category: 'Architectural Arch',
    description: 'Minimalist Japanese Torii & architectural woodwork framing an open path to productivity.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <line x1="15" y1="28" x2="85" y2="28" stroke="#16A34A" strokeWidth="5" strokeLinecap="round" />
              <line x1="22" y1="38" x2="78" y2="38" stroke="#84CC16" strokeWidth="3" strokeLinecap="round" />
              <line x1="32" y1="28" x2="32" y2="85" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
              <line x1="68" y1="28" x2="68" y2="85" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="56" r="10" fill="#FDE047" opacity="0.6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={`font-sans tracking-wide font-extrabold text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              OFIS
            </span>
            <span className="text-[8px] font-mono tracking-[0.25em] text-emerald-500 font-semibold uppercase">
              SANCTUARY & DESK
            </span>
          </div>
        </div>
      );
    },
  },

  // 10. The Studio Lens & Portal
  {
    id: 10,
    title: 'The Creative Aperture',
    subtitle: 'Studio Camera Lens Aperture & Door Portal',
    category: 'Monogram & Craft',
    description: 'Designed specifically for podcast studios, photography suites, and creative production spaces.',
    renderLogo: (mode) => {
      const isDark = mode === 'dark';
      return (
        <div className="flex items-center space-x-3 select-none">
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="40" stroke="#16A34A" strokeWidth="3" />
              <polygon points="50,15 75,35 65,70 35,70 25,35" stroke="#84CC16" strokeWidth="2" fill="none" />
              <circle cx="50" cy="50" r="14" fill="#16A34A" />
              <polygon points="46,42 54,42 54,58 46,58" fill="#FEF08A" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className={`font-sans font-black tracking-tight text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              OFIS
            </div>
            <span className="text-[8px] font-mono tracking-widest text-emerald-500 font-bold uppercase">
              STUDIOS & SUITES
            </span>
          </div>
        </div>
      );
    },
  },
];

interface LogoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConcept: (concept: LogoConcept) => void;
  selectedConceptId?: number;
}

export const LogoGalleryModal: React.FC<LogoGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectConcept,
  selectedConceptId = 1,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState<'dark' | 'light'>('dark');

  if (!isOpen) return null;

  const categories = ['all', 'Doorway & Portal', 'Architectural Arch', 'Geometric Modern', 'Monogram & Craft'];
  const filtered = filter === 'all' ? LOGO_CONCEPTS : LOGO_CONCEPTS.filter((c) => c.category === filter);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0F172A] text-white w-full max-w-5xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                10 HANDCRAFTED CONCEPTS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Choose Your Brand Logo
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select any of the 10 handmade design directions below to apply it instantly across OFIS.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dark / Light preview toggle */}
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setPreviewMode('dark')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  previewMode === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark Canvas
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('light')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  previewMode === 'light' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Light Canvas
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/30 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {cat === 'all' ? 'All 10 Concepts' : cat}
            </button>
          ))}
        </div>

        {/* Logo Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((concept) => {
            const isSelected = selectedConceptId === concept.id;
            return (
              <div
                key={concept.id}
                onClick={() => onSelectConcept(concept)}
                className={`group rounded-2xl border transition-all cursor-pointer p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/40 shadow-lg'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Concept Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center text-slate-300">
                      {concept.id}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      {concept.category}
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active Selection</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-400 border border-slate-700 transition-all flex items-center space-x-1"
                    >
                      <span>Choose Concept</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Logo Presentation Stage */}
                <div
                  className={`py-8 px-6 rounded-xl flex items-center justify-center transition-all ${
                    previewMode === 'dark'
                      ? 'bg-[#0B0F17] border border-slate-800/80 shadow-inner'
                      : 'bg-[#F8FAFC] border border-slate-200 shadow-inner'
                  }`}
                >
                  {concept.renderLogo(previewMode)}
                </div>

                {/* Info & Description */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {concept.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {concept.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    {concept.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Click any logo to instantly activate it across the navbar, mobile drawer, and digital pass.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
