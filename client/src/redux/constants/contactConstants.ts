import type { ActionTypes } from '../types/actionTypes';

export const CreateContact: ActionTypes = {
  Request: "createContactRequest",
  Success: "createContactSuccess",
  Fail: "createContactFail",
};

export const ClearContactErrors: string = "clearContactErrors";

export const GetSingleContact: ActionTypes = {
  Request: "getSingleContactRequest",
  Success: "getSingleContactSuccess",
  Fail: "getSingleContactFail",
};

export const GetAllContacts: ActionTypes = {
  Request: "getAllContactsRequest",
  Success: "getAllContactsSuccess",
  Fail: "getAllContactsFail",
};

export const DeleteContact: ActionTypes = {
  Request: "deleteContactRequest",
  Success: "deleteContactSuccess",
  Fail: "deleteContactFail",
};

export const UpdateContact: ActionTypes = {
  Request: "updateContactRequest",
  Success: "updateContactSuccess",
  Fail: "updateContactFail",
};

export const ClearContact: string = "clearContact";

// Contact-specific types
export type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string; // Make phone optional
  subject: string;
  message: string;
  status?: 'read' | 'unread' | 'archived'; // Make status optional since API might not return it
  createdAt?: Date | string; // Allow string for API responses and make optional
  updatedAt?: Date | string; // Allow string for API responses and make optional
  created_at?: string; // Support snake_case from API
  updated_at?: string; // Support snake_case from API
};

// Type for creating a contact (without server-generated fields)
export type CreateContactData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

// Type for updating contact status
export type UpdateContactData = {
  status?: 'read' | 'unread' | 'archived';
};

export type ContactState = {
  contacts: Contact[];
  contact: Contact | null;
  loading: boolean;
  error: string | null;
  success: boolean;
};