import { Review } from '../types';
import { MOCK_REVIEWS } from '../mockData';
import { storage } from './storageService';
import { getSupabaseClient, isSupabaseConfigured, mapDbReviewToReview, mapReviewToDbReview } from './supabaseClient';

const REVIEWS_KEY = 'space_reviews';

export const reviewsService = {
  getReviewsForSpace: (spaceId: string): Review[] => {
    const defaultReviews = isSupabaseConfigured() ? [] : MOCK_REVIEWS;
    const allReviews = storage.get<Review[]>(REVIEWS_KEY, defaultReviews);
    return allReviews.filter(r => r.spaceId === spaceId);
  },

  fetchReviewsAsync: async (spaceId: string): Promise<Review[]> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('reviews')
          .select('*')
          .eq('space_id', spaceId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: Review[] = data.map(mapDbReviewToReview);
          
          // Update cached reviews for this space
          const allLocal = storage.get<Review[]>(REVIEWS_KEY, []);
          const otherSpaces = allLocal.filter(r => r.spaceId !== spaceId);
          storage.set(REVIEWS_KEY, [...mapped, ...otherSpaces]);
          
          return mapped;
        }
      } catch (err) {
        console.warn('[reviewsService] Error fetching reviews from Supabase:', err);
      }
    }
    return reviewsService.getReviewsForSpace(spaceId);
  },

  addReview: (review: Omit<Review, 'id' | 'createdAt'>): Review => {
    const defaultReviews = isSupabaseConfigured() ? [] : MOCK_REVIEWS;
    const allReviews = storage.get<Review[]>(REVIEWS_KEY, defaultReviews);
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      isHelpfulByUser: false,
    };
    allReviews.unshift(newReview);
    storage.set(REVIEWS_KEY, allReviews);

    // Sync to Supabase in background
    const client = getSupabaseClient();
    if (client) {
      const dbPayload = mapReviewToDbReview(newReview);
      client.from('reviews').insert(dbPayload).then(async ({ error }) => {
        if (!error) {
          // Update space review count and rating
          try {
            const spaceReviews = allReviews.filter(r => r.spaceId === review.spaceId);
            const avgRating = Number((spaceReviews.reduce((sum, r) => sum + r.rating, 0) / spaceReviews.length).toFixed(2));
            await client.from('spaces').update({
              reviews_count: spaceReviews.length,
              rating: avgRating,
            }).eq('id', review.spaceId);
          } catch (updateErr) {
            console.warn('[reviewsService] Note updating space rating in Supabase:', updateErr);
          }
        }
      });
    }

    return newReview;
  },

  toggleHelpful: (reviewId: string): { helpfulCount: number; isHelpful: boolean } => {
    const defaultReviews = isSupabaseConfigured() ? [] : MOCK_REVIEWS;
    const allReviews = storage.get<Review[]>(REVIEWS_KEY, defaultReviews);
    const revIndex = allReviews.findIndex(r => r.id === reviewId);
    if (revIndex === -1) return { helpfulCount: 0, isHelpful: false };

    const current = allReviews[revIndex];
    const isHelpful = !current.isHelpfulByUser;
    const count = Math.max(0, (current.helpfulCount || 0) + (isHelpful ? 1 : -1));
    
    allReviews[revIndex] = {
      ...current,
      helpfulCount: count,
      isHelpfulByUser: isHelpful,
    };

    storage.set(REVIEWS_KEY, allReviews);

    const client = getSupabaseClient();
    if (client) {
      client.from('reviews').update({ helpful_count: count }).eq('id', reviewId).then(() => {});
    }

    return { helpfulCount: count, isHelpful };
  }
};
