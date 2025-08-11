// Updated userActions.ts - COMPLETE FIXED VERSION with deep cloning and infinite loop prevention
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_LOGOUT,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  AllUser
} from "../constants/userConstants";
import {myOrders} from "../actions/orderAction"
import {getCart} from "../actions/cartAction"
import {getWishlist} from "../actions/wishlistActions"
import api from "../api";
import type { Dispatch, AnyAction } from "redux";

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

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
  isProfileComplete?: boolean;
  [key: string]: any;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// FIXED: Load all user data with proper error handling and sequencing
export const loadAllUserData = () => async (dispatch: Dispatch<AnyAction>) => {
  try {
    console.log("🔄 Loading all user data...");
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Extract user ID from token
    const getUserIdFromToken = (token: string): string | null => {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const decodedToken = JSON.parse(jsonPayload);
        return decodedToken.id || decodedToken.sub || decodedToken.user_id || null;
      } catch (e) {
        console.error("Error decoding token:", e);
        return null;
      }
    };

    const userId = getUserIdFromToken(token);
    if (!userId) {
      throw new Error("Could not extract user ID from token");
    }

    // FIXED: Load user data sequentially to avoid race conditions
    console.log("Loading user profile...");
    const userResult = await dispatch(loadUser() as any);
    
    if (userResult?.success) {
      console.log("User profile loaded, loading additional data...");
      
      // Load other data in parallel only after user is loaded
      const results = await Promise.allSettled([
        dispatch(myOrders(userId) as any),
        dispatch(getWishlist() as any),
        dispatch(getCart() as any),
      ]);

      // Log any failures without throwing
      results.forEach((result, index) => {
        const actionNames = ['myOrders', 'getWishlist', 'getCart'];
        if (result.status === 'rejected') {
          console.warn(`⚠️ Failed to load ${actionNames[index]}:`, result.reason);
        }
      });
    }

    console.log("✅ All user data loaded successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error loading user data:", error);
    // Don't re-throw to prevent cascading errors
    return { success: false, error };
  }
};

// login User
export const login = (userData: LoginCredentials) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const link = `user/login`;
    const response = await api.post(link, userData);

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    sessionStorage.setItem("token", token);
    localStorage.removeItem("loggedOut");
    
    // Log the user role for debugging
    console.log("Login successful with role:", user.role);

    // FIXED: Dispatch success action with DEEP CLONED user data
    dispatch({ 
      type: USER_LOGIN_SUCCESS, 
      payload: safeClone(user)
    });

    return {
      success: true,
      payload: { user: safeClone(user) }
    };
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_LOGIN_FAIL, payload: errorMessage });

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// register User
export const register = (userData: RegisterData) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    const link = `user/register`;
    const response = await api.post(link, userData);
    const { token, user } = response.data;

    // Store token only, not user data
    localStorage.setItem("token", token);
    sessionStorage.setItem("token", token);
    
    // Set new registration flag
    localStorage.setItem("newRegistration", "true");
    
    // Clear any dismissed modal flag from previous sessions
    localStorage.removeItem("profileModalDismissed");
    
    // Clear logged out flag if it exists
    localStorage.removeItem("loggedOut");
    
    // FIXED: Dispatch success action with DEEP CLONED user data
    dispatch({ 
      type: USER_REGISTER_SUCCESS, 
      payload: safeClone(user)
    });

    console.log("Registration successful, new user flag set");
    
    return {
      success: true,
      payload: { user: safeClone(user) }
    };
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_REGISTER_FAIL, payload: errorMessage });
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// add user Admin
export const addUser = (userData: RegisterData) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      dispatch({ type: USER_REGISTER_REQUEST }); // Reusing registration request type
      const link = `user/add`;
      const response = await api.post(link, userData, config);
      const { user } = response.data;
      
      // FIXED: Dispatch success action with DEEP CLONED user data
      dispatch({ 
        type: USER_REGISTER_SUCCESS, 
        payload: safeClone(user)
      });
      
      return {
        success: true,
        payload: { user: safeClone(user) }
      };
    } else {
      dispatch({ type: USER_REGISTER_FAIL, payload: "No token found" });
      return {
        success: false,
        error: "No token found"
      };
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_REGISTER_FAIL, payload: errorMessage });
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Clearing errors
export const clearErrors = () => (dispatch: Dispatch<AnyAction>) => {
  // You might want to add a CLEAR_ERROR constant in userConstants.ts
  dispatch({ type: "CLEAR_ERROR" });
};

