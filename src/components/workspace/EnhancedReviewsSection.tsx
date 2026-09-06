import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  Volume2, 
  Plus, 
  ThumbsUp, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Image as ImageIcon,
  Banknote,
  Maximize2,
  X
} from 'lucide-react';
import { Review } from '../../types';
import { reviewsService } from '../../services/reviewsService';

interface EnhancedReviewsSectionProps {
  reviews: Review[];
  overallRating: number;
  reviewsCount: number;
  onWriteReviewClick: () => void;
}

export const EnhancedReviewsSection: React.FC<EnhancedReviewsSectionProps> = ({
  reviews,
  overallRating,
  reviewsCount,
  onWriteReviewClick,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'power' | 'internet' | 'cleanliness' | 'noise' | 'photos'>('all');
  const [helpfulStates, setHelpfulStates] = useState<Record<string, { count: number; isHelpful: boolean }>>({});
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleToggleHelpful = (reviewId: string) => {
    const res = reviewsService.toggleHelpful(reviewId);
    setHelpfulStates((prev) => ({
      ...prev,
      [reviewId]: {
        count: res.helpfulCount,
        isHelpful: res.isHelpful,
      },
    }));
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'power') return r.powerRating >= 4.8;
    if (activeFilter === 'internet') return r.internetRating >= 4.8;
    if (activeFilter === 'cleanliness') return (r.cleanlinessRating || 5) >= 4.8;
    if (activeFilter === 'noise') return r.noiseRating >= 4.8;
    if (activeFilter === 'photos') return r.photos && r.photos.length > 0;
    return true;
  });

  return (
    <div className="space-y-6 pt-6 border-t border-[#1E2522]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-2xl font-extrabold text-[#F2F2F2]">
              <Star className="w-6 h-6 fill-[#00C878] text-[#00C878]" />
              <span className="font-mono">{overallRating}</span>
            </div>
            <span className="text-sm text-[#718079]">•</span>
            <span className="text-sm font-bold text-[#9EABA3] font-mono">
              {reviewsCount} Verified Reviews
            </span>
          </div>
          <p className="text-xs text-[#718079] mt-0.5">
            Only users with completed QR turnstile check-ins can leave verified ratings
          </p>
        </div>

        <button
          type="button"
          onClick={onWriteReviewClick}
          className="px-4 py-2.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-semibold text-[#00C878] flex items-center space-x-1.5 transition-all self-start sm:self-center active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* 5-Pillar Verified Quality Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-4 rounded-2xl bg-[#141816] border border-[#1E2522]">
        
        <div className="p-2.5 rounded-xl bg-[#18201B] border border-[#232D28]">
          <div className="flex items-center space-x-1 text-[11px] text-[#718079] mb-1">
            <Zap className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Power Uptime</span>
          </div>
          <div className="text-sm font-bold text-[#F2F2F2] font-mono">5.0 / 5.0</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#18201B] border border-[#232D28]">
          <div className="flex items-center space-x-1 text-[11px] text-[#718079] mb-1">
            <Wifi className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Internet Speed</span>
          </div>
          <div className="text-sm font-bold text-[#F2F2F2] font-mono">4.95 / 5.0</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#18201B] border border-[#232D28]">
          <div className="flex items-center space-x-1 text-[11px] text-[#718079] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Cleanliness</span>
          </div>
          <div className="text-sm font-bold text-[#F2F2F2] font-mono">4.92 / 5.0</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#18201B] border border-[#232D28]">
          <div className="flex items-center space-x-1 text-[11px] text-[#718079] mb-1">
            <Volume2 className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Acoustics</span>
          </div>
          <div className="text-sm font-bold text-[#F2F2F2] font-mono">4.88 / 5.0</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] col-span-2 sm:col-span-1">
          <div className="flex items-center space-x-1 text-[11px] text-[#718079] mb-1">
            <Banknote className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Value</span>
          </div>
          <div className="text-sm font-bold text-[#F2F2F2] font-mono">4.90 / 5.0</div>
        </div>

      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Reviews (${reviews.length})` },
          { id: 'power', label: '⚡ Power Stability' },
          { id: 'internet', label: '📶 Internet Speed' },
          { id: 'cleanliness', label: '🧹 Cleanliness' },
          { id: 'noise', label: '🎙️ Acoustics' },
          { id: 'photos', label: '📷 Guest Photos' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === f.id
                ? 'bg-[#00C878] text-[#0D0D0D]'
                : 'bg-[#141816] text-[#9EABA3] hover:text-[#F2F2F2] border border-[#1E2522]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((r) => {
          const helpful = helpfulStates[r.id] || {
            count: r.helpfulCount || 0,
            isHelpful: r.isHelpfulByUser || false,
          };

          return (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-[#141816] border border-[#1E2522] space-y-3.5"
            >
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#18201B] border border-[#232D28] flex items-center justify-center font-bold text-sm text-[#00C878]">
                    {r.userName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#F2F2F2]">{r.userName}</span>
                      {r.verifiedBooking && (
                        <span className="flex items-center space-x-1 text-[10px] text-[#00C878] font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Guest</span>
                        </span>
                      )}
                    </div>
                    {r.userRole && (
                      <p className="text-[10px] text-[#718079]">{r.userRole}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[#00C878]">
                  <Star className="w-4 h-4 fill-[#00C878]" />
                  <span className="text-xs font-bold font-mono">{r.rating}</span>
                </div>
              </div>

              {/* Visit Date & Type */}
              {r.visitDate && (
                <div className="flex items-center space-x-1.5 text-[11px] text-[#718079]">
                  <Clock className="w-3 h-3 text-[#00C878]" />
                  <span>{r.visitDate}</span>
                </div>
              )}

              {/* Comment */}
              <p className="text-xs text-[#9EABA3] leading-relaxed whitespace-pre-line">
                {r.comment}
              </p>

              {/* Verified Amenity Tags */}
              {r.verifiedAmenities && r.verifiedAmenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {r.verifiedAmenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-[#18201B] border border-[#232D28] text-[10px] text-[#9EABA3] flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#00C878]" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Verified Photo Attachments */}
              {r.photos && r.photos.length > 0 && (
                <div className="flex items-center space-x-2 pt-1">
                  {r.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewPhoto(photo)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#232D28] hover:border-[#00C878] transition-all cursor-pointer group"
                    >
                      <img src={photo} alt="Guest Review Photo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                        <Maximize2 className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Helpful Votes Counter */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1E2522]/60">
                <button
                  type="button"
                  onClick={() => handleToggleHelpful(r.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    helpful.isHelpful
                      ? 'bg-[#00C878]/15 border border-[#00C878]/40 text-[#00C878]'
                      : 'bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-[#718079] hover:text-[#F2F2F2]'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${helpful.isHelpful ? 'fill-[#00C878]' : ''}`} />
                  <span>Helpful {helpful.count > 0 ? `(${helpful.count})` : ''}</span>
                </button>

                <span className="text-[10px] text-[#718079]">
                  {new Date(r.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Photo Enlarge Modal */}
      {previewPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-[#232D28]">
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:text-[#00C878] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewPhoto} alt="Review attachment" className="w-full h-auto max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

    </div>
  );
};
