import React, { useState, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  Sparkles,
  Wifi,
  Volume2,
  Armchair,
  Coffee,
  Sparkle,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Filter,
  Search,
  ChevronDown,
  CornerDownRight,
  Send,
  PlusCircle,
  Award,
  Clock,
  UserCheck
} from 'lucide-react';
import { Space, Review, ReviewSubRatings } from '../types';
import { useApp } from '../context/AppContext';

interface ReviewsSectionProps {
  space: Space;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ space }) => {
  const {
    currentUser,
    reviews,
    toggleHelpfulReview,
    addHostReply,
    openWriteReviewModal,
    isUserVerifiedForSpace,
    showToast,
  } = useApp();

  // Filters & State
  const [selectedStarFilter, setSelectedStarFilter] = useState<'all' | number>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Host reply state: reviewId -> reply string
  const [replyInputs, setReplyInputs] = useState<{ [reviewId: string]: string }>({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);

  // All reviews for this specific space
  const spaceReviews = useMemo(() => {
    return reviews.filter(r => r.spaceId === space.id);
  }, [reviews, space.id]);

  // Compute live dynamic averages if reviews exist
  const totalCount = spaceReviews.length;
  const averageRating = useMemo(() => {
    if (totalCount === 0) return space.rating || 4.9;
    const sum = spaceReviews.reduce((acc, r) => acc + r.rating, 0);
    return +(sum / totalCount).toFixed(2);
  }, [spaceReviews, totalCount, space.rating]);

  // Compute category averages
  const categoryAverages: ReviewSubRatings = useMemo(() => {
    if (totalCount === 0) {
      return (
        space.ratingCategories || {
          cleanliness: 4.9,
          wifiSpeed: 5.0,
          noiseComfort: 4.8,
          ergonomics: 5.0,
          amenities: 4.9,
        }
      );
    }
    const cleanSum = spaceReviews.reduce((acc, r) => acc + (r.subRatings?.cleanliness || 5), 0);
    const wifiSum = spaceReviews.reduce((acc, r) => acc + (r.subRatings?.wifiSpeed || 5), 0);
    const noiseSum = spaceReviews.reduce((acc, r) => acc + (r.subRatings?.noiseComfort || 5), 0);
    const ergoSum = spaceReviews.reduce((acc, r) => acc + (r.subRatings?.ergonomics || 5), 0);
    const amenSum = spaceReviews.reduce((acc, r) => acc + (r.subRatings?.amenities || 5), 0);

    return {
      cleanliness: +(cleanSum / totalCount).toFixed(1),
      wifiSpeed: +(wifiSum / totalCount).toFixed(1),
      noiseComfort: +(noiseSum / totalCount).toFixed(1),
      ergonomics: +(ergoSum / totalCount).toFixed(1),
      amenities: +(amenSum / totalCount).toFixed(1),
    };
  }, [spaceReviews, totalCount, space.ratingCategories]);

  // Compute star distribution
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (totalCount === 0 && space.starsDistribution) {
      return space.starsDistribution;
    }
    spaceReviews.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    return counts;
  }, [spaceReviews, totalCount, space.starsDistribution]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    return spaceReviews
      .filter(review => {
        if (selectedStarFilter !== 'all') {
          if (Math.round(review.rating) !== selectedStarFilter) return false;
        }
        if (verifiedOnly && !review.isVerifiedStay) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = review.title.toLowerCase().includes(q);
          const matchComment = review.comment.toLowerCase().includes(q);
          const matchUser = review.userName.toLowerCase().includes(q);
          const matchDesk = review.deskCode?.toLowerCase().includes(q) || review.deskName?.toLowerCase().includes(q);
          if (!matchTitle && !matchComment && !matchUser && !matchDesk) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'lowest') return a.rating - b.rating;
        if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
        return 0;
      });
  }, [spaceReviews, selectedStarFilter, verifiedOnly, searchQuery, sortBy]);

  const handleSendHostReply = (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) {
      showToast('Please type a response message.', 'warning');
      return;
    }
    addHostReply(reviewId, text);
    setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
    setActiveReplyBoxId(null);
  };

  const isVerifiedForSpace = currentUser?.id ? isUserVerifiedForSpace(currentUser.id, space.id) : false;

  const subCategoryList = [
    {
      key: 'cleanliness' as keyof ReviewSubRatings,
      label: 'Space & Ambience',
      score: categoryAverages.cleanliness,
      icon: Sparkle,
    },
    {
      key: 'wifiSpeed' as keyof ReviewSubRatings,
      label: 'Internet & Starlink',
      score: categoryAverages.wifiSpeed,
      icon: Wifi,
    },
    {
      key: 'noiseComfort' as keyof ReviewSubRatings,
      label: 'Acoustics & Quiet',
      score: categoryAverages.noiseComfort,
      icon: Volume2,
    },
    {
      key: 'ergonomics' as keyof ReviewSubRatings,
      label: 'Power & Equipment',
      score: categoryAverages.ergonomics,
      icon: Armchair,
    },
    {
      key: 'amenities' as keyof ReviewSubRatings,
      label: 'Amenities & AC',
      score: categoryAverages.amenities,
      icon: Coffee,
    },
  ];

  return (
    <div id="reviews-section" className="bg-[#171717] rounded-3xl border border-[#282828] p-6 sm:p-8 shadow-xl space-y-8 animate-in fade-in duration-200 text-white">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Community Ratings & Reviews
            </h2>
            <span className="bg-[#063B2A] text-[#00C878] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#00C878]/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />
              Verified OFIS Passes
            </span>
          </div>
          <p className="text-xs text-[#9A9A9A] mt-1 font-normal">
            Real feedback from creators, tech founders, and remote teams who booked this space.
          </p>
        </div>

        <button
          id="open-write-review-btn"
          onClick={() => openWriteReviewModal(space)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs shadow-md transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#0D0D0D]" />
          <span>Write a Review</span>
          {isVerifiedForSpace && (
            <span className="bg-[#0D0D0D] text-[#00C878] text-[9px] px-1.5 py-0.2 rounded font-black">
              Verified
            </span>
          )}
        </button>
      </div>

      {/* Primary Rating Overview Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 rounded-2xl bg-[#121212] border border-[#262626] items-center">
        {/* Big Overall Average Score */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-[#262626] space-y-2">
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{averageRating}</span>
            <Star className="w-8 h-8 fill-[#D6A83A] text-[#D6A83A]" />
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(averageRating)
                    ? 'fill-[#D6A83A] text-[#D6A83A]'
                    : 'text-[#333333] fill-[#222222]'
                }`}
              />
            ))}
          </div>

          <div className="text-xs font-bold text-[#9A9A9A]">
            Based on <span className="text-white font-extrabold">{totalCount}</span> verified {totalCount === 1 ? 'review' : 'reviews'}
          </div>

          <div className="text-[11px] font-bold text-[#00C878] bg-[#063B2A] border border-[#00C878]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00C878]" />
            <span>98% of Nigerian guests recommend</span>
          </div>
        </div>

        {/* Star Distribution Progress Bars */}
        <div className="lg:col-span-4 space-y-1.5 px-2">
          <div className="text-[11px] font-bold text-[#9A9A9A] uppercase tracking-wider mb-2">
            Star Distribution (Click to filter)
          </div>

          {[5, 4, 3, 2, 1].map(stars => {
            const count = starCounts[stars as keyof typeof starCounts] || 0;
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            const isSelected = selectedStarFilter === stars;

            return (
              <button
                key={stars}
                onClick={() => setSelectedStarFilter(isSelected ? 'all' : stars)}
                className={`w-full flex items-center gap-2 text-xs py-1 px-1.5 rounded-lg transition-colors text-left cursor-pointer ${
                  isSelected ? 'bg-[#063B2A] text-[#00C878] font-bold' : 'hover:bg-[#1E1E1E] text-[#9A9A9A]'
                }`}
              >
                <div className="flex items-center gap-1 w-10 shrink-0 font-semibold text-[11px]">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-[#D6A83A] text-[#D6A83A]" />
                </div>

                <div className="flex-1 h-2 bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00C878] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-8 text-right text-[10px] text-[#9A9A9A] font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-ratings averages */}
        <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 lg:border-l border-[#262626] p-2">
          <div className="text-[11px] font-bold text-[#9A9A9A] uppercase tracking-wider mb-2">
            Facility Ratings
          </div>

          {subCategoryList.map(cat => {
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-300">
                  <Icon className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>{cat.label}</span>
                </div>
                <div className="flex items-center gap-1 font-bold font-mono text-white">
                  <span>{cat.score.toFixed(1)}</span>
                  <Star className="w-3 h-3 fill-[#D6A83A] text-[#D6A83A]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-[#121212] rounded-2xl border border-[#262626] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#9A9A9A] mx-auto opacity-50" />
            <p className="text-sm font-bold text-white">No reviews found matching filters</p>
            <p className="text-xs text-[#9A9A9A]">Try resetting star filter or search query.</p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div
              key={review.id}
              className="p-5 rounded-2xl bg-[#121212] border border-[#282828] space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={review.userName}
                    className="w-9 h-9 rounded-full object-cover border border-[#333333]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{review.userName}</span>
                      {review.isVerifiedStay && (
                        <span className="bg-[#063B2A] text-[#00C878] text-[10px] font-bold px-2 py-0.2 rounded-full border border-[#00C878]/30 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-[#00C878]" /> Verified Pass
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#9A9A9A]">
                      {new Date(review.createdAt).toLocaleDateString()} {review.deskName ? `• ${review.deskName}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#1A1A1A] px-2.5 py-1 rounded-lg border border-[#282828]">
                  <Star className="w-3.5 h-3.5 fill-[#D6A83A] text-[#D6A83A]" />
                  <span className="text-xs font-bold text-white font-mono">{review.rating.toFixed(1)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">{review.title}</h4>
                <p className="text-xs text-[#9A9A9A] leading-relaxed mt-1 font-normal">{review.comment}</p>
              </div>

              {/* Host reply */}
              {review.hostReply && (
                <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#282828] space-y-1">
                  <div className="text-[10px] font-bold text-[#00C878] flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3" /> Host Response ({review.hostReply.hostName}):
                  </div>
                  <p className="text-xs text-stone-300 pl-4 border-l border-[#00C878]/40">
                    {review.hostReply.message}
                  </p>
                </div>
              )}

              {/* Legacy host replies array support */}
              {Array.isArray((review as any).hostReplies) && (review as any).hostReplies.length > 0 && (
                <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#282828] space-y-1">
                  <div className="text-[10px] font-bold text-[#00C878] flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3" /> Host Response:
                  </div>
                  {((review as any).hostReplies as any[]).map((reply: any) => (
                    <p key={reply.id || reply.comment} className="text-xs text-stone-300 pl-4 border-l border-[#00C878]/40">
                      {reply.comment || reply.message}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#222222] text-xs">
                <button
                  onClick={() => toggleHelpfulReview(review.id, currentUser?.id || 'guest')}
                  className="flex items-center gap-1 text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>Helpful ({review.helpfulCount || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
