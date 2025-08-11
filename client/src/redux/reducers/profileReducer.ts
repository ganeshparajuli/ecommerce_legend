// src/reducers/profileReducer.ts
import {
  GetProfile,
  UpdateProfile,
  ClearProfileErrors,
  
} from "../constants/profileConstants";
import type {Profile,
  ProfileState} from "../constants/profileConstants"
import type { Reducer } from 'redux';

const initialState: ProfileState = {
  profile: null,
  loading: false,
  updating: false,
  isUpdated: false,
  error: null,
};

export const profileReducer: Reducer<ProfileState> = (state = initialState, action) => {
  switch (action.type) {
    // Get profile
    case GetProfile.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GetProfile.Success:
      return {
        ...state,
        loading: false,
        profile: action.payload,
        error: null,
      };
    case GetProfile.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update profile
    case UpdateProfile.Request:
      return {
        ...state,
        updating: true,
        isUpdated: false,
        error: null,
      };
    case UpdateProfile.Success:
      return {
        ...state,
        updating: false,
        profile: action.payload,
        isUpdated: true,
        error: null,
      };
    case UpdateProfile.Fail:
      return {
        ...state,
        updating: false,
        isUpdated: false,
        error: action.payload,
      };
    case UpdateProfile.Reset:
      return {
        ...state,
        isUpdated: false,
        updating: false,
        error: null,
      };

    // Clear errors
    case ClearProfileErrors:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};