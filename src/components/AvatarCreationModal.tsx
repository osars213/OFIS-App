import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  User,
  ShieldCheck,
  Zap,
  Crown,
  Palette,
  RefreshCw,
  X,
  Flame,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OfisLogo } from './OfisLogo';

interface AvatarCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarSaved?: (avatarUrl: string) => void;
}

// Nigerian-spirited archetypes with authentic portraits and cultural styling
const NIGERIAN_SPIRIT_PRESETS = [
  {
    id: 'av-lagos-founder',
    name: 'Lagos Tech Founder',
    title: 'Founder & CEO',
    location: 'Victoria Island, Lagos',
    spiritBadge: '🇳🇬 Naija Builder',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-yaba-dev',
    name: 'Yaba Fintech Dev',
    title: 'Lead Software Engineer',
    location: 'Silicon Yaba, Lagos',
    spiritBadge: '⚡ 24/7 Builder',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=350&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-nollywood-dir',
    name: 'Nollywood Director',
    title: 'Executive Producer',
    location: 'Lekki Phase 1, Lagos',
    spiritBadge: '🎬 Creative Visionary',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=350&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-abuja-exec',
    name: 'Abuja Executive',
    title: 'Policy & Venture Partner',
    location: 'Maitama, Abuja',
    spiritBadge: '🦅 Agbada Luxe',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=350&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-vi-lead',
    name: 'VI Creative Lead',
    title: 'Product Strategist',
    location: 'Ikoyi, Lagos',
    spiritBadge: '💎 Lagos Vanguard',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=350&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-afrobeats-prod',
    name: 'Afrobeats Producer',
    title: 'Sound & Audio Designer',
    location: 'Surulere, Lagos',
    spiritBadge: '🎵 Sound Alchemist',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=350&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-enugu-pioneer',
    name: 'Enugu Tech Pioneer',
    title: 'Growth & Ops Lead',
    location: 'Independence Layout, Enugu',
    spiritBadge: '🚀 Rising Star',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=350&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-ibadan-innovator',
    name: 'Ibadan Digital Maker',
    title: 'Brand & UX Architect',
    location: 'Bodija, Ibadan',
    spiritBadge: '✨ Creative Spark',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=350&auto=format&fit=crop&q=80',
  },
];

// Cultural Badge Accents
const NAIJA_SPIRIT_BADGES = [
  { id: 'flag', label: '🇳🇬 Naija Spirit', icon: '🇳🇬' },
  { id: 'superhost', label: '🦅 Naija Superhost', icon: '🦅' },
  { id: 'power', label: '⚡ 24/7 Power Hero', icon: '⚡' },
  { id: 'vip', label: '💎 Lagos VIP', icon: '💎' },
  { id: 'verified', label: '🛡️ OFIS Verified', icon: '🛡️' },
];

// Ankara and Naija-inspired generated styles
const NAIJA_GENERATED_THEMES = [
  {
    id: 'emerald',
    name: 'Naija Emerald & Jade',
    bg: 'linear-gradient(135deg, #063B2A 0%, #00C878 50%, #022016 100%)',
    textColor: '#FFFFFF',
    accent: '#00C878',
  },
  {
    id: 'lagos-sunset',
    name: 'Lagos Sunset Gold',
    bg: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 40%, #FBBF24 100%)',
    textColor: '#FFFFFF',
    accent: '#FBBF24',
  },
  {
    id: 'ankara-royal',
    name: 'Ankara Royal Indigo',
    bg: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #F59E0B 100%)',
    textColor: '#FFFFFF',
    accent: '#F59E0B',
  },
  {
    id: 'abuja-onyx',
    name: 'Abuja Onyx & Champagne',
    bg: 'linear-gradient(135deg, #18181B 0%, #27272A 50%, #CA8A04 100%)',
    textColor: '#FFFFFF',
    accent: '#EAB308',
  },
];

