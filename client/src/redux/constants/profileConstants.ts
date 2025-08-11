// src/constants/profileConstant.ts
import type { ActionTypes } from '../types/actionTypes';

export const GetProfile: ActionTypes = {
  Request: "getProfileRequest",
  Success: "getProfileSuccess",
  Fail: "getProfileFail",
};

export const UpdateProfile: ActionTypes = {
  Request: "updateProfileRequest",
  Success: "updateProfileSuccess",
  Fail: "updateProfileFail",
  Reset: "updateProfileReset",
};

export const ClearProfileErrors: string = "clearProfileErrors";

// Profile-specific types
export type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
};

export type Profile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  dateOfBirth?: Date;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isUpdated: boolean;
};