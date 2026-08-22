import React, { useState } from 'react';
import { X, Star, MessageSquarePlus, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { reviewsService } from '../services/reviewsService';

export const WriteReviewModal: React.FC = () => {
  const { 
    writeReviewModalData, 
    setWriteReviewModalData, 
    currentUser, 
    refreshBookings,
    showToast 
  } = useApp();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['24/7 Power', 'Fast Wifi']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!writeReviewModalData) return null;

  const AVAILABLE_TAGS = [
    '24/7 Power',
    'Fast Wifi',
    'Ergonomic Chairs',
    'Cold AC',
    'Quiet Atmosphere',
    'Friendly Staff',
    'Instant Turnstile Access',
    'Great Coffee'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter a brief comment about your experience.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      reviewsService.addReview({
        spaceId: writeReviewModalData.spaceId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatarUrl,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
      });

      setIsSubmitting(false);
      setWriteReviewModalData(null);
      refreshBookings();
      showToast('Verified review submitted successfully!');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-[#00C878]" />
            <div>
              <h3 className="text-base font-bold text-[#F2F2F2]">Leave a Verified Review</h3>
              <p className="text-xs text-[#9EABA3]">{writeReviewModalData.spaceTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWriteReviewModalData(null)}
            className="p-1.5 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Verified Badge info */}
          <div className="p-3 rounded-xl bg-[#17201B] border border-[#232D28] flex items-center gap-2 text-xs text-[#00C878]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Verified stay confirmed on OFIS network. Your review helps other professionals choose reliable workspaces.</span>
          </div>

          {/* Star Rating */}
          <div className="space-y-1.5 text-center sm:text-left">
            <label className="text-xs font-semibold text-[#9EABA3]">Overall Rating</label>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 transition-transform hover:scale-110"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-[#35433C]'}`} />
                </button>
              ))}
              <span className="text-xs font-bold text-[#F2F2F2] ml-2">{rating}.0 / 5.0</span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9EABA3]">What was standout?</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                        : 'bg-[#161D19] border-[#232D28] text-[#718079] hover:text-[#9EABA3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#9EABA3]">Your Review</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the power stability, WiFi speed, and noise level?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161D19] border border-[#232D28] text-xs text-[#F2F2F2] placeholder-[#718079] focus:outline-none focus:border-[#00C878] transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setWriteReviewModalData(null)}
              className="flex-1 py-2.5 rounded-xl bg-[#161D19] border border-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