export const AvatarCreationModal: React.FC<AvatarCreationModalProps> = ({
  isOpen,
  onClose,
  onAvatarSaved,
}) => {
  const { currentUser, setCurrentUser, showToast } = useApp();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    currentUser?.avatar || NIGERIAN_SPIRIT_PRESETS[0].url
  );
  const [activeTab, setActiveTab] = useState<'curated' | 'generate' | 'upload'>('curated');
  const [selectedBadge, setSelectedBadge] = useState<string>('flag');
  const [genTheme, setGenTheme] = useState(NAIJA_GENERATED_THEMES[0]);
  const [genInitials, setGenInitials] = useState(
    currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NG'
  );

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentUser?.avatar) {
      setSelectedAvatar(currentUser.avatar);
    }
  }, [currentUser?.avatar]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be under 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 400, height: 400 },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      showToast('Camera access not available in this preview environment. You can upload a photo or choose a Nigerian spirit portrait.', 'info');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 320);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedAvatar(dataUrl);
        stopCamera();
      }
    }
  };

  // Generate an SVG-based Nigerian Spirit Avatar
  const handleGenerateNaijaAvatar = () => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${genTheme.id === 'emerald' ? '#063B2A' : genTheme.id === 'lagos-sunset' ? '#7C2D12' : genTheme.id === 'ankara-royal' ? '#1E1B4B' : '#18181B'}" />
          <stop offset="50%" stop-color="${genTheme.accent}" />
          <stop offset="100%" stop-color="#0A0A0A" />
        </linearGradient>
        <pattern id="ankara" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="4" fill="rgba(255,255,255,0.08)"/>
          <path d="M0,15 Q15,0 30,15 Q15,30 0,15" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="300" height="300" fill="url(#grad)" rx="150"/>
      <rect width="300" height="300" fill="url(#ankara)" rx="150"/>
      <circle cx="150" cy="150" r="130" fill="none" stroke="${genTheme.accent}" stroke-width="4" stroke-opacity="0.5"/>
      <text x="150" y="170" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="76" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">${genInitials || 'NG'}</text>
      <text x="150" y="220" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="${genTheme.accent}" text-anchor="middle" letter-spacing="4">OFIS NIGERIA</text>
    </svg>`;

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setSelectedAvatar(dataUrl);
    showToast('Nigerian-spirited avatar generated!', 'success');
  };

  const handleSave = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        avatar: selectedAvatar,
      });
      showToast('OFIS Nigerian Spirit profile avatar updated!', 'success');
    }
    if (onAvatarSaved) {
      onAvatarSaved(selectedAvatar);
    }
    stopCamera();
    onClose();
  };

  const handleSkip = () => {
    stopCamera();
    onClose();
  };

  const currentBadge = NAIJA_SPIRIT_BADGES.find(b => b.id === selectedBadge);

  return (
    <div
      id="avatar-creation-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={handleSkip}
    >
      <motion.div
        id="avatar-creation-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#121212] border border-[#2B2B2B] rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left overflow-hidden my-auto"
      >
        {/* Ambient Top Naija Glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#00C878]/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-[#EA580C]/15 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1F1F1F] text-[#888888] hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Nigerian Flag Accent */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#063B2A] border border-[#00C878]/40 text-[#00C878] text-[11px] font-bold mb-2.5">
            <span>🇳🇬</span>
            <span>Nigerian Spirited Identity</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Personalize Your OFIS Avatar
          </h2>
          <p className="text-xs text-[#9A9A9A] mt-1 max-w-sm leading-relaxed">
            Represent your creative identity, tech focus, or Nigerian superhost presence across workspace passes and host communications.
          </p>
        </div>

        {/* Circular Avatar Preview with Nigerian Spirit Border & Badges */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            {/* Outer animated gradient ring */}
            <div className="p-1 rounded-full bg-gradient-to-tr from-[#00C878] via-[#FBBF24] to-[#00C878] shadow-[0_0_25px_rgba(0,200,120,0.3)]">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-[#1A1A1A] shadow-inner flex items-center justify-center relative">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : selectedAvatar ? (
                  <img
                    src={selectedAvatar}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-[#9A9A9A]" />
                )}
              </div>
            </div>

            {/* Nigerian Spirit Badge Overlay */}
            {currentBadge && (
              <div className="absolute -bottom-1 -right-1 px-2 py-1 rounded-full bg-[#0D0D0D] border-2 border-[#00C878] text-white text-xs font-black shadow-lg flex items-center gap-1">
                <span>{currentBadge.icon}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#00C878] font-bold mt-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active across all booking receipts & smart passes</span>
          </div>
        </div>

        {/* Sub-Tabs: Curated Nigerian Styles, Studio Generator, Custom Upload */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#181818] border border-[#282828] rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('curated');
            }}
            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'curated'
                ? 'bg-[#00C878] text-[#0D0D0D] shadow-md'
                : 'text-[#9A9A9A] hover:text-white'
            }`}
          >
            🇳🇬 Naija Archetypes
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('generate');
            }}
            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'generate'
                ? 'bg-[#00C878] text-[#0D0D0D] shadow-md'
                : 'text-[#9A9A9A] hover:text-white'
            }`}
          >
            🎨 Vector Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'upload'
                ? 'bg-[#00C878] text-[#0D0D0D] shadow-md'
                : 'text-[#9A9A9A] hover:text-white'
            }`}
          >
            📷 Photo / Cam
          </button>
        </div>

        {/* Tab 1: Curated Nigerian Archetypes */}
        {activeTab === 'curated' && (
          <div className="space-y-4 mb-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9A9A9A] font-semibold">Choose your Nigerian creative spirit:</span>
              <span className="text-[#00C878] font-bold font-mono">8 styles</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {NIGERIAN_SPIRIT_PRESETS.map((av) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    id={`preset-avatar-btn-${av.id}`}
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative rounded-2xl p-1.5 border transition-all cursor-pointer flex flex-col items-center text-center group ${
                      isSelected
                        ? 'bg-[#063B2A] border-[#00C878] ring-2 ring-[#00C878]/50 scale-[1.03] shadow-md'
                        : 'bg-[#181818] border-[#2B2B2B] hover:border-[#444444] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden mb-1 relative border border-white/10">
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#00C878]/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#00C878] stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                      {av.name.split(' ')[0]}
                    </span>
                    <span className="text-[8px] text-[#00C878] font-medium line-clamp-1">
                      {av.spiritBadge.split(' ')[1] || 'Naija'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Vector Studio Generator */}
        {activeTab === 'generate' && (
          <div className="space-y-4 mb-5 bg-[#181818] border border-[#282828] p-4 rounded-2xl text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#9A9A9A] mb-1.5">
                  Initials / Monogram
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={genInitials}
                  onChange={(e) => setGenInitials(e.target.value.toUpperCase())}
                  placeholder="e.g. TA"
                  className="w-full px-3 py-2 rounded-xl bg-[#222222] border border-[#333333] text-white font-bold tracking-wider text-center focus:border-[#00C878] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#9A9A9A] mb-1.5">
                  Naija Color Palette
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {NAIJA_GENERATED_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setGenTheme(th)}
                      className={`h-9 rounded-xl border-2 transition-all cursor-pointer ${
                        genTheme.id === th.id
                          ? 'border-[#00C878] scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ background: th.bg }}
                      title={th.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateNaijaAvatar}
              className="w-full py-2.5 px-3 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] border border-[#3A3A3A] hover:border-[#00C878] text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Palette className="w-4 h-4 text-[#00C878]" />
              <span>Apply {genTheme.name} Avatar</span>
            </button>
          </div>
        )}

        {/* Tab 3: Upload & Live Camera */}
        {activeTab === 'upload' && (
          <div className="space-y-4 mb-5">
            {/* Camera Viewport if active */}
            {isCameraActive && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  type="button"
                  id="capture-photo-btn"
                  onClick={capturePhoto}
                  className="py-2.5 px-4 rounded-xl bg-[#00C878] text-[#0D0D0D] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:bg-[#00E58B]"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  type="button"
                  id="cancel-camera-btn"
                  onClick={stopCamera}
                  className="py-2.5 px-3 rounded-xl bg-[#222222] text-stone-300 text-xs font-semibold hover:bg-[#2A2A2A] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="avatar-upload-file-btn"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border border-[#2B2B2B] bg-[#181818] hover:bg-[#222222] hover:border-[#00C878]/40 text-stone-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#00C878]" />
                <span>Upload From Device</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                id="avatar-take-photo-btn"
                onClick={() => {
                  if (isCameraActive) {
                    stopCamera();
                  } else {
                    startCamera();
                  }
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border border-[#2B2B2B] bg-[#181818] hover:bg-[#222222] hover:border-[#00C878]/40 text-stone-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#00C878]" />
                <span>{isCameraActive ? 'Close Camera' : 'Take Camera Photo'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Nigerian Spirit Badge Selector */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2">
            Nigerian Spirit Badge (Corner Insignia)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {NAIJA_SPIRIT_BADGES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBadge(b.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  selectedBadge === b.id
                    ? 'bg-[#063B2A] text-[#00C878] border-[#00C878]'
                    : 'bg-[#181818] text-[#9A9A9A] border-[#2A2A2A] hover:text-white'
                }`}
              >
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Save or Skip */}
        <div className="space-y-2.5">
          <button
            type="button"
            id="avatar-save-btn"
            onClick={handleSave}
            className="w-full py-3.5 px-4 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-black text-sm transition-all cursor-pointer shadow-[0_0_25px_rgba(0,200,120,0.35)] hover:shadow-[0_0_30px_rgba(0,200,120,0.5)] flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save & Set Nigerian Spirit Avatar</span>
          </button>

          <button
            type="button"
            id="avatar-skip-btn"
            onClick={handleSkip}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#888888] hover:text-white transition-colors text-center cursor-pointer"
          >
            Cancel / Keep Current Avatar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
