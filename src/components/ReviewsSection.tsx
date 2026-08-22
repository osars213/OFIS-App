import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { Star, ShieldCheck, MessageSquarePlus } from 'lucide-react';
import { reviewsService } from '../services/reviewsService';
import { useApp } from '../context/AppContext';

interface ReviewsSectionProps {
  spaceId: string;
  rating: number;
  reviewsCount: number;
  spaceTitle?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  spaceId,
  rating,
  reviewsCount,
  spaceTitle,
}) => {
  const { 
    currentUser, 
    userBookings, 
    setWriteReviewModalData,
    showToast 
  } = useApp();

  const [reviews, setReviews] = useState<Review[]>(reviewsService.getReviewsForSpace(spaceId));

  useEffect(() => {
    setReviews(reviewsService.getReviewsForSpace(spaceId));
  }, [spaceId]);

  const reviewEligibility = reviewsService.canUserReviewSpace(currentUser.id, spaceId, userBookings);

  const handleWriteReviewClick = () => {
    if (reviewEligibility.canReview) {
      setWriteReviewModalData({
        spaceId,
        spaceTitle: spaceTitle || 'Workspace'
      });
    } else {
      showToast(reviewEligibility.reason || 'Reviews are enabled exclusively for guests with completed bookings.');
    }
  };

  return (
    <div className="space-y-6 pt-8 border-t border-[#1E2522]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-[#161D19] px-3 py-1.5 rounded-xl border border-[#232D28]">
            <Star className="w-4 h-4 fill-[#00C878] text-[#00C878]" />
            <span className="text-base font-bold text-[#F2F2F2]">{rating}</span>
            <span className="text-xs text-[#9EABA3]">({reviews.length} reviews)</span>
          </div>
          <span className="text-xs text-[#00C878] font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Verified Community Stays</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleWriteReviewClick}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#161D19] border border-[#232D28] hover:border-[#00C878] text-xs font-semibold text-[#00C878] transition-all hover:bg-[#1C2520]"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl bg-[#141816] border border-[#1E2522] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {rev.userAvatar ? (
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#232D28] flex items-center justify-center text-xs font-bold text-[#00C878]">
                      {rev.userName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#F2F2F2]">{rev.userName}</p>
                      {rev.verifiedStay && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00C878]/15 text-[#00C878] font-bold">
                          Verified Stay
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#718079]">{rev.date}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(rev.rating)
                          ? 'fill-[#00C878] text-[#00C878]'
                          : 'text-[#232D28]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#9EABA3] leading-relaxed">{rev.comment}</p>

              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {rev.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#1A201D] text-[#00C878] border border-[#232D28]"
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-[#141816] rounded-xl border border-[#1E2522] text-xs text-[#9EABA3]">
          No verified reviews yet for this workspace. Be the first guest to review after your stay!
        </div>
      )}
    </div>
  );
};
