import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Grid, 
  Share2, 
  Heart,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Space } from '../../types';

interface HeroGalleryProps {
  space: Space;
  isSaved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
}

export const HeroGallery: React.FC<HeroGalleryProps> = ({
  space,
  isSaved,
  onToggleSave,
  onShare,
}) => {
  const images = space.images && space.images.length > 0 ? space.images : [space.featuredImage];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const toggleZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => (prev === 1 ? 1.75 : prev === 1.75 ? 2.5 : 1));
  };

  // Keyboard navigation when fullscreen is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, images.length]);

  return (
    <div className="space-y-3">
      {/* Main Full-Width Hero Container */}
      <div 
        className="relative w-full aspect-[16/10] sm:aspect-[21/9] md:aspect-[2.4/1] rounded-3xl overflow-hidden bg-[#141816] border border-[#1E2522] shadow-2xl group select-none cursor-pointer"
        onClick={() => setIsFullscreen(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Active Hero Image with Smooth Fade */}
        <img
          key={images[currentIndex]}
          src={images[currentIndex]}
          alt={`${space.title} - View ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
          loading="eager"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80';
          }}
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/85 via-transparent to-[#0D0D0D]/40 pointer-events-none" />

        {/* Top Badges & Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto">
          {/* Verified Photos Pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#0D0D0D]/80 backdrop-blur-md border border-[#232D28] text-xs font-semibold text-[#00C878] shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] font-bold tracking-wide">Verified Photos</span>
            <span className="text-[#718079] text-[10px] hidden sm:inline">• On-Site Audit</span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className="p-2.5 rounded-2xl bg-[#0D0D0D]/80 hover:bg-[#141816] backdrop-blur-md border border-[#232D28] text-[#F2F2F2] hover:text-[#00C878] transition-all shadow-lg active:scale-95"
              aria-label="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#00C878] text-[#00C878]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-2.5 rounded-2xl bg-[#0D0D0D]/80 hover:bg-[#141816] backdrop-blur-md border border-[#232D28] text-[#F2F2F2] hover:text-[#00C878] transition-all shadow-lg active:scale-95"
              aria-label="Share workspace"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              className="p-2.5 rounded-2xl bg-[#0D0D0D]/80 hover:bg-[#141816] backdrop-blur-md border border-[#232D28] text-[#F2F2F2] hover:text-[#00C878] transition-all shadow-lg active:scale-95 hidden sm:flex items-center space-x-1.5"
              aria-label="Full screen gallery"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-xs font-semibold">View All</span>
            </button>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#0D0D0D]/80 hover:bg-[#00C878] hover:text-[#0D0D0D] text-[#F2F2F2] backdrop-blur-md border border-[#232D28] transition-all opacity-0 group-hover:opacity-100 sm:opacity-90 shadow-xl active:scale-95 z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#0D0D0D]/80 hover:bg-[#00C878] hover:text-[#0D0D0D] text-[#F2F2F2] backdrop-blur-md border border-[#232D28] transition-all opacity-0 group-hover:opacity-100 sm:opacity-90 shadow-xl active:scale-95 z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Hero Bar: Image Counter & Tags */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto">
          {/* Category & Verified Tag */}
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-xl bg-[#00C878]/20 border border-[#00C878]/40 text-[#00C878] text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md">
              {String(space.category || '').replace(/_/g, ' ')}
            </span>
            {space.isSuperhost && (
              <span className="px-2.5 py-1 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-mono font-black uppercase tracking-wider shadow-md">
                Superhost
              </span>
            )}
          </div>

          {/* Image Counter & Fullscreen Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0D0D0D]/85 backdrop-blur-md border border-[#232D28] text-xs font-mono font-bold text-[#F2F2F2] hover:border-[#00C878] transition-colors shadow-lg"
          >
            <Grid className="w-3.5 h-3.5 text-[#00C878]" />
            <span>
              {currentIndex + 1} / {images.length}
            </span>
          </button>
        </div>
      </div>

      {/* Thumbnail Navigation Strip */}
      {images.length > 1 && (
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1.5 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-16 w-24 sm:h-20 sm:w-28 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                currentIndex === idx 
                  ? 'border-[#00C878] scale-100 shadow-md ring-2 ring-[#00C878]/20' 
                  : 'border-[#1E2522] opacity-60 hover:opacity-100 hover:border-[#2E3B34]'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
              {currentIndex === idx && (
                <div className="absolute inset-0 bg-[#00C878]/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN IMMERSIVE GALLERY MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between text-[#F2F2F2] pb-4 border-b border-[#232D28]">
            <div className="flex items-center space-x-3">
              <span className="text-sm sm:text-base font-bold font-mono text-[#00C878]">
                {currentIndex + 1} of {images.length}
              </span>
              <span className="text-xs text-[#718079] hidden sm:inline">•</span>
              <span className="text-xs text-[#9EABA3] font-semibold truncate max-w-[280px] sm:max-w-md">
                {space.title}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                type="button"
                onClick={toggleZoom}
                className="p-2 rounded-xl bg-[#141816] border border-[#232D28] hover:border-[#00C878] text-[#F2F2F2] hover:text-[#00C878] transition-colors cursor-pointer flex items-center space-x-1"
                title="Toggle Zoom"
              >
                {zoomLevel > 1 ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                <span className="text-xs font-mono">{zoomLevel}x</span>
              </button>

              {zoomLevel > 1 && (
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-2 rounded-xl bg-[#141816] border border-[#232D28] text-[#718079] hover:text-[#F2F2F2] transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsFullscreen(false);
                  setZoomLevel(1);
                }}
                className="p-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-[#F2F2F2] hover:text-[#FF5C5C] transition-colors cursor-pointer"
                aria-label="Close fullscreen gallery"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Viewport */}
          <div 
            className="flex-1 flex items-center justify-center relative overflow-hidden py-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-[#141816]/90 hover:bg-[#00C878] hover:text-[#0D0D0D] text-[#F2F2F2] border border-[#232D28] transition-all shadow-2xl z-20 cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div 
              className="max-w-5xl max-h-[75vh] transition-transform duration-300 ease-out cursor-zoom-in"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={toggleZoom}
            >
              <img
                src={images[currentIndex]}
                alt={`${space.title} - Photo ${currentIndex + 1}`}
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-[#1E2522]"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-[#141816]/90 hover:bg-[#00C878] hover:text-[#0D0D0D] text-[#F2F2F2] border border-[#232D28] transition-all shadow-2xl z-20 cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Fullscreen Bottom Strip */}
          <div className="pt-3 border-t border-[#232D28] flex items-center justify-center space-x-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={`modal-thumb-${idx}`}
                type="button"
                onClick={() => {
                  setZoomLevel(1);
                  setCurrentIndex(idx);
                }}
                className={`relative h-14 w-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  currentIndex === idx 
                    ? 'border-[#00C878] ring-2 ring-[#00C878]/30 scale-105' 
                    : 'border-[#232D28] opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
