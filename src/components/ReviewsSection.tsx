import React from 'react';
import { Star, ShieldCheck, Zap, Wifi, Volume2, Plus } from 'lucide-react';
import { Review } from '../types';
import { useApp } from '../context/AppContext';

interface ReviewsSectionProps {
  reviews: Review[];
  overallRating: number;
  reviewsCount: number;
  onWriteReviewClick: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  overallRating,
  reviewsCount,
  onWriteReviewClick,
}) => {
  return (
    <div className="space-y-6 pt-6 border-t border-[#E2ECEB] dark:border-[#166D74]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xl sm:text-2xl font-bold text-[#12383B] dark:text-white">
            <Star className="w-6 h-6 fill-[#FFA987] text-[#FFA987]" />
            <span>{overallRating}</span>
          </div>
          <span className="text-sm text-[#5D7A7D] dark:text-[#B8D1D0]">•</span>
          <span className="text-sm font-semibold text-[#5D7A7D] dark:text-[#B8D1D0]">{reviewsCount} Verified Reviews</span>
        </div>

        <button
          type="button"
          onClick={onWriteReviewClick}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#07383D] hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold text-[#006B70] dark:text-[#28D2CB] flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#14BEB8]" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB]">
            <Zap className="w-4 h-4 text-[#14BEB8]" />
          </div>
          <div>
            <div className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Power Stability</div>
            <div className="text-sm font-bold text-[#12383B] dark:text-white">4.9 / 5.0</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB]">
            <Wifi className="w-4 h-4 text-[#14BEB8]" />
          </div>
          <div>
            <div className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Internet Speeds</div>
            <div className="text-sm font-bold text-[#12383B] dark:text-white">4.95 / 5.0</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB]">
            <Volume2 className="w-4 h-4 text-[#14BEB8]" />
          </div>
          <div>
            <div className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Noise Management</div>
            <div className="text-sm font-bold text-[#12383B] dark:text-white">4.85 / 5.0</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-center mx-auto text-[#006B70] dark:text-[#28D2CB]">
            <ShieldCheck className="w-6 h-6 text-[#14BEB8]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#12383B] dark:text-white">No Verified Reviews Yet</h4>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] max-w-md mx-auto">
              Be the first verified member to book a pass and share feedback on power stability, fiber speeds, noise management, and amenities.
            </p>
          </div>
          <button
            type="button"
            onClick={onWriteReviewClick}
            className="px-4 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write the First Review</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-center font-bold text-xs text-[#006B70] dark:text-[#28D2CB]">
                    {r.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#12383B] dark:text-white">{r.userName}</span>
                      {r.verifiedBooking && (
                        <span className="flex items-center space-x-1 text-[10px] text-[#006B70] dark:text-[#28D2CB]">
                          <ShieldCheck className="w-3 h-3 text-[#14BEB8]" />
                          <span>Verified Pass</span>
                        </span>
                      )}
                    </div>
                    {r.userRole && <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">{r.userRole}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[#C05621] dark:text-[#FFA987]">
                  <Star className="w-3.5 h-3.5 fill-[#FFA987] text-[#FFA987]" />
                  <span className="text-xs font-bold text-[#12383B] dark:text-white">{r.rating}</span>
                </div>
              </div>

              <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
