// src/actions/wishlistActions.ts - REMOVED ALL TOASTS, COMPONENT HANDLES UI FEEDBACK
import {
  AddToWishlist,
  RemoveFromWishlist,
  GetWishlist,
  ClearWishlistError,
  type WishlistItem
} from '../constants/wishlistConstants';
import api from '../../redux/api';
import type { Dispatch } from 'redux';

// Helper function to extract error message from Axios error or others
const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data) return JSON.stringify(error.response.data);
  if (error.message) return error.message;
  return "An error occurred";
};

// Check if user is logged in by presence of token and not recently logged out
const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

// CRITICAL: Helper function to safely clone wishlist data
const safeCloneWishlistItem = (item: any): WishlistItem => {
  if (!item) return item;
  
  return {
    id: item.id || item._id,
    user_id: item.user_id || item.userId,
    product_id: item.product_id || item.productId,
    added_at: item.added_at || item.addedAt || item.createdAt || new Date().toISOString(),
    
    // Optional fields
    product_name: item.product_name,
    price: item.price,
    image: item.image,
    category: item.category,
    
    // Handle nested product object
    product: item.product ? {
      id: item.product.id,
      name: item.product.name,
      finalPrice: item.product.finalPrice,
      actualPrice: item.product.actualPrice,
      stock: item.product.stock,
      image: item.product.image,
      category: item.category
    } : undefined
  };
};

/**
 * Add item to wishlist - NO TOAST, component handles UI feedback
 */
export const addToWishlist = (productId: string) => async (dispatch: Dispatch, getState: () => any): Promise<any> => {
  try {
    if (!isLoggedIn()) {
      console.log("❌ Wishlist: User not logged in");
      return { type: AddToWishlist.Fail, error: "login-required" };
    }
    
    if (!productId || productId.trim() === '') {
      console.error("❌ Wishlist: Invalid product ID:", productId);
      dispatch({
        type: AddToWishlist.Fail,
        payload: "Invalid product ID",
      });
      return { type: AddToWishlist.Fail, error: "invalid-product" };
    }

    // Check if item already exists in wishlist using your reducer structure
    const state = getState();
    const currentWishlist = state.wishlist?.wishlist || [];
    const alreadyExists = currentWishlist.some((item: any) => 
      item.product_id === productId || item.productId === productId
    );

    if (alreadyExists) {
      console.log("ℹ️ Wishlist: Item already exists");
      return { type: "ALREADY_EXISTS", data: null };
    }
    
    dispatch({ type: AddToWishlist.Request });
    
    console.log("🔄 Adding to wishlist:", { productId });
    
    const requestData = {
      product_id: productId,
      productId: productId,
    };
    
    const { data } = await api.post("wishlist/", requestData);
    
    console.log("📥 Add to Wishlist API Response:", data);
    
    // Handle different response structures
    let wishlistItem;
    if (data.data) {
      wishlistItem = safeCloneWishlistItem(data.data);
    } else if (data.wishlistItem) {
      wishlistItem = safeCloneWishlistItem(data.wishlistItem);
    } else if (data.item) {
      wishlistItem = safeCloneWishlistItem(data.item);
    } else {
      wishlistItem = safeCloneWishlistItem({
        id: data.id || Date.now().toString(),
        user_id: data.user_id || data.userId,
        product_id: productId,
        added_at: data.added_at || data.addedAt || new Date().toISOString(),
      });
    }
    
    dispatch({ 
      type: AddToWishlist.Success, 
      payload: wishlistItem
    });
    
    console.log("✅ Wishlist: Item added successfully");
    return { type: AddToWishlist.Success, data: wishlistItem };
    
  } catch (error) {
    console.error("❌ Wishlist Error:", error);
    
    const errorMessage = getErrorMessage(error);
    
    dispatch({ 
      type: AddToWishlist.Fail, 
      payload: errorMessage 
    });
    
    return { type: AddToWishlist.Fail, error: errorMessage };
  }
};

/**
 * Remove item from wishlist - NO TOAST, component handles UI feedback
 */
export const removeFromWishlist = (itemId: string) => async (dispatch: Dispatch): Promise<any> => {
  try {
    if (!isLoggedIn()) {
      console.log("❌ Wishlist: User not logged in for removal");
      dispatch({
        type: RemoveFromWishlist.Fail,
        payload: "User not logged in",
      });
      return { type: RemoveFromWishlist.Fail, error: "login-required" };
    }
    
    if (!itemId || itemId.trim() === '') {
      console.error("❌ Wishlist: Invalid item ID for removal:", itemId);
      dispatch({
        type: RemoveFromWishlist.Fail,
        payload: "Invalid item ID",
      });
      return { type: RemoveFromWishlist.Fail, error: "invalid-item" };
    }
    
    dispatch({ type: RemoveFromWishlist.Request });
        
    await api.delete(`wishlist/${itemId}`);
    
    dispatch({
      type: RemoveFromWishlist.Success,
      payload: itemId,
    });
    
    return { type: RemoveFromWishlist.Success, data: itemId };
    
  } catch (error) {
    console.error("❌ Wishlist Removal Error:", error);
    const errorMessage = getErrorMessage(error);
    
    dispatch({ 
      type: RemoveFromWishlist.Fail, 
      payload: errorMessage 
    });
    
    return { type: RemoveFromWishlist.Fail, error: errorMessage };
  }
};

