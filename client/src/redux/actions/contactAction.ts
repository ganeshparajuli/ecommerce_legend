// src/actions/contactAction.ts - FIXED VERSION with proper return status
import {
  CreateContact,
  GetAllContacts,
  GetSingleContact,
  UpdateContact,
  DeleteContact,
  ClearContact,
  ClearContactErrors,
  type Contact
} from "../constants/contactConstants";
import api from "../api";
import type { Dispatch } from "redux";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || "An error occurred";
};

// CRITICAL: Helper function to safely clone any data before dispatching
const safeClone = (data: any): any => {
if (data === null || data === undefined) return data;
try {
  return JSON.parse(JSON.stringify(data));
} catch (error) {
  console.error("Failed to clone data:", error);
  return data;
}
};

// FIXED: Create new contact with proper cloning and return status
export const createContact = (contactData: Partial<Contact>) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
  try {
    dispatch({ type: CreateContact.Request });

    const token = localStorage.getItem("token");
    const config = token ? {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    } : {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data } = await api.post("contact/", contactData, config);
    
    // Debug log to see what we're getting
    console.log('createContact - Raw API response:', data);

    // Handle different response formats
    let contactResult;
    if (data.data) {
      // API returns {data: {...}}
      contactResult = data.data;
    } else if (Array.isArray(data)) {
      // API returns array
      contactResult = data[0] || data;
    } else {
      // API returns contact directly
      contactResult = data;
    }

    console.log('createContact - Processed contact:', contactResult);

    // FIXED: Deep clone before dispatching
    dispatch({
      type: CreateContact.Success,
      payload: safeClone(contactResult),
    });

    return "success";
  } catch (error) {
    console.error('createContact - Error:', error);
    dispatch({
      type: CreateContact.Fail,
      payload: getErrorMessage(error),
    });
    return "error";
  }
};

// FIXED: Get all contacts with proper cloning
export const getAllContacts = () => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: GetAllContacts.Request });

    const token = localStorage.getItem("token");
    console.log('getAllContacts - Token found:', !!token);
    
    if (!token) {
      throw new Error("No token found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    console.log('getAllContacts - Making API call to contact/ with config:', config);
    const { data } = await api.get("contact/", config);
    
    // Debug log to see what we're getting
    console.log('getAllContacts - Raw API response:', data);
    console.log('getAllContacts - Response type:', typeof data);
    console.log('getAllContacts - Is array:', Array.isArray(data));

    // Handle different response formats
    let contactsArray;
    if (Array.isArray(data)) {
      // API returns array directly
      contactsArray = data;
      console.log('getAllContacts - Using direct array format');
    } else if (data.contacts && Array.isArray(data.contacts)) {
      // API returns {contacts: [...]}
      contactsArray = data.contacts;
      console.log('getAllContacts - Using data.contacts format');
    } else if (data.data && Array.isArray(data.data)) {
      // API returns {data: [...]}
      contactsArray = data.data;
      console.log('getAllContacts - Using data.data format');
    } else {
      // Fallback - wrap single contact in array
      contactsArray = data ? [data] : [];
      console.log('getAllContacts - Using fallback format');
    }

    console.log('getAllContacts - Final contacts array:', contactsArray);
    console.log('getAllContacts - Array length:', contactsArray.length);

    // FIXED: Deep clone before dispatching
    dispatch({
      type: GetAllContacts.Success,
      payload: safeClone(contactsArray),
    });
  } catch (error) {
    console.error('getAllContacts - Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      error
    });
    dispatch({
      type: GetAllContacts.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Get single contact by ID with proper cloning
export const getContactById = (id: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: GetSingleContact.Request });

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await api.get(`contact/${id}`, config);

    // FIXED: Deep clone before dispatching
    dispatch({
      type: GetSingleContact.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: GetSingleContact.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Update contact status with proper cloning
export const updateContactStatus = (id: string, status: string) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
  try {
    dispatch({ type: UpdateContact.Request });

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    };

    const { data } = await api.put(`contact/${id}`, { status }, config);

    // FIXED: Deep clone before dispatching
    dispatch({
      type: UpdateContact.Success,
      payload: safeClone(data.data),
    });

    return "success";
  } catch (error) {
    dispatch({
      type: UpdateContact.Fail,
      payload: getErrorMessage(error),
    });
    return "error";
  }
};

// Delete contact - no changes needed as it only sends ID
export const deleteContact = (id: string) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
  try {
    dispatch({ type: DeleteContact.Request });

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.delete(`contact/${id}`, config);
    if (response.data && (response.data.success || response.data.message)) {
      dispatch({
        type: DeleteContact.Success,
        payload: id, // Just an ID, no cloning needed
      });

      return "success";
    } else {
      throw new Error("No success response received");
    }
  } catch (error) {
    dispatch({
      type: DeleteContact.Fail,
      payload: getErrorMessage(error),
    });
    return "error";
  }
};

// Clear contacts from state - no changes needed
export const clearContact = () => ({
  type: ClearContact,
});

// Clear contact errors - no changes needed
export const clearContactErrors = () => ({
  type: ClearContactErrors,
});