import { ActionTypes } from '../types/actionTypes';

export const GetUserReviews: ActionTypes = {
  Request: "getUserReviewsRequest",
  Success: "getUserReviewsSuccess",
  Fail: "getUserReviewsFail",
};

export const DeleteReview: ActionTypes = {
  Request: "deleteReviewRequest",
  Success: "deleteReviewSuccess",
  Fail: "deleteReviewFail",
};

export const ClearReviewErrors: string = "clearReviewErrors";

// Review-specific types
export type Review = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  userName?: string;
  productName?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReviewState = {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  success: boolean;
  isDeleted: boolean;
};