/**
 * Get wishlist items
 */
// Enhanced getWishlist function that fetches product details
export const getWishlist = () => async (dispatch: Dispatch, getState: () => any): Promise<any> => {
  try {
    if (!isLoggedIn()) {
      console.log("ℹ️ Wishlist: User not logged in, returning empty wishlist");
      dispatch({ 
        type: GetWishlist.Success, 
        payload: []   
      });
      return { success: true, data: [] };
    }

    const state = getState();
    const { wishlist: wishList } = state;
    
    if (wishList?.loading) {
      console.log("ℹ️ Wishlist: Already loading, skipping API call");
      return { success: true, data: wishList?.wishlist || [] };
    }

    // FIXED: Check if we have complete wishlist data (with product details)
    const hasCompleteData = wishList?.wishlistFetched && 
                           wishList?.wishlist?.length > 0 && 
                           wishList.wishlist.some((item: any) => 
                             item.product_name || item.product?.name
                           );

    if (hasCompleteData) {
      console.log("ℹ️ Wishlist: Already have complete data, using existing");
      return { success: true, data: wishList.wishlist };
    }
    
    dispatch({ type: GetWishlist.Request });
    
    console.log("🔄 Fetching wishlist items with product details");
    
    const response = await api.get("wishlist/");
    
    if (!response || !response.data) {
      throw new Error("Invalid response from server");
    }
    
    console.log("📥 Wishlist API Response:", response.data);
    
    let wishlistItems = [];
    
    if (response.data.data && Array.isArray(response.data.data)) {
      wishlistItems = response.data.data;
    } else if (response.data.items && Array.isArray(response.data.items)) {
      wishlistItems = response.data.items;
    } else if (response.data.wishlist && Array.isArray(response.data.wishlist)) {
      wishlistItems = response.data.wishlist;
    } else if (Array.isArray(response.data)) {
      wishlistItems = response.data;
    }
    
    console.log(`🔍 Processing ${wishlistItems.length} wishlist items...`);
    
    // ENHANCED: Fetch product details for each wishlist item
    const enhancedWishlistItems = await Promise.all(
      wishlistItems.map(async (item, index) => {
        try {
          const clonedItem = safeCloneWishlistItem(item);
          
          // If we already have product details, return as is
          if (clonedItem.product_name || clonedItem.product?.name) {
            console.log(`✅ Item ${index} already has product details`);
            return clonedItem;
          }
          
          // Fetch product details using the product_id
          const productId = item.product_id || item.productId;
          if (productId) {
            console.log(`🔄 Fetching product details for item ${index}: ${productId}`);
            
            const productResponse = await api.get(`product/${productId}`);
            const productData = productResponse.data;
            
            console.log(`📥 Product details for ${productId}:`, productData);
            
            // Extract product info from response
            let product;
            if (productData.product) {
              product = productData.product;
            } else if (productData.data) {
              product = productData.data;
            } else {
              product = productData;
            }
            
            // Enhance the wishlist item with product details
            const enhancedItem = {
              ...clonedItem,
              product_name: product.name || product.title,
              price: product.finalPrice || product.actualPrice || product.price,
              image: product.image || product.images,
              category: product.category?.name || product.category,
              product: {
                id: product.id || product._id,
                name: product.name || product.title,
                finalPrice: product.finalPrice || product.actualPrice || product.price,
                actualPrice: product.actualPrice || product.price,
                stock: product.stock || product.quantity,
                image: product.image || product.images,
                category: product.category
              }
            };
            
            console.log(`✅ Enhanced item ${index}:`, {
              name: enhancedItem.product_name,
              price: enhancedItem.price,
              hasImage: !!enhancedItem.image
            });
            
            return enhancedItem;
          }
          
          console.log(`⚠️ Item ${index} has no product_id`);
          return clonedItem;
        } catch (productError) {
          console.error(`❌ Failed to fetch product details for item ${index}:`, item, productError);
          // Return the original item if product fetch fails
          return safeCloneWishlistItem(item);
        }
      })
    );
    
    console.log("✅ Enhanced wishlist items processed:", enhancedWishlistItems.length);
    
    // Log a sample of the enhanced data for debugging
    if (enhancedWishlistItems.length > 0) {
      console.log("🔍 Sample enhanced item:", {
        id: enhancedWishlistItems[0].id,
        product_name: enhancedWishlistItems[0].product_name,
        price: enhancedWishlistItems[0].price,
        image: enhancedWishlistItems[0].image,
        category: enhancedWishlistItems[0].category
      });
    }
    
    dispatch({ 
      type: GetWishlist.Success, 
      payload: enhancedWishlistItems
    });
    
    return { success: true, data: enhancedWishlistItems };
    
  } catch (error) {
    console.error("❌ Wishlist Fetch Error:", error);
    const errorMessage = getErrorMessage(error);
    
    dispatch({ 
      type: GetWishlist.Fail, 
      payload: errorMessage 
    });
    
    return { success: false, error: errorMessage };
  }
};


