import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Review } from '../types';
import { INITIAL_REVIEWS } from '../mockData';

export const reviewsService = {
  async fetchReviewsForSpace(spaceId: string): Promise<{ reviews: Review[]; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      const spaceReviews = INITIAL_REVIEWS.filter(r => r.spaceId === spaceId);
      return { reviews: spaceReviews.length > 0 ? spaceReviews : INITIAL_REVIEWS.slice(0, 3), error: null };
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!user_id (
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) {
        return { reviews: INITIAL_REVIEWS.filter(r => r.spaceId === spaceId), error: error.message };
      }

      const reviews: Review[] = (data || []).map((row: any) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

        return {
          id: row.id,
          spaceId: row.space_id,
          userId: row.user_id,
          userName: profile?.full_name || 'Coworker',
          userAvatar: profile?.avatar_url,
          userRole: profile?.role,
          rating: Number(row.rating),
          subRatings: {
            cleanliness: Number(row.cleanliness) || 5,
            wifiSpeed: Number(row.wifi_speed) || 5,
            noiseComfort: Number(row.noise_comfort) || 5,
            ergonomics: Number(row.ergonomics) || 5,
            amenities: Number(row.amenities_rating) || 5,
          },
          title: row.title,
          comment: row.comment,
          deskCode: row.desk_code,
          deskName: row.desk_name,
          isVerifiedStay: row.is_verified_stay ?? true,
          bookingId: row.booking_id,
          createdAt: row.created_at,
          helpfulCount: Number(row.helpful_count) || 0,
          helpfulUserIds: row.helpful_user_ids || [],
          hostReply: row.host_reply || undefined,
        };
      });

      return { reviews, error: null };
    } catch (err: any) {
      return { reviews: INITIAL_REVIEWS.filter(r => r.spaceId === spaceId), error: err.message };
    }
  },

  async createReview(
    reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'helpfulUserIds'>
  ): Promise<{ review: Review | null; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      const mockRev: Review = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        createdAt: new Date().toISOString(),
        helpfulCount: 0,
        helpfulUserIds: [],
      };
      return { review: mockRev, error: null };
    }

    try {
      const payload = {
        space_id: reviewData.spaceId,
        user_id: reviewData.userId,
        booking_id: reviewData.bookingId || null,
        rating: reviewData.rating,
        cleanliness: reviewData.subRatings?.cleanliness || 5,
        wifi_speed: reviewData.subRatings?.wifiSpeed || 5,
        noise_comfort: reviewData.subRatings?.noiseComfort || 5,
        ergonomics: reviewData.subRatings?.ergonomics || 5,
        amenities_rating: reviewData.subRatings?.amenities || 5,
        title: reviewData.title,
        comment: reviewData.comment,
        desk_code: reviewData.deskCode || '',
        desk_name: reviewData.deskName || '',
        is_verified_stay: reviewData.isVerifiedStay ?? true,
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        return { review: null, error: error.message };
      }

      const createdReview: Review = {
        ...reviewData,
        id: data.id,
        createdAt: data.created_at,
        helpfulCount: 0,
        helpfulUserIds: [],
      };

      return { review: createdReview, error: null };
    } catch (err: any) {
      return { review: null, error: err.message || 'Failed to submit review' };
    }
  },

  async toggleHelpful(reviewId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, error: null };
    }

    try {
      // 1. Try secure review_helpful_votes table first
      const { data: existingVote } = await supabase
        .from('review_helpful_votes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingVote) {
        const { error: delError } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('id', existingVote.id);
        if (!delError) return { success: true, error: null };
      } else {
        const { error: insError } = await supabase
          .from('review_helpful_votes')
          .insert({ review_id: reviewId, user_id: userId });
        if (!insError) return { success: true, error: null };
      }

      // 2. Direct review array fallback if review_helpful_votes is not yet migrated
      const { data: rev } = await supabase
        .from('reviews')
        .select('helpful_user_ids, helpful_count')
        .eq('id', reviewId)
        .single();

      if (!rev) return { success: false, error: 'Review not found' };

      const userIds: string[] = rev.helpful_user_ids || [];
      const alreadyVoted = userIds.includes(userId);
      const updatedUserIds = alreadyVoted
        ? userIds.filter(id => id !== userId)
        : [...userIds, userId];

      const { error } = await supabase
        .from('reviews')
        .update({
          helpful_user_ids: updatedUserIds,
          helpful_count: updatedUserIds.length,
        })
        .eq('id', reviewId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
