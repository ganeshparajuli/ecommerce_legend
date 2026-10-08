import {
  REVIEWS_FETCH_REQUEST, REVIEWS_FETCH_SUCCESS, REVIEWS_FETCH_FAIL,
  REVIEW_SUBMIT_REQUEST, REVIEW_SUBMIT_SUCCESS, REVIEW_SUBMIT_FAIL,
  REVIEW_DELETE_REQUEST, REVIEW_DELETE_SUCCESS, REVIEW_DELETE_FAIL,
  REVIEW_TOGGLE_VIS_REQUEST, REVIEW_TOGGLE_VIS_SUCCESS, REVIEW_TOGGLE_VIS_FAIL,
  REVIEW_CLEAR_ERROR,
} from "../constants/reviewConstants";

export interface ReviewUser {
  id: string;
  name: string;
  image?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  user?: ReviewUser;
}

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  submitting: false,
  error: null,
};

export const reviewReducer = (state = initialState, action: any): ReviewState => {
  switch (action.type) {
    case REVIEWS_FETCH_REQUEST:
      return { ...state, loading: true, error: null };
    case REVIEWS_FETCH_SUCCESS:
      return { ...state, loading: false, reviews: action.payload };
    case REVIEWS_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };

    case REVIEW_SUBMIT_REQUEST:
      return { ...state, submitting: true, error: null };
    case REVIEW_SUBMIT_SUCCESS:
      return { ...state, submitting: false, reviews: [action.payload, ...state.reviews] };
    case REVIEW_SUBMIT_FAIL:
      return { ...state, submitting: false, error: action.payload };

    case REVIEW_DELETE_SUCCESS:
      return { ...state, reviews: state.reviews.filter((r) => r.id !== action.payload) };

    case REVIEW_TOGGLE_VIS_SUCCESS:
      return {
        ...state,
        reviews: state.reviews.map((r) =>
          r.id === action.payload.reviewId ? { ...r, isVisible: action.payload.isVisible } : r
        ),
      };

    case REVIEW_CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};
