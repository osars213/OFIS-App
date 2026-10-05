import { Review } from '../types';
import { MOCK_REVIEWS } from '../mockData';
import { storage } from './storageService';
import { 
  getSupabaseClient, 
  mapDbReviewToReview, 
  mapReviewToDbReview 
} from './supabaseClient';

const REVIEWS_KEY = 'space_reviews';

export const reviewsService = {
  getReviewsForSpace: (spaceId: string): Review[] => {
    const allReviews = storage.get<Review[]>(REVIEWS_KEY, MOCK_REVIEWS);
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

        if (!error && data && data.length > 0) {
          const mapped: Review[] = data.map(mapDbReviewToReview);
          const allLocal = storage.get<Review[]>(REVIEWS_KEY, MOCK_REVIEWS);
          const otherSpaces = allLocal.filter(r => r.spaceId !== spaceId);
          storage.set(REVIEWS_KEY, [...mapped, ...otherSpaces]);
          return mapped;
        }
      } catch (err: any) {
        console.warn('[reviewsService] Error fetching reviews from Supabase:', err);
      }
    }
    return reviewsService.getReviewsForSpace(spaceId);
  },

  addReview: (review: Omit<Review, 'id' | 'createdAt'>): Review => {
    const allReviews = storage.get<Review[]>(REVIEWS_KEY, MOCK_REVIEWS);
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
      client.auth.getSession().then(({ data: sessionData }) => {
        const activeUserId = sessionData?.session?.user?.id || (newReview.userId && !newReview.userId.startsWith('user-') ? newReview.userId : undefined);
        const dbPayload = mapReviewToDbReview({
          ...newReview,
          userId: activeUserId || newReview.userId
        });
        client.from('reviews').insert(dbPayload).then(({ error }) => {
          if (error) console.warn('[reviewsService] Note syncing review to Supabase:', error.message);
        });
      }).catch(err => {
        console.warn('[reviewsService] Error saving review to Supabase:', err);
      });
    }

    return newReview;
  },

  toggleHelpful: (reviewId: string): { helpfulCount: number; isHelpful: boolean } => {
    const allReviews = storage.get<Review[]>(REVIEWS_KEY, MOCK_REVIEWS);
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
      client.from('reviews').update({ helpful_count: count }).eq('id', reviewId).then(null, () => {});
    }

    return { helpfulCount: count, isHelpful };
  }
};
