import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Sparkles,
  Wifi,
  Volume2,
  Armchair,
  Coffee,
  Sparkle,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReviewSubRatings } from '../types';

export const WriteReviewModal: React.FC = () => {
  const {
    currentUser,
    isReviewModalOpen,
    setIsReviewModalOpen,
    reviewTargetSpace,
    setReviewTargetSpace,
    reviewTargetBooking,
    setReviewTargetBooking,
    addReview,
    isUserVerifiedForSpace,
    showToast,
  } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Sub-category ratings
  const [subRatings, setSubRatings] = useState<ReviewSubRatings>({
    cleanliness: 5,
    wifiSpeed: 5,
    noiseComfort: 5,
    ergonomics: 5,
    amenities: 5,
  });

  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedDeskCode, setSelectedDeskCode] = useState<string>('');
  const [selectedDeskName, setSelectedDeskName] = useState<string>('');

  useEffect(() => {
    if (isReviewModalOpen && reviewTargetSpace) {
      if (reviewTargetBooking) {
        setSelectedDeskCode(reviewTargetBooking.deskCode);
        setSelectedDeskName(reviewTargetBooking.deskName);
      } else if (reviewTargetSpace.desks.length > 0) {
        setSelectedDeskCode(reviewTargetSpace.desks[0].code);
        setSelectedDeskName(reviewTargetSpace.desks[0].name);
      } else {
        setSelectedDeskCode('');
        setSelectedDeskName('');
      }
      setRating(5);
      setSubRatings({
        cleanliness: 5,
        wifiSpeed: 5,
        noiseComfort: 5,
        ergonomics: 5,
        amenities: 5,
      });
      setTitle('');
      setComment('');
    }
  }, [isReviewModalOpen, reviewTargetSpace, reviewTargetBooking]);

  if (!isReviewModalOpen || !reviewTargetSpace) return null;

  const isVerified = isUserVerifiedForSpace(currentUser.id, reviewTargetSpace.id) || !!reviewTargetBooking;

  const handleClose = () => {
    setIsReviewModalOpen(false);
    setReviewTargetSpace(null);
    setReviewTargetBooking(null);
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5: return 'Outstanding (5.0) - Exceeded expectations';
      case 4: return 'Very Good (4.0) - Great Nigerian workspace';
      case 3: return 'Average (3.0) - Met basic expectations';
      case 2: return 'Below Expectations (2.0) - Needs improvement';
      case 1: return 'Poor (1.0) - Major issues experienced';
      default: return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please provide a brief headline for your review.', 'warning');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      showToast('Please write at least 10 characters of detailed feedback.', 'warning');
      return;
    }

    const deskObj = reviewTargetSpace.desks.find(d => d.code === selectedDeskCode);

    addReview({
      spaceId: reviewTargetSpace.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      rating,
      subRatings,
      title: title.trim(),
      comment: comment.trim(),
      deskCode: selectedDeskCode || undefined,
      deskName: deskObj ? deskObj.name : selectedDeskName || undefined,
      isVerifiedStay: isVerified,
      bookingId: reviewTargetBooking?.id,
    });

    handleClose();
  };

  const subCategoryConfigs = [
    {
      key: 'cleanliness' as keyof ReviewSubRatings,
      label: 'Space & Ambience',
      icon: Sparkle,
    },
    {
      key: 'wifiSpeed' as keyof ReviewSubRatings,
      label: 'Internet & Starlink Speed',
      icon: Wifi,
    },
    {
      key: 'noiseComfort' as keyof ReviewSubRatings,
      label: 'Noise & Acoustic Focus',
      icon: Volume2,
    },
    {
      key: 'ergonomics' as keyof ReviewSubRatings,
      label: 'Power, AC & Equipment',
      icon: Armchair,
    },
    {
      key: 'amenities' as keyof ReviewSubRatings,
      label: 'Amenities & Hospitality',
      icon: Coffee,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#171717] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#282828] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#121212] text-white flex items-center justify-between border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#063B2A] text-[#00C878] border border-[#00C878]/30 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-[#00C878]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">Rate & Review Space</h2>
              <p className="text-xs text-[#9A9A9A] truncate max-w-sm sm:max-w-md">
                {reviewTargetSpace.name} • {reviewTargetSpace.city}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-[#9A9A9A] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Verification Status Banner */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            isVerified
              ? 'bg-[#063B2A] border-[#00C878]/30 text-white'
              : 'bg-[#1C1C1C] border-[#2D2D2D] text-[#9A9A9A]'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-5 h-5 ${isVerified ? 'text-[#00C878]' : 'text-[#9A9A9A]'}`} />
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                  <span>{isVerified ? 'Verified OFIS Pass Holder' : 'Community Member Feedback'}</span>
                  {isVerified && (
                    <span className="bg-[#00C878] text-[#0D0D0D] text-[10px] font-black px-2 py-0.2 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#9A9A9A] mt-0.5 font-normal">
                  Posting as <span className="text-white font-semibold">{currentUser.name}</span>
                </p>
              </div>
            </div>

            {reviewTargetBooking && (
              <span className="font-mono text-[11px] font-bold bg-[#171717] px-2.5 py-1 rounded-lg border border-[#00C878]/30 text-[#00C878]">
                Pass #{reviewTargetBooking.id}
              </span>
            )}
          </div>

          {/* Primary Overall Star Rating */}
          <div className="bg-[#121212] p-4 sm:p-5 rounded-2xl border border-[#262626] text-center space-y-2.5">
            <label className="block text-xs font-bold text-[#9A9A9A] uppercase tracking-wider">
              Overall Experience Rating
            </label>

            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const active = (hoverRating !== null ? hoverRating : rating) >= starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1.5 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                    aria-label={`${starVal} Star`}
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                        active
                          ? 'fill-[#D6A83A] text-[#D6A83A]'
                          : 'text-[#333333] fill-[#1E1E1E]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-bold text-[#D6A83A] bg-[#222222] border border-[#333333] inline-block px-3 py-1 rounded-full">
              {getRatingLabel(hoverRating !== null ? hoverRating : rating)}
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-white">Review Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Seamless power, fast Starlink, and great atmosphere"
              className="w-full p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white focus:outline-none focus:border-[#00C878]"
            />
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-white">Detailed Review *</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell other Nigerian creators and workers about the power stability, AC, acoustics, and host hospitality..."
              className="w-full p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white focus:outline-none focus:border-[#00C878]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Submit Review for {reviewTargetSpace.name}
          </button>
        </form>
      </div>
    </div>
  );
};