export const removeFromWishlistByProductId = (productId: string) => async (dispatch: Dispatch, getState: () => any): Promise<any> => {
  try {
    if (!isLoggedIn()) {
      console.log("❌ Wishlist: User not logged in for removal");
      dispatch({
        type: RemoveFromWishlist.Fail,
        payload: "User not logged in",
      });
      return { type: RemoveFromWishlist.Fail, error: "login-required" };
    }
    
    if (!productId || productId.trim() === '') {
      console.error("❌ Wishlist: Invalid product ID for removal:", productId);
      dispatch({
        type: RemoveFromWishlist.Fail,
        payload: "Invalid product ID",
      });
      return { type: RemoveFromWishlist.Fail, error: "invalid-product" };
    }

    // First, get the current wishlist to find the item ID
    const state = getState();
    const currentWishlist = state.wishlist?.wishlist || [];
    
    // Find the wishlist item that matches this product ID
    const wishlistItem = currentWishlist.find((item: any) => 
      item.product_id === productId || item.productId === productId
    );

    if (!wishlistItem) {
      console.log("❌ Wishlist: Product not found in wishlist");
      return { type: RemoveFromWishlist.Fail, error: "product-not-in-wishlist" };
    }
    
    dispatch({ type: RemoveFromWishlist.Request });
        
    // Use the wishlist item ID for the API call
    await api.delete(`wishlist/${wishlistItem.id}`);
    
    dispatch({
      type: RemoveFromWishlist.Success,
      payload: wishlistItem.id,
    });
    
    return { type: RemoveFromWishlist.Success, data: wishlistItem.id };
    
  } catch (error) {
    console.error("❌ Wishlist Removal Error:", error);
    const errorMessage = getErrorMessage(error);
    
    dispatch({ 
      type: RemoveFromWishlist.Fail, 
      payload: errorMessage 
    });
    
    return { type: RemoveFromWishlist.Fail, error: errorMessage };
  }
};

/**
 * Clear wishlist related errors from redux state
 */
export const clearWishlistErrors = () => (dispatch: Dispatch): void => {
  dispatch({ type: ClearWishlistError.Request });
};

/**
 * Reset wishlist success state
 */
export const resetWishlistState = () => (dispatch: Dispatch): void => {
  dispatch({ type: AddToWishlist.Reset });
};

/**
 * Force refresh wishlist
 */
export const refreshWishlist = () => async (dispatch: Dispatch, getState: () => any): Promise<any> => {
  try {
    if (!isLoggedIn()) {
      console.log("ℹ️ Wishlist Refresh: User not logged in");
      dispatch({ 
        type: GetWishlist.Success, 
        payload: []   
      });
      return { success: true, data: [] };
    }

    dispatch({ type: GetWishlist.Request });
    
    console.log("🔄 Force refreshing wishlist items");
    
    const response = await api.get("wishlist/");
    
    if (!response || !response.data) {
      throw new Error("Invalid response from server");
    }
    
    let wishlistItems = [];
    
    if (response.data.data && Array.isArray(response.data.data)) {
      wishlistItems = response.data.data;
    } else if (response.data.items && Array.isArray(response.data.items)) {
      wishlistItems = response.data.items;
    } else if (response.data.wishlist && Array.isArray(response.data.wishlist)) {
      wishlistItems = response.data.wishlist;
    } else if (Array.isArray(response.data)) {
      wishlistItems = response.data;
    }
    
    const processedItems = wishlistItems.map(item => safeCloneWishlistItem(item));
    
    console.log("✅ Wishlist force refresh completed:", processedItems.length);
    
    dispatch({ 
      type: GetWishlist.Success, 
      payload: processedItems
    });
    
    return { success: true, data: processedItems };
    
  } catch (error) {
    console.error("❌ Wishlist Force Refresh Error:", error);
    const errorMessage = getErrorMessage(error);
    
    dispatch({ 
      type: GetWishlist.Fail, 
      payload: errorMessage 
    });
    
    return { success: false, error: errorMessage };
  }
};