// FIXED: Load user profile with better error handling
export const loadUser = () => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });

    // Check for logout flag
    const loggedOut = localStorage.getItem("loggedOut");
    if (loggedOut === "true") {
      console.log("User is logged out, skipping loadUser");
      dispatch({ type: USER_DETAILS_FAIL, payload: "User is logged out" });
      return { success: false, error: "User is logged out" };
    }

    const token = localStorage.getItem("token");
    if (!token) {
      dispatch({ type: USER_DETAILS_FAIL, payload: "No token found" });
      return { success: false, error: "No token found" };
    }

    try {
      // Extract the user ID from the JWT token
      const userId = extractUserIdFromToken(token);
      
      if (!userId) {
        console.error("Could not extract user ID from token");
        dispatch({ type: USER_DETAILS_FAIL, payload: "Invalid token format" });
        return { success: false, error: "Invalid token format" };
      }
      
      console.log("Extracted user ID:", userId);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      // Use the correct endpoint with the user ID
      const { data } = await api.get(`user/${userId}`, config);
      
      console.log("User profile loaded:", data);
      
      // CRITICAL FIX: Deep clone the user data before dispatching
      const clonedUser = safeClone(data.user);
      dispatch({
        type: USER_DETAILS_SUCCESS,
        payload: clonedUser
      });
      
      return {
        success: true,
        payload: { user: clonedUser }
      };
    } catch (error) {
      console.error("API error:", error);
      
      // Only clear tokens on auth errors (401)
      if (error.response && error.response.status === 401) {
        console.log("Token invalid (401) - clearing auth state");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.setItem("loggedOut", "true");
      }
      throw error;
    }
  } catch (error) {
    console.error("Error loading user:", error);
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_DETAILS_FAIL, payload: errorMessage });
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Helper function to extract user ID from JWT token
function extractUserIdFromToken(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    return payload.id || payload.userId || payload.sub; // Common JWT fields for user ID
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
}

// get all users
export const getAllUsers = () => async (dispatch: Dispatch<AnyAction>, getState: () => any): Promise<any> => {
  try {
    const state = getState();
    const users = state;
    // Prevent duplicate requests
    if (users.loading || (users?.users && users.users.length > 0)) {
      console.log("🔄 Already loading users or users already fetched, skipping request");
      return {
        success: true,
        data: users.users || []
      };
    }

    dispatch({ type: AllUser.Request });
    console.log("🔄 Fetching all users...");
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch({ type: AllUser.Fail, payload: "No token found" });
      return {
        success: false,
        error: "No token found"
      };
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    // FIXED: Correct API call syntax
    const response = await api.get("user", config);
    
    console.log("👥 Users API response:", response.data); // Debug log
    
    const parsedUsers = response.data.users || [];
    // FIXED: Deep clone the users data before dispatching
    
    dispatch({ 
      type: AllUser.Success, 
      payload: parsedUsers
    });
    
    return {
      success: true,
      payload: { users: parsedUsers }
    };
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    // Handle errors gracefully
    const errorMessage = getErrorMessage(error);
    dispatch({ type: "GET_ALL_USERS_FAIL", payload: errorMessage });
    return {
      success: false,
      error: errorMessage
    };
  } 
};

export const updateUser = (id: string, userData: Partial<User>) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch({ type: UPDATE_USER_FAIL, payload: "No token found" });
      return {
        success: false,
        error: "No token found"
      };
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    dispatch({ type: UPDATE_USER_REQUEST }); // Different action type
    
    // Make API call to update user data
    const response = await api.put(`user/${id}`, userData, config);
    console.log("✅ User update response:", response);
    
    // Don't try to extract user from response if backend doesn't return it
    dispatch({ 
      type: UPDATE_USER_SUCCESS, 
      payload: { message: "User updated successfully", userId: id }
    });
    
    return {
      success: true,
      message: "User updated successfully"
    };
  } catch (error) {
    console.error("❌ Error updating user:", error);
    const errorMessage = getErrorMessage(error);
    dispatch({ type: UPDATE_USER_FAIL, payload: errorMessage });
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Keep your existing updateProfile action for updating current user's profile
export const updateProfile = (userData: Partial<User>) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return {
        success: false,
        error: "No token found"
      };
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    dispatch({ type: USER_UPDATE_PROFILE_REQUEST });
    
    // This should update the current user's profile
    const response = await api.put(`user/profile`, userData, config);
    const { user } = response.data;
    
    // FIXED: Deep clone user data before dispatching
    const clonedUser = safeClone(user);
    dispatch({ 
      type: USER_UPDATE_PROFILE_SUCCESS, 
      payload: clonedUser
    });
    
    return {
      success: true,
      payload: { user: clonedUser }
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_UPDATE_PROFILE_FAIL, payload: errorMessage });
    return {
      success: false,
      error: errorMessage
    };
  }
};

// UPDATED LOGOUT FUNCTION WITH FIX
export const logoutUser = () => (dispatch: Dispatch<AnyAction>) => {
  try {
    // CRITICAL: Set the logged out flag BEFORE clearing tokens
    localStorage.setItem("loggedOut", "true");

    // Clear all tokens and state
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    
    // Clear any other potential auth-related flags
    localStorage.removeItem("newRegistration");
    localStorage.removeItem("profileModalDismissed");

    // Reset loading flags

    // Clear cart state too to prevent cart-related API calls
    dispatch({ type: "CLEAR_CART" });

    // Finally, log out the user
    dispatch({ type: USER_LOGOUT });
    
    // IMPORTANT: Return success but don't redirect here
    // Let the component handle the redirect
    return { success: true };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Error during logout:", errorMessage);
    // There's no specific fail action for logout in the constants
    return {
      success: false,
      error: errorMessage
    };
  }
};