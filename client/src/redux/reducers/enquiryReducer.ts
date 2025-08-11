// src/reducers/enquiryReducer.ts
import {
  GET_ENQUIRIES_REQUEST,
  GET_ENQUIRIES_SUCCESS,
  GET_ENQUIRIES_FAILURE,
  GET_ENQUIRY_DETAILS_REQUEST,
  GET_ENQUIRY_DETAILS_SUCCESS,
  GET_ENQUIRY_DETAILS_FAILURE,
  UPDATE_ENQUIRY_STATUS_REQUEST,
  UPDATE_ENQUIRY_STATUS_SUCCESS,
  UPDATE_ENQUIRY_STATUS_FAILURE,
  SEND_ENQUIRY_REPLY_REQUEST,
  SEND_ENQUIRY_REPLY_SUCCESS,
  SEND_ENQUIRY_REPLY_FAILURE,
  DELETE_ENQUIRY_REQUEST,
  DELETE_ENQUIRY_SUCCESS,
  DELETE_ENQUIRY_FAILURE,
  CLEAR_ENQUIRY_ERRORS,
  Enquiry,
  EnquiryState
} from "../constants/enquiryConstants";
import { Reducer } from 'redux';

const initialState: EnquiryState = {
  enquiries: [],
  enquiry: null,
  loading: false,
  error: null,
  success: false,
  totalCount: 0,
  unreadCount: 0,
};

export const enquiryReducer: Reducer<EnquiryState> = (state = initialState, action) => {
  switch (action.type) {
    // Get all enquiries
    case GET_ENQUIRIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_ENQUIRIES_SUCCESS:
      return {
        ...state,
        loading: false,
        enquiries: action.payload.enquiries,
        totalCount: action.payload.totalCount,
        unreadCount: action.payload.unreadCount,
        error: null,
      };
    case GET_ENQUIRIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Get enquiry details
    case GET_ENQUIRY_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_ENQUIRY_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        enquiry: action.payload,
        error: null,
      };
    case GET_ENQUIRY_DETAILS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update enquiry status
    case UPDATE_ENQUIRY_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };
    case UPDATE_ENQUIRY_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        enquiries: state.enquiries.map((enquiry) =>
          enquiry.id === action.payload.id
            ? { ...enquiry, status: action.payload.status }
            : enquiry
        ),
        enquiry:
          state.enquiry && state.enquiry.id === action.payload.id
            ? { ...state.enquiry, status: action.payload.status }
            : state.enquiry,
        unreadCount:
          action.payload.status === "read"
            ? state.unreadCount - 1
            : action.payload.status === "unread"
            ? state.unreadCount + 1
            : state.unreadCount,
        success: true,
        error: null,
      };
    case UPDATE_ENQUIRY_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Send enquiry reply
    case SEND_ENQUIRY_REPLY_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };
    case SEND_ENQUIRY_REPLY_SUCCESS:
      return {
        ...state,
        loading: false,
        enquiry: state.enquiry ? {
          ...state.enquiry,
          replies: [...(state.enquiry.replies || []), action.payload],
        } : null,
        success: true,
        error: null,
      };
    case SEND_ENQUIRY_REPLY_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Delete enquiry
    case DELETE_ENQUIRY_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };
    case DELETE_ENQUIRY_SUCCESS:
      return {
        ...state,
        loading: false,
        enquiries: state.enquiries.filter(
          (enquiry) => enquiry.id !== action.payload
        ),
        totalCount: state.totalCount - 1,
        unreadCount:
          state.enquiries.find((enquiry) => enquiry.id === action.payload)
            ?.status === "unread"
            ? state.unreadCount - 1
            : state.unreadCount,
        success: true,
        error: null,
      };
    case DELETE_ENQUIRY_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Clear errors
    case CLEAR_ENQUIRY_ERRORS:
      return {
        ...state,
        error: null,
        success: false,
      };

    default:
      return state;
  }
};

export default enquiryReducer;