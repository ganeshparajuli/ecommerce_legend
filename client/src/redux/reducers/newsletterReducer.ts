// src/redux/reducers/newsletterReducer.ts
import {
  GetAllNewsletters,
  CreateNewsletter,
  UpdateNewsletter,
  DeleteNewsletter,
  ClearNewsletterErrors,
} from "../constants/newsletterConstant";
import type { NewsletterState } from "../constants/newsletterConstant";

// CRITICAL: Proper initial state to prevent undefined errors
const initialState: NewsletterState = {
  newsletters: [], // Always initialize as empty array
  newsletter: null,
  loading: false,
  error: null,
  success: false,
  isUpdated: false,
  isDeleted: false,
};

export const newsletterReducer = (
  state: NewsletterState = initialState, // Ensure state defaults to initialState
  action: any
): NewsletterState => {
  switch (action.type) {
    // Get All Newsletters
    case GetAllNewsletters.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetAllNewsletters.Success:
      return {
        ...state,
        loading: false,
        newsletters: Array.isArray(action.payload) ? action.payload : [], // Ensure it's always an array
        error: null,
      };

    case GetAllNewsletters.Fail:
      return {
        ...state,
        loading: false,
        newsletters: [], // Keep empty array on error
        error: action.payload || "Failed to fetch newsletters",
      };

    // Create Newsletter
    case CreateNewsletter.Request:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };

    case CreateNewsletter.Success:
      return {
        ...state,
        loading: false,
        success: true,
        newsletter: action.payload,
        newsletters: state.newsletters ? [...state.newsletters, action.payload] : [action.payload],
        error: null,
      };

    case CreateNewsletter.Fail:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload || "Failed to create newsletter",
      };

    case CreateNewsletter.Reset:
      return {
        ...state,
        loading: false,
        success: false,
        newsletter: null,
        error: null,
      };

    // Update Newsletter
    case UpdateNewsletter.Request:
      return {
        ...state,
        loading: true,
        isUpdated: false,
        error: null,
      };

    case UpdateNewsletter.Success:
      return {
        ...state,
        loading: false,
        isUpdated: true,
        newsletter: action.payload,
        newsletters: state.newsletters 
          ? state.newsletters.map(item => 
              (item._id === action.payload._id || item.id === action.payload.id) 
                ? action.payload 
                : item
            )
          : [action.payload],
        error: null,
      };

    case UpdateNewsletter.Fail:
      return {
        ...state,
        loading: false,
        isUpdated: false,
        error: action.payload || "Failed to update newsletter",
      };

    case UpdateNewsletter.Reset:
      return {
        ...state,
        loading: false,
        isUpdated: false,
        error: null,
      };

    // Delete Newsletter
    case DeleteNewsletter.Request:
      return {
        ...state,
        loading: true,
        isDeleted: false,
        error: null,
      };

    case DeleteNewsletter.Success:
      return {
        ...state,
        loading: false,
        isDeleted: true,
        newsletters: state.newsletters 
          ? state.newsletters.filter(item => 
              item._id !== action.payload && item.id !== action.payload
            )
          : [],
        error: null,
      };

    case DeleteNewsletter.Fail:
      return {
        ...state,
        loading: false,
        isDeleted: false,
        error: action.payload || "Failed to delete newsletter",
      };

    case DeleteNewsletter.Reset:
      return {
        ...state,
        loading: false,
        isDeleted: false,
        error: null,
      };

    // Clear Errors
    case ClearNewsletterErrors:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Export as default to ensure proper import
export default newsletterReducer;