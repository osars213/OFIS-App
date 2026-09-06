import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Zap, 
  Wifi, 
  Volume2, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WriteReviewModal: React.FC = () => {
  const { 
    isWriteReviewOpen, 
    setIsWriteReviewOpen, 
    reviewSpace, 
    currentUser,
    bookings,
    submitPostVisitReview,
  } = useApp();
  
  const [rating, setRating] = useState(5);
  const [hostRating, setHostRating] = useState(5);
  const [powerRating, setPowerRating] = useState(5);
  const [internetRating, setInternetRating] = useState(5);
  const [noiseRating, setNoiseRating] = useState(4);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Guaranteed 24/7 Power',
    'High-Speed Fibre Internet',
  ]);

  if (!isWriteReviewOpen || !reviewSpace) return null;

  // Find if there is an associated completed booking
  const relevantBooking = bookings.find(b => b.spaceId === reviewSpace.id && b.userId === currentUser.id);
  const bookingId = relevantBooking?.id || `booking-${Date.now()}`;

  const availableAmenities = [
    'Guaranteed 24/7 Power',
    'High-Speed Fibre Internet',
    'Quiet Focus Zone',
    'Ergonomic Herman Miller Chairs',
    'Cold AC / Climate Control',
    'Host Welcome & Assistance',
    'Coffee / Refreshments Bar',
    'Phone Booths for Calls',
  ];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    submitPostVisitReview(bookingId, {
      rating,
      hostRating,
      powerRating,
      internetRating,
      noiseRating,
      comment: comment.trim(),
      verifiedAmenities: selectedAmenities,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsWriteReviewOpen(false);
      setComment('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#141816] rounded-3xl border border-[#E5E7EB] dark:border-[#232D28] shadow-2xl p-5 sm:p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#1E2522] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-[#16A34A] uppercase bg-[#DCFCE7] dark:bg-[#16A34A]/10 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Guest Review</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-[#F2F2F2] mt-1">Rate &amp; Review Workspace</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#718079]">{reviewSpace.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsWriteReviewOpen(false)}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#718079] hover:text-[#111827] dark:hover:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#18201B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#DCFCE7] dark:bg-[#16A34A]/15 text-[#16A34A] flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-[#111827] dark:text-[#F2F2F2]">Verified Review Published!</h4>
            <p className="text-xs text-[#6B7280] dark:text-[#718079] max-w-xs mx-auto">
              Your feedback is now live. Thank you for helping remote workers across Nigeria find trusted spaces.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
            {/* Overall Experience */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#111827] dark:text-[#F2F2F2]">Overall Experience</label>
                <span className="text-xs font-mono font-bold text-[#16A34A]">{rating} / 5 Stars</span>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-[#16A34A] text-[#16A34A]' : 'text-[#D1D5DB] dark:text-[#232D28]'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Infrastructure Ratings Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] dark:text-[#9EABA3]">Infrastructure Scorecard</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Power */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6B7280] dark:text-[#718079] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#16A34A]" />
                      <span>Power Uptime</span>
                    </span>
                    <span className="font-mono text-[#16A34A] font-bold">{powerRating}★</span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPowerRating(s)}
                        className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                          s <= powerRating ? 'bg-[#16A34A]' : 'bg-[#E5E7EB] dark:bg-[#232D28]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Internet */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6B7280] dark:text-[#718079] flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-[#16A34A]" />
                      <span>WiFi Speed</span>
                    </span>
                    <span className="font-mono text-[#16A34A] font-bold">{internetRating}★</span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setInternetRating(s)}
                        className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                          s <= internetRating ? 'bg-[#16A34A]' : 'bg-[#E5E7EB] dark:bg-[#232D28]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quietness */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6B7280] dark:text-[#718079] flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-[#16A34A]" />
                      <span>Quiet Level</span>
                    </span>
                    <span className="font-mono text-[#16A34A] font-bold">{noiseRating}★</span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNoiseRating(s)}
                        className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                          s <= noiseRating ? 'bg-[#16A34A]' : 'bg-[#E5E7EB] dark:bg-[#232D28]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Amenities Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] dark:text-[#9EABA3]">Verified On-Site Features</label>
              <div className="grid grid-cols-2 gap-2">
                {availableAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] font-medium flex items-center space-x-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/15 border-[#16A34A]/40 text-[#111827] dark:text-[#F2F2F2]'
                          : 'bg-white dark:bg-[#18201B] border-[#E5E7EB] dark:border-[#232D28] text-[#6B7280] dark:text-[#718079] hover:text-[#111827] dark:hover:text-[#9EABA3]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#16A34A] text-white' : 'bg-[#E5E7EB] dark:bg-[#232D28]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827] dark:text-[#F2F2F2]">Your Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share specific details about power stability during outages, desk comfort, staff friendliness, and overall work vibe..."
                rows={3}
                required
                className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-xs text-[#111827] dark:text-[#F2F2F2] placeholder-[#9CA3AF] dark:placeholder-[#718079] focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#9EABA3] hover:text-[#111827] dark:hover:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#18201B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Publish Verified Review
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
