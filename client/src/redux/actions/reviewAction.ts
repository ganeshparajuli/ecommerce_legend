// src/actions/reviewAction.ts
import {
    GetUserReviews,
    DeleteReview,
    ClearReviewErrors,
    Review
  } from "../constants/reviewConstants";
  import api from "../api";
  import { Dispatch } from "redux";
// Helper function to extract error message
const getErrorMessage = (error: any): string => {
    return error.response?.data?.message || error.message || "An error occurred";
  };
  
  // Get user's reviews
  export const getUserReviews = () => async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch({ type: GetUserReviews.Request });
  
      const { data } = await api.get("reviews/user");
  
      dispatch({
        type: GetUserReviews.Success,
        payload: data.reviews || [],
      });
    } catch (error) {
      dispatch({
        type: GetUserReviews.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Delete a review
  export const deleteReview = (reviewId: string) => async (dispatch: Dispatch): Promise<boolean> => {
    try {
      dispatch({ type: DeleteReview.Request });
  
      await api.delete(`reviews/${reviewId}`);
  
      dispatch({
        type: DeleteReview.Success,
        payload: reviewId,
      });
  
      return true;
    } catch (error) {
      dispatch({
        type: DeleteReview.Fail,
        payload: getErrorMessage(error),
      });
  
      return false;
    }
  };
  
  // Clear review errors
  export const clearReviewErrors = () => ({
    type: ClearReviewErrors,
  });