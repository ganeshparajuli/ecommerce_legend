// src/actions/enquiryAction.ts
import {
    GET_ENQUIRIES_REQUEST,
    GET_ENQUIRIES_SUCCESS,
    GET_ENQUIRIES_FAILURE,
    GET_ENQUIRY_DETAILS_REQUEST,
    GET_ENQUIRY_DETAILS_SUCCESS,
    GET_ENQUIRY_DETAILS_FAILURE,
    UPDATE_ENQUIRY_STATUS_REQUEST,
    UPDATE_ENQUIRY_STATUS_SUCCESS,
    UPDATE_ENQUIRY_STATUS_FAILURE,
    SEND_ENQUIRY_REPLY_REQUEST,
    SEND_ENQUIRY_REPLY_SUCCESS,
    SEND_ENQUIRY_REPLY_FAILURE,
    DELETE_ENQUIRY_REQUEST,
    DELETE_ENQUIRY_SUCCESS,
    DELETE_ENQUIRY_FAILURE,
    CLEAR_ENQUIRY_ERRORS,
    Enquiry,
    EnquiryReply,
    EnquiryStatus
  } from "../constants/enquiryConstants";
  import { Dispatch } from "redux";
  
  // Mock data for development
  const mockEnquiries: Enquiry[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      subject: "Product Availability",
      message:
        "I'm interested in your organic cotton products. Do you have king size bedding in stock?",
      status: "unread",
      createdAt: new Date("2025-03-28T09:30:00.000Z"),
      updatedAt: new Date("2025-03-28T09:30:00.000Z"),
      replies: [],
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      subject: "Shipping Question",
      message:
        "How long does shipping typically take to California? I need to order some items for a gift.",
      status: "read",
      createdAt: new Date("2025-03-27T14:15:00.000Z"),
      updatedAt: new Date("2025-03-27T14:15:00.000Z"),
      replies: [
        {
          id: "r1",
          enquiryId: "2",
          message:
            "Thank you for your inquiry. Shipping to California typically takes 3-5 business days. Let me know if you have any other questions!",
          createdAt: new Date("2025-03-27T16:20:00.000Z"),
        },
      ],
    },
    {
      id: "3",
      name: "Michael Wong",
      email: "m.wong@example.com",
      subject: "Return Policy",
      message:
        "I recently purchased some organic towels but I'm not happy with the color. What is your return policy?",
      status: "unread",
      createdAt: new Date("2025-03-26T11:45:00.000Z"),
      updatedAt: new Date("2025-03-26T11:45:00.000Z"),
      replies: [],
    },
    {
      id: "4",
      name: "Emma Thompson",
      email: "emma.t@example.com",
      subject: "Wholesale Inquiries",
      message:
        "I own a small boutique and I'm interested in carrying your products. Do you offer wholesale pricing?",
      status: "archived",
      createdAt: new Date("2025-03-25T10:30:00.000Z"),
      replies: [
        {
          id: "r2",
          enquiryId: "4",
          message:
            "Thank you for your interest in our products! Yes, we do offer wholesale pricing for boutiques. I'll send you our wholesale catalog and pricing information shortly.",
          createdAt: new Date("2025-03-25T13:45:00.000Z"),
        },
        {
          id: "r3",
          enquiryId: "4",
          message:
            "I've just emailed you our complete wholesale package. Please let me know if you have any questions!",
          createdAt: new Date("2025-03-25T15:20:00.000Z"),
        },
      ],
    },
    {
      id: "5",
      name: "David Garcia",
      email: "d.garcia@example.com",
      subject: "Custom Order",
      message:
        "I'm looking for custom-sized organic curtains for my home. Is this something you can help with?",
      status: "unread",
      createdAt: new Date("2025-03-24T16:20:00.000Z"),
      replies: [],
    },
  ];
  
  interface EnquiryFilters {
    status?: EnquiryStatus;
    search?: string;
  }
  
  // Get all enquiries with filtering options
  export const getEnquiries = (filters: EnquiryFilters = {}) => async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch({ type: GET_ENQUIRIES_REQUEST });
  
      // TEMPORARY: Use mock data instead of API call
      // In production, uncomment the API call and comment out the setTimeout
      /*
      const { data } = await axios.get("/api/enquiries", {
        params: filters
      });
      */
  
      // Filter mock data based on provided filters
      let filteredEnquiries = [...mockEnquiries];
  
      if (filters.status) {
        filteredEnquiries = filteredEnquiries.filter(
          (e) => e.status === filters.status
        );
      }
  
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEnquiries = filteredEnquiries.filter(
          (e) =>
            e.name.toLowerCase().includes(searchLower) ||
            e.email.toLowerCase().includes(searchLower) ||
            e.subject.toLowerCase().includes(searchLower) ||
            e.message.toLowerCase().includes(searchLower)
        );
      }
  
      // Sort by date (newest first by default)
      filteredEnquiries.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      // Calculate counts
      const totalCount = mockEnquiries.length;
      const unreadCount = mockEnquiries.filter(
        (e) => e.status === "unread"
      ).length;
  
      // Simulate API delay
      setTimeout(() => {
        dispatch({
          type: GET_ENQUIRIES_SUCCESS,
          payload: {
            enquiries: filteredEnquiries,
            totalCount,
            unreadCount,
          },
        });
      }, 500);
    } catch (error) {
      dispatch({
        type: GET_ENQUIRIES_FAILURE,
        payload: error instanceof Error 
          ? error.message 
          : "Failed to fetch enquiries",
      });
    }
  };
  
  // Get single enquiry details
  export const getEnquiryDetails = (id: string) => async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch({ type: GET_ENQUIRY_DETAILS_REQUEST });
  
      // TEMPORARY: Use mock data instead of API call
      /*
      const { data } = await axios.get(`/api/enquiries/${id}`);
      */
  
      const enquiry = mockEnquiries.find((e) => e.id === id);
  
      if (!enquiry) {
        throw new Error("Enquiry not found");
      }
  
      // Simulate API delay
      setTimeout(() => {
        dispatch({
          type: GET_ENQUIRY_DETAILS_SUCCESS,
          payload: enquiry,
        });
      }, 300);
    } catch (error) {
      dispatch({
        type: GET_ENQUIRY_DETAILS_FAILURE,
        payload: error instanceof Error 
          ? error.message 
          : "Failed to fetch enquiry details",
      });
    }
  };
  
  // Update enquiry status (read/unread/archived)
  export const updateEnquiryStatus = (id: string, status: EnquiryStatus) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
    try {
      dispatch({ type: UPDATE_ENQUIRY_STATUS_REQUEST });
  
      // TEMPORARY: Simulate API call
      /*
      const { data } = await axios.patch(`/api/enquiries/${id}/status`, { status });
      */
  
      // Simulate API delay
      setTimeout(() => {
        dispatch({
          type: UPDATE_ENQUIRY_STATUS_SUCCESS,
          payload: { id, status },
        });
      }, 300);
  
      return "success";
    } catch (error) {
      dispatch({
        type: UPDATE_ENQUIRY_STATUS_FAILURE,
        payload: error instanceof Error 
          ? error.message 
          : "Failed to update enquiry status",
      });
  
      return "error";
    }
  };
  
  // Send reply to enquiry
  export const sendEnquiryReply = (id: string, message: string) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
    try {
      dispatch({ type: SEND_ENQUIRY_REPLY_REQUEST });
  
      // TEMPORARY: Simulate API call
      /*
      const { data } = await axios.post(`/api/enquiries/${id}/reply`, { message });
      */
  
      // Create a reply object
      const reply: EnquiryReply = {
        id: `r${Date.now()}`,
        enquiryId: id,
        message,
        createdAt: new Date(),
      };
  
      // Simulate API delay
      setTimeout(() => {
        dispatch({
          type: SEND_ENQUIRY_REPLY_SUCCESS,
          payload: reply,
        });
      }, 300);
  
      return "success";
    } catch (error) {
      dispatch({
        type: SEND_ENQUIRY_REPLY_FAILURE,
        payload: error instanceof Error 
          ? error.message 
          : "Failed to send reply",
      });
  
      return "error";
    }
  };
  
  // Delete an enquiry
  export const deleteEnquiry = (id: string) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
    try {
      dispatch({ type: DELETE_ENQUIRY_REQUEST });
  
      // TEMPORARY: Simulate API call
      /*
      await axios.delete(`/api/enquiries/${id}`);
      */
  
      // Simulate API delay
      setTimeout(() => {
        dispatch({
          type: DELETE_ENQUIRY_SUCCESS,
          payload: id,
        });
      }, 500);
  
      return "success";
    } catch (error) {
      dispatch({
        type: DELETE_ENQUIRY_FAILURE,
        payload: error instanceof Error 
          ? error.message 
          : "Failed to delete enquiry",
      });
  
      return "error";
    }
  };
  
  // Clear errors
  export const clearEnquiryErrors = () => ({
    type: CLEAR_ENQUIRY_ERRORS,
  });