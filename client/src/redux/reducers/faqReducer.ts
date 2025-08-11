// src/reducers/faqReducer.ts
import {
  GET_FAQS_REQUEST,
  GET_FAQS_SUCCESS,
  GET_FAQS_FAILURE,
  ADD_FAQ_REQUEST,
  ADD_FAQ_SUCCESS,
  ADD_FAQ_FAILURE,
  UPDATE_FAQ_REQUEST,
  UPDATE_FAQ_SUCCESS,
  UPDATE_FAQ_FAILURE,
  DELETE_FAQ_REQUEST,
  DELETE_FAQ_SUCCESS,
  DELETE_FAQ_FAILURE,
  CLEAR_FAQ_ERRORS,
  
} from "../constants/faqConstants";
import type {FAQ,
  FAQState} from "../constants/faqConstants"
import type { Reducer } from 'redux';

const initialState: FAQState = {
  faqs: [],
  loading: false,
  error: null,
  success: false,
};

export const faqReducer: Reducer<FAQState> = (state = initialState, action) => {
  switch (action.type) {
    // Get all FAQs
    case GET_FAQS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_FAQS_SUCCESS:
      return {
        ...state,
        loading: false,
        faqs: action.payload,
        error: null,
      };
    case GET_FAQS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Add a new FAQ
    case ADD_FAQ_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
      };
    case ADD_FAQ_SUCCESS:
      return {
        ...state,
        loading: false,
        faqs: [...state.faqs, action.payload],
        success: true,
        error: null,
      };
    case ADD_FAQ_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Update a FAQ
    case UPDATE_FAQ_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
      };
    case UPDATE_FAQ_SUCCESS:
      return {
        ...state,
        loading: false,
        faqs: state.faqs.map((faq) =>
          faq.id === action.payload.id ? action.payload : faq
        ),
        success: true,
        error: null,
      };
    case UPDATE_FAQ_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Delete a FAQ
    case DELETE_FAQ_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
      };
    case DELETE_FAQ_SUCCESS:
      return {
        ...state,
        loading: false,
        faqs: state.faqs.filter((faq) => faq.id !== action.payload),
        success: true,
        error: null,
      };
    case DELETE_FAQ_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Clear errors
    case CLEAR_FAQ_ERRORS:
      return {
        ...state,
        error: null,
        success: false,
      };

    default:
      return state;
  }
};