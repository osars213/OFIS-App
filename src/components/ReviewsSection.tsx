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
    <div className="space-y-6 pt-6 border-t border-[#1E2522]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xl sm:text-2xl font-bold text-[#F2F2F2]">
            <Star className="w-6 h-6 fill-[#00C878] text-[#00C878]" />
            <span>{overallRating}</span>
          </div>
          <span className="text-sm text-[#718079]">•</span>
          <span className="text-sm font-semibold text-[#9EABA3]">{reviewsCount} Verified Reviews</span>
        </div>

        <button
          type="button"
          onClick={onWriteReviewClick}
          className="px-4 py-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-semibold text-[#00C878] flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#141816] border border-[#1E2522]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#718079]">Power Stability</div>
            <div className="text-sm font-bold text-[#F2F2F2]">4.9 / 5.0</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#718079]">Internet Speeds</div>
            <div className="text-sm font-bold text-[#F2F2F2]">4.95 / 5.0</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#718079]">Noise Management</div>
            <div className="text-sm font-bold text-[#F2F2F2]">4.85 / 5.0</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141816] border border-[#1E2522] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#18201B] border border-[#232D28] flex items-center justify-center mx-auto text-[#00C878]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#F2F2F2]">No Verified Reviews Yet</h4>
            <p className="text-xs text-[#718079] max-w-md mx-auto">
              Be the first verified member to book a pass and share feedback on power stability, fiber speeds, noise management, and amenities.
            </p>
          </div>
          <button
            type="button"
            onClick={onWriteReviewClick}
            className="px-4 py-2 rounded-xl bg-[#00C878]/10 text-[#00C878] text-xs font-semibold hover:bg-[#00C878]/20 border border-[#00C878]/30 transition-all cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write the First Review</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl bg-[#141816] border border-[#1E2522] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#18201B] border border-[#232D28] flex items-center justify-center font-bold text-xs text-[#00C878]">
                    {r.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#F2F2F2]">{r.userName}</span>
                      {r.verifiedBooking && (
                        <span className="flex items-center space-x-1 text-[10px] text-[#00C878]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Pass</span>
                        </span>
                      )}
                    </div>
                    {r.userRole && <p className="text-[10px] text-[#718079]">{r.userRole}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[#00C878]">
                  <Star className="w-3.5 h-3.5 fill-[#00C878]" />
                  <span className="text-xs font-bold">{r.rating}</span>
                </div>
              </div>

              <p className="text-xs text-[#9EABA3] leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
