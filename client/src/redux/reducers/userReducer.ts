// src/reducers/userReducer.ts - FINAL FIXED VERSION with consistent action handling
import {
  Login,
  Register,
  LogOut,
  LoadUser,
  AllUser,
  ClearError,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
} from "../constants/userConstants";
import type { User } from "../constants/userConstants"
import type {UserState}  from "../types/User";
import type { Reducer } from 'redux';

// CRITICAL FIX: Helper function to determine initial auth state
const getInitialAuthState = () => {
  const token = localStorage.getItem("token");
  const loggedOut = localStorage.getItem("loggedOut");
  
  // If there's a token and user isn't logged out, we're potentially authenticated
  // but we need to verify with the server
  if (token && loggedOut !== "true") {
    return {
      isAuthenticated: false, // Don't assume authenticated until verified
      loading: true, // Start loading immediately to check token validity
      hasToken: true, // Flag to track that we have a token to verify
    };
  }
  
  return {
    isAuthenticated: false,
    loading: false,
    hasToken: false,
  };
};

const initialAuthState = getInitialAuthState();

const initialState: UserState = {
  user: null,
  loading: initialAuthState.loading,
  // CRITICAL: Don't set isAuthenticated to true initially
  isAuthenticated: initialAuthState.isAuthenticated,
  error: null,
  token: localStorage.getItem("token") || null,
  users: [],
  // Add this flag to track if we need to verify token
  hasToken: initialAuthState.hasToken,
};

// CRITICAL: Helper function to safely clone user data
const safeCloneUser = (user: User | null): User | null => {
  if (!user) return null;
  
  try {
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Failed to clone user:", error);
    return user;
  }
};

// Helper function to safely clone users array
const safeCloneUsers = (users: User[]): User[] => {
  if (!Array.isArray(users)) return [];
  
  try {
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Failed to clone users array:", error);
    return users;
  }
};

const setLoading = (state: UserState): UserState => ({
  ...state,
  loading: true,
  error: null,
});

const setSuccess = (state: UserState, payload: User): UserState => ({
  ...state,
  loading: false,
  isAuthenticated: true,
  user: safeCloneUser(payload),
  error: null,
  hasToken: true,
});

const setFailure = (state: UserState, payload: string): UserState => ({
  ...state,
  loading: false,
  isAuthenticated: false,
  user: null,
  error: payload,
  hasToken: false,
});

export const userReducer: Reducer<UserState> = (state = initialState, action) => {
  switch (action.type) {
    case Login.Request:
    case Register.Request:
    case LoadUser.Request:
      console.log(`🔍 User Action: ${action.type} - Request`);
      return setLoading(state);

    case Login.Success:
    case Register.Success:
    case LoadUser.Success:
      console.log(`🔍 User Action: ${action.type} - Success`, {
        userReceived: !!action.payload,
        userId: action.payload?.id
      });
      return setSuccess(state, action.payload);

    case Login.Fail:
    case Register.Fail:
    case LoadUser.Fail:
    case LogOut.Fail:
      console.log(`🔍 User Action: ${action.type} - Fail`, {
        error: action.payload
      });
      return setFailure(state, action.payload);

    // CRITICAL FIX: All users actions using consistent action types from constants
    case AllUser.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
      
    case AllUser.Success:
      console.log(`🔍 User Action: ${action.type} - Success`, {
        usersReceived: Array.isArray(action.payload) ? action.payload.length : 0
      });
      return {
        ...state,
        loading: false,
        users: safeCloneUsers(Array.isArray(action.payload) ? action.payload : []),
        error: null,
      };
      
    case AllUser.Fail:
      console.log(`🔍 User Action: ${action.type} - Fail`, {
        error: action.payload
      });
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        message: action.payload.message,
      };

    case UPDATE_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Profile update actions
    case "USER_UPDATE_PROFILE_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };
      
    case "USER_UPDATE_PROFILE_SUCCESS":
      console.log(`🔍 User Action: USER_UPDATE_PROFILE_SUCCESS`, {
        userUpdated: !!action.payload
      });
      return {
        ...state,
        loading: false,
        user: safeCloneUser(action.payload),
        error: null,
      };
      
    case "USER_UPDATE_PROFILE_FAIL":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Clear error
    case ClearError:
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    // Logout
    case LogOut.Success:
    case "USER_LOGOUT":
      console.log(`🔍 User Action: ${action.type} - Logout Success`);
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        hasToken: false,
        users: [], // OPTIONAL: Clear users on logout for security
      };

    // Handle cart clear action to prevent cross-contamination
    case "CLEAR_CART":
      return state;

    default:
      return state;
  }
};