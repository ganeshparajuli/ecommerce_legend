// src/store.ts - Fixed configuration ensuring splash reducer is properly connected
import { configureStore } from "@reduxjs/toolkit";
import type { Middleware } from "redux";

// Import all reducers with proper defaults
import { userReducer } from "../redux/reducers/userReducer";
import { productReducer } from "../redux/reducers/productReducer";
import { cartReducer } from "../redux/reducers/cartReducer";
import { orderReducer } from "../redux/reducers/orderReducer";
import { categoryReducer } from "../redux/reducers/categoryReducer";
import { paymentReducer } from "../redux/reducers/paymentReducer";
import { profileReducer } from "../redux/reducers/profileReducer";
import { checkoutReducer } from "../redux/reducers/checkoutReducer";
import { saleReducer } from "../redux/reducers/saleReducer";
import { contactReducer } from "../redux/reducers/contactReducer";
import { faqReducer } from "../redux/reducers/faqReducer";
import { wishListReducer } from "../redux/reducers/wishListReducer";
import { brandReducer } from "../redux/reducers/brandReducer";

// CRITICAL: Import newsletter reducer with proper fallback
import { newsletterReducer } from "../redux/reducers/newsletterReducer";

// NEW: Import splash reducer
import { splashReducer } from "../redux/reducers/splashReducer";

// NEW: Import settings reducer
import { settingsReducer } from "../redux/reducers/settingsReducer";

import { 
  promoReducer,  // Main reducer for checkout flow - THIS IS THE IMPORTANT ONE!
  promoCodesReducer,  // For admin listing
  activePromoCodesReducer,  // For active promos
  promoCodeDetailsReducer,  // For promo details
  promoCodeReducer,  // For admin CRUD
} from './reducers/promoReducer';

const enhancedMutationDetection: Middleware = (store) => (next) => (action) => {
  const stateBefore = store.getState();
  
  // Take a snapshot of products before action
  const productsBefore = stateBefore.products?.products;
  const firstProductBefore = productsBefore?.[0];
  
  // Take a snapshot of splash screens before action
  const splashBefore = stateBefore.splash?.splashScreens;
  const firstSplashBefore = splashBefore?.[0];
  
  const result = next(action);
  
  const stateAfter = store.getState();
  const productsAfter = stateAfter.products?.products;
  const firstProductAfter = productsAfter?.[0];
  
  const splashAfter = stateAfter.splash?.splashScreens;
  const firstSplashAfter = splashAfter?.[0];
  
  // Check for mutations in products.products.0
  if (firstProductBefore && firstProductAfter && firstProductBefore === firstProductAfter) {
    if (action.type?.includes('Product') || action.type?.includes('PRODUCT')) {
      console.warn(`🚨 POTENTIAL MUTATION DETECTED: Same reference for products.products.0`, {
        action: action.type,
        sameReference: firstProductBefore === firstProductAfter,
        sameArrayReference: productsBefore === productsAfter,
        productId: firstProductAfter?.id,
        actionType: action.type
      });
    }
  }
  
  // Check for mutations in splash.splashScreens.0
  if (firstSplashBefore && firstSplashAfter && firstSplashBefore === firstSplashAfter) {
    if (action.type?.includes('Splash') || action.type?.includes('SPLASH')) {
      console.warn(`🚨 POTENTIAL MUTATION DETECTED: Same reference for splash.splashScreens.0`, {
        action: action.type,
        sameReference: firstSplashBefore === firstSplashAfter,
        sameArrayReference: splashBefore === splashAfter,
        splashId: firstSplashAfter?.id,
        actionType: action.type
      });
    }
  }
  
  // Success logging when references change correctly
  if (firstProductBefore && firstProductAfter && firstProductBefore !== firstProductAfter) {
    if (action.type?.includes('Product') || action.type?.includes('PRODUCT')) {
      console.log(`✅ NO MUTATION: New reference created for products.products.0`, {
        action: action.type,
        differentReference: firstProductBefore !== firstProductAfter,
        differentArrayReference: productsBefore !== productsAfter
      });
    }
  }
  
  if (firstSplashBefore && firstSplashAfter && firstSplashBefore !== firstSplashAfter) {
    if (action.type?.includes('Splash') || action.type?.includes('SPLASH')) {
      console.log(`✅ NO MUTATION: New reference created for splash.splashScreens.0`, {
        action: action.type,
        differentReference: firstSplashBefore !== firstSplashAfter,
        differentArrayReference: splashBefore !== splashAfter
      });
    }
  }
  
  return result;
};

