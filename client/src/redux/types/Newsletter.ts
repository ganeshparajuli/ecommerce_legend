// src/redux/types/Newsletter.ts
// Newsletter-specific types that match your constants file

export interface Newsletter {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  subscribedAt: Date | string;
  status: boolean;
}

export interface NewsletterState {
  newsletters: Newsletter[];
  newsletter: Newsletter | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
}

// Newsletter action payload types
export interface CreateNewsletterPayload {
  email: string;
  name: string;
  status?: boolean;
}

export interface UpdateNewsletterPayload {
  id: string;
  email?: string;
  name?: string;
  status?: boolean;
}

export interface DeleteNewsletterPayload {
  id: string;
}

// Newsletter API response types
export interface NewsletterApiResponse {
  success: boolean;
  newsletter: Newsletter;
  message?: string;
}

export interface NewslettersApiResponse {
  success: boolean;
  newsletters: Newsletter[];
  message?: string;
  count?: number;
}

// Newsletter action types for better type safety
export interface NewsletterAction {
  type: string;
  payload?: any;
}

export interface GetAllNewslettersAction extends NewsletterAction {
  type: 'getAllNewslettersRequest' | 'getAllNewslettersSuccess' | 'getAllNewslettersFail';
  payload?: Newsletter[] | string;
}

export interface CreateNewsletterAction extends NewsletterAction {
  type: 'createNewsletterRequest' | 'createNewsletterSuccess' | 'createNewsletterFail' | 'createNewsletterReset';
  payload?: Newsletter | string;
}

export interface UpdateNewsletterAction extends NewsletterAction {
  type: 'updateNewsletterRequest' | 'updateNewsletterSuccess' | 'updateNewsletterFail' | 'updateNewsletterReset';
  payload?: Newsletter | string;
}

export interface DeleteNewsletterAction extends NewsletterAction {
  type: 'deleteNewsletterRequest' | 'deleteNewsletterSuccess' | 'deleteNewsletterFail' | 'deleteNewsletterReset';
  payload?: string;
}