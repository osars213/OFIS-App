import { Review, Booking } from '../types';
import { MOCK_REVIEWS } from '../mockData';
import { storageService } from './storageService';

const REVIEWS_KEY = 'space_reviews';

export const reviewsService = {
  getReviewsForSpace(spaceId: string): Review[] {
    const stored = storageService.getItem<Review[]>(REVIEWS_KEY, []);
    const all = [...stored, ...MOCK_REVIEWS];
    return all.filter(r => r.spaceId === spaceId);
  },

  getAllReviews(): Review[] {
    const stored = storageService.getItem<Review[]>(REVIEWS_KEY, []);
    return [...stored, ...MOCK_REVIEWS];
  },

  /**
   * Verification rule:
   * A user can only write a review if:
   * 1. They have a completed booking (bookingStatus === 'completed') for this space.
   * 2. They haven't already reviewed this space.
   */
  canUserReviewSpace(userId: string, spaceId: string, userBookings: Booking[]): { canReview: boolean; reason?: string } {
    const hasCompletedBooking = userBookings.some(
      b => b.userId === userId && b.spaceId === spaceId && b.bookingStatus === 'completed'
    );

    if (!hasCompletedBooking) {
      return {
        canReview: false,
        reason: 'Reviews are exclusively enabled for verified guests who have completed a stay at this space.'
      };
    }

    const existingReviews = this.getReviewsForSpace(spaceId);
    const hasAlreadyReviewed = existingReviews.some(r => r.userId === userId);

    if (hasAlreadyReviewed) {
      return {
        canReview: false,
        reason: 'You have already submitted a verified review for this workspace.'
      };
    }

    return { canReview: true };
  },

  addReview(review: Omit<Review, 'id' | 'date' | 'verifiedStay'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: 'Today',
      verifiedStay: true
    };
    const stored = storageService.getItem<Review[]>(REVIEWS_KEY, []);
    storageService.setItem(REVIEWS_KEY, [newReview, ...stored]);
    return newReview;
  }
};
