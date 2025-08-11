// src/actions/faqAction.ts
import api from "../api";
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
 type FAQ
} from "../constants/faqConstants";
import type { Dispatch } from "redux";
// Helper function to extract error message
const getErrorMessage = (error: any): string => {
    return error.response?.data?.message || error.message || "An error occurred";
  };

// Get all FAQs
export const getAllFaqs = () => async (dispatch: Dispatch): Promise<void> => {
  try {

      dispatch({ type: GET_FAQS_REQUEST });
      console.log("Dispatched GET_FAQS_REQUEST"); // Debug log

      // Replace with your API endpoint
      console.log("Fetching FAQs from API..."); // Debug log
      const { data } = await api.get("faq/");
      console.log("API response:", data); // Debug log

      dispatch({
        type: GET_FAQS_SUCCESS,
        payload: data,
      });
      console.log("Dispatched GET_FAQS_SUCCESS with payload:", data); // Debug log
    
  } catch (error) {
    console.error("Error in getAllFaqs:", error); // Debug log
    dispatch({
      type: GET_FAQS_FAILURE,
      payload: getErrorMessage(error),
    });
  }
};

// Add a new FAQ
export const addFaq = (faqData: Partial<FAQ>) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
  try {
    dispatch({ type: ADD_FAQ_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Replace with your API endpoint
    const { data } = await api.post("faq/", faqData, config);

    dispatch({
      type: ADD_FAQ_SUCCESS,
      payload: data.faq,
    });

    return "success";
  } catch (error) {
    dispatch({
      type: ADD_FAQ_FAILURE,
      payload: getErrorMessage(error),
    });

    return "error";
  }
};

// Update a FAQ
export const updateFaq = (id: string, faqData: Partial<FAQ>) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
  try {
    dispatch({ type: UPDATE_FAQ_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Replace with your API endpoint
    const { data } = await api.put(`faq/${id}`, faqData, config);

    dispatch({
      type: UPDATE_FAQ_SUCCESS,
      payload: data.faq,
    });

    return "success";
  } catch (error) {
    dispatch({
      type: UPDATE_FAQ_FAILURE,
      payload: getErrorMessage(error),
    });

    return "error";
  }
};

// Delete a FAQ
export const deleteFaq = (id: string) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
  try {
    dispatch({ type: DELETE_FAQ_REQUEST });

    // Replace with your API endpoint
    await api.delete(`/faq/${id}`);

    dispatch({
      type: DELETE_FAQ_SUCCESS,
      payload: id,
    });

    return "success";
  } catch (error) {
    dispatch({
      type: DELETE_FAQ_FAILURE,
      payload: getErrorMessage(error),
    });

    return "error";
  }
};

// Clear errors
export const clearFaqErrors = () => ({
  type: CLEAR_FAQ_ERRORS,
});