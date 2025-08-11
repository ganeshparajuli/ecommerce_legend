// src/reducers/contactReducer.ts - FIXED VERSION with proper state management
import {
  ClearContact,
  ClearContactErrors,
  CreateContact,
  DeleteContact,
  GetAllContacts,
  GetSingleContact,
  UpdateContact,
} from "../constants/contactConstants";
import type {Contact, ContactState} from "../constants/contactConstants"
import type { Reducer } from 'redux';

const initialState: ContactState = {
  contacts: [],
  contact: null,
  loading: false,
  error: null,
  success: false,
};

const setLoading = (state: ContactState): ContactState => ({
  ...state,
  loading: true,
  error: null,
  success: false,
});

const setFailure = (state: ContactState, payload: string): ContactState => ({
  ...state,
  loading: false,
  success: false,
  error: payload,
});

export const contactReducer: Reducer<ContactState> = (state = initialState, action) => {
  switch (action.type) {
    // Get All Contacts
    case GetAllContacts.Request:
      return setLoading(state);

    case GetAllContacts.Success:
      return {
        ...state,
        loading: false,
        success: true,
        contacts: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case GetAllContacts.Fail:
      return setFailure(state, action.payload);

    // Create Contact
    case CreateContact.Request:
      return setLoading(state);

    case CreateContact.Success:
      return {
        ...state,
        loading: false,
        success: true,
        // Add new contact to the existing list
        contacts: Array.isArray(action.payload) 
          ? action.payload 
          : [...state.contacts, action.payload],
        contact: Array.isArray(action.payload) ? null : action.payload,
        error: null,
      };

    case CreateContact.Fail:
      return setFailure(state, action.payload);

    // Get Single Contact
    case GetSingleContact.Request:
      return setLoading(state);

    case GetSingleContact.Success:
      return {
        ...state,
        loading: false,
        success: true,
        contact: action.payload,
        error: null,
      };

    case GetSingleContact.Fail:
      return setFailure(state, action.payload);

    // Update Contact
    case UpdateContact.Request:
      return setLoading(state);

    case UpdateContact.Success:
      return {
        ...state,
        loading: false,
        success: true,
        // Update the contact in the list if it's an array, otherwise replace contacts
        contacts: Array.isArray(action.payload) 
          ? action.payload 
          : state.contacts.map(contact => 
              contact.id === action.payload.id ? action.payload : contact
            ),
        // Update the single contact if it matches
        contact: state.contact?.id === action.payload.id ? action.payload : state.contact,
        error: null,
      };

    case UpdateContact.Fail:
      return setFailure(state, action.payload);

    // Delete Contact
    case DeleteContact.Request:
      return setLoading(state);

    case DeleteContact.Success:
      return {
        ...state,
        loading: false,
        success: true,
        // Remove the deleted contact from the list
        contacts: state.contacts.filter(contact => contact.id !== action.payload),
        // Clear the single contact if it was the deleted one
        contact: state.contact?.id === action.payload ? null : state.contact,
        error: null,
      };

    case DeleteContact.Fail:
      return setFailure(state, action.payload);

    // Clear Contact
    case ClearContact:
      return {
        ...state,
        loading: false,
        success: false,
        contacts: [],
        contact: null,
      };

    // Clear Errors
    case ClearContactErrors:
      return {
        ...state,
        error: null,
        success: false,
      };

    default:
      return state;
  }
};