// Create Redux store with all reducers properly configured
export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productReducer,
    cart: cartReducer,
    order: orderReducer,
    category: categoryReducer,
    sales: saleReducer,
    payment: paymentReducer,
    profile: profileReducer,
    checkout: checkoutReducer,
    contact: contactReducer,
    faqs: faqReducer,
    wishlist: wishListReducer,
    brand: brandReducer,
    promo: promoReducer,
    promoCodes: promoCodesReducer,
    activePromoCodes: activePromoCodesReducer,
    promoCodeDetails: promoCodeDetailsReducer,
    promoCode: promoCodeReducer,
    newsletter: newsletterReducer, // CRITICAL: Ensure this is included
    splash: splashReducer, // NEW: Add splash reducer
    settings: settingsReducer, // NEW: Add settings reducer
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: {
        warnAfter: 32,
        // CRITICAL: Don't ignore products or splash paths
        ignoredPaths: [], 
      },
      serializableCheck: {
        warnAfter: 64,
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
    .concat([
      enhancedMutationDetection, // Add this middleware
      // ... your other middleware
    ]),

  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Enhanced debugging helpers
export const getProductsState = () => store.getState().products;
export const getNewsletterState = () => store.getState().newsletter;
export const getSplashState = () => store.getState().splash; // NEW: Add splash state getter
export const getSettingsState = () => store.getState().settings; // NEW: Add settings state getter

export const logCurrentState = () => {
  if (process.env.NODE_ENV === 'development') {
    const state = store.getState();
    console.log('🏪 Current Store State:', {
      productsCount: state.products?.products?.length || 0,
      productsLoading: state.products?.loading,
      userLoaded: !!state.user?.user,
      cartItems: state.cart?.items?.length || 0,
      newsletterCount: state.newsletter?.newsletters?.length || 0,
      newsletterLoading: state.newsletter?.loading,
      splashCount: state.splash?.splashScreens?.length || 0, // NEW: Add splash count
      splashLoading: state.splash?.loading, // NEW: Add splash loading
      activeSplashCount: state.splash?.activeSplashScreens?.length || 0, // NEW: Add active splash count
      hasNewsletterState: !!state.newsletter,
      hasSplashState: !!state.splash, // NEW: Add splash state check
      hasSettingsState: !!state.settings, // NEW: Add settings state check
      storeSettingsLoaded: !!state.settings?.storeSettings,
      notificationSettingsLoaded: !!state.settings?.notificationSettings,
    });
  }
};

// CRITICAL: Export function to check if all reducers are properly connected
export const validateStoreConfiguration = () => {
  const state = store.getState();
  const requiredStates = [
    'user', 'products', 'cart', 'order', 'category', 'sales',
    'payment', 'profile', 'checkout', 'contact', 'faqs', 
    'wishlist', 'brand', 'newsletter', 'promoCodes', 'splash', 'settings' // NEW: Add splash and settings to validation
  ];
  
  const missingStates = requiredStates.filter(key => !state[key]);
  
  if (missingStates.length > 0) {
    console.error("🚨 Store Configuration Error: Missing states:", missingStates);
    return false;
  }
  
  console.log("✅ Store Configuration: All states properly connected");
  return true;
};

// NEW: Export splash-specific helpers
export const getSplashScreens = () => store.getState().splash?.splashScreens || [];
export const getActiveSplashScreens = () => store.getState().splash?.activeSplashScreens || [];
export const getSplashStats = () => store.getState().splash?.stats || null;
export const isSplashLoading = () => store.getState().splash?.loading || false;