import type { ActionTypes } from './../types/actionTypes';

export const GetAllNewsletters: ActionTypes = {
  Request: "getAllNewslettersRequest",
  Success: "getAllNewslettersSuccess",
  Fail: "getAllNewslettersFail",
};
export const GetNewsletterDetails: ActionTypes = {
  Request: "getNewsletterDetailsRequest",
  Success: "getNewsletterDetailsSuccess",
  Fail: "getNewsletterDetailsFail",
};
export const CreateNewsletter: ActionTypes = {
  Request: "createNewsletterRequest",
  Success: "createNewsletterSuccess",
  Reset: "createNewsletterReset",
  Fail: "createNewsletterFail",
};
export const UpdateNewsletter: ActionTypes = {
  Request: "updateNewsletterRequest",
  Success: "updateNewsletterSuccess",
  Reset: "updateNewsletterReset",
  Fail: "updateNewsletterFail",
};
export const DeleteNewsletter: ActionTypes = {
  Request: "deleteNewsletterRequest",
  Success: "deleteNewsletterSuccess",
  Reset: "deleteNewsletterReset",
  Fail: "deleteNewsletterFail",
};
export const ClearNewsletterErrors: string = "clearNewsletterErrors";
// Newsletter-specific types
export type Newsletter = {
  id: string;
  email: string;
  name: string;
  subscribedAt: Date;
  status: Boolean;
};
export type NewsletterState = {
  newsletters: Newsletter[];
  newsletter: Newsletter | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};