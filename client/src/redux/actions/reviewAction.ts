import api from "../api";
import type { Dispatch, AnyAction } from "redux";
import {
  REVIEWS_FETCH_REQUEST, REVIEWS_FETCH_SUCCESS, REVIEWS_FETCH_FAIL,
  REVIEW_SUBMIT_REQUEST, REVIEW_SUBMIT_SUCCESS, REVIEW_SUBMIT_FAIL,
  REVIEW_DELETE_REQUEST, REVIEW_DELETE_SUCCESS, REVIEW_DELETE_FAIL,
  REVIEW_TOGGLE_VIS_REQUEST, REVIEW_TOGGLE_VIS_SUCCESS, REVIEW_TOGGLE_VIS_FAIL,
} from "../constants/reviewConstants";

const getErr = (error: any): string =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Request failed";

export const fetchReviews = (productId: string) => async (dispatch: Dispatch<AnyAction>) => {
  dispatch({ type: REVIEWS_FETCH_REQUEST });
  try {
    const token = localStorage.getItem("token");
    const url = token ? `/api/reviews/product/${productId}` : `/api/reviews/public/${productId}`;
    const { data } = await api.get(url);
    dispatch({ type: REVIEWS_FETCH_SUCCESS, payload: data.data });
  } catch (error: any) {
    dispatch({ type: REVIEWS_FETCH_FAIL, payload: getErr(error) });
  }
};

export const submitReview = (productId: string, rating: number, comment: string) =>
  async (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: REVIEW_SUBMIT_REQUEST });
    try {
      const { data } = await api.post("/api/reviews", { product_id: productId, rating, comment });
      dispatch({ type: REVIEW_SUBMIT_SUCCESS, payload: data.data });
      return data;
    } catch (error: any) {
      const msg = getErr(error);
      dispatch({ type: REVIEW_SUBMIT_FAIL, payload: msg });
      throw new Error(msg);
    }
  };

export const deleteReview = (reviewId: string) => async (dispatch: Dispatch<AnyAction>) => {
  dispatch({ type: REVIEW_DELETE_REQUEST });
  try {
    await api.delete(`/api/reviews/${reviewId}`);
    dispatch({ type: REVIEW_DELETE_SUCCESS, payload: reviewId });
  } catch (error: any) {
    dispatch({ type: REVIEW_DELETE_FAIL, payload: getErr(error) });
  }
};

export const toggleReviewVisibility = (reviewId: string) => async (dispatch: Dispatch<AnyAction>) => {
  dispatch({ type: REVIEW_TOGGLE_VIS_REQUEST });
  try {
    const { data } = await api.patch(`/api/reviews/${reviewId}/visibility`);
    dispatch({ type: REVIEW_TOGGLE_VIS_SUCCESS, payload: { reviewId, isVisible: data.data.isVisible } });
  } catch (error: any) {
    dispatch({ type: REVIEW_TOGGLE_VIS_FAIL, payload: getErr(error) });
  }
};
