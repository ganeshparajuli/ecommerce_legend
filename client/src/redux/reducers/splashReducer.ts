// src/reducers/splashReducer.ts - COMPLETE FIXED VERSION with immutability
import {
    GetAllSplash,
    GetActiveSplash,
    GetSplashDetails,
    CreateSplash,
    UpdateSplash,
    DeleteSplash,
    ToggleSplashStatus,
    UpdateSplashOrders,
    BulkUpdateSplashStatus,
    GetSplashStats,
    ClearSplashErrors,
  } from "../constants/splashConstants";
  import type {
    Splash,
    SplashState,
    SplashStats
  } from "../constants/splashConstants";
  import type { Reducer, AnyAction } from 'redux';
  
  const initialState: SplashState = {
    splashScreens: [],
    activeSplashScreens: [],
    splash: null,
    stats: null,
    loading: false,
    error: null,
    success: false,
    isUpdated: false,
    isDeleted: false,
    isStatusToggled: false,
    isOrdersUpdated: false,
    isBulkUpdated: false,
  };
  
  // CRITICAL: Helper function to safely clone splash screens array
  const safeSplashArrayClone = (splashScreens: any[]): Splash[] => {
    if (!Array.isArray(splashScreens)) return [];
    
    return splashScreens.map(splash => {
      if (!splash || typeof splash !== 'object') return splash;
      
      // Create a completely new object for each splash screen
      return {
        id: splash.id || splash._id,
        title: splash.title || 'Untitled Splash',
        description: splash.description || null,
        image_url: splash.image_url || splash.imageUrl || null,
        imageUrl: splash.imageUrl || splash.image_url || null,
        product_id: splash.product_id || splash.productId || null,
        productId: splash.productId || splash.product_id || null,
        product_name: splash.product_name || splash.productName || null,
        product_slug: splash.product_slug || splash.productSlug || null,
        product_price: splash.product_price || splash.productPrice || null,
        is_active: splash.is_active !== undefined ? splash.is_active : (splash.isActive !== undefined ? splash.isActive : true),
        isActive: splash.isActive !== undefined ? splash.isActive : (splash.is_active !== undefined ? splash.is_active : true),
        display_order: splash.display_order !== undefined ? splash.display_order : (splash.displayOrder !== undefined ? splash.displayOrder : 0),
        displayOrder: splash.displayOrder !== undefined ? splash.displayOrder : (splash.display_order !== undefined ? splash.display_order : 0),
        start_date: splash.start_date || splash.startDate || null,
        startDate: splash.startDate || splash.start_date || null,
        end_date: splash.end_date || splash.endDate || null,
        endDate: splash.endDate || splash.end_date || null,
        button_text: splash.button_text || splash.buttonText || null,
        buttonText: splash.buttonText || splash.button_text || null,
        button_link: splash.button_link || splash.buttonLink || null,
        buttonLink: splash.buttonLink || splash.button_link || null,
        background_color: splash.background_color || splash.backgroundColor || null,
        backgroundColor: splash.backgroundColor || splash.background_color || null,
        text_color: splash.text_color || splash.textColor || null,
        textColor: splash.textColor || splash.text_color || null,
        created_at: splash.created_at || splash.createdAt || new Date().toISOString(),
        createdAt: splash.createdAt || splash.created_at || new Date().toISOString(),
        updated_at: splash.updated_at || splash.updatedAt || new Date().toISOString(),
        updatedAt: splash.updatedAt || splash.updated_at || new Date().toISOString(),
        // Handle any additional properties
        ...Object.keys(splash).reduce((acc, key) => {
          if (!['id', '_id', 'title', 'description', 'image_url', 'imageUrl', 
                'product_id', 'productId', 'product_name', 'product_slug', 'product_price',
                'is_active', 'isActive', 'display_order', 'displayOrder', 
                'start_date', 'startDate', 'end_date', 'endDate',
                'button_text', 'buttonText', 'button_link', 'buttonLink',
                'background_color', 'backgroundColor', 'text_color', 'textColor',
                'created_at', 'createdAt', 'updated_at', 'updatedAt'].includes(key)) {
            acc[key] = splash[key];
          }
          return acc;
        }, {} as any)
      };
    });
  };
  
  // Helper function to safely clone a single splash screen
  const safeSplashClone = (splash: any): Splash | null => {
    if (!splash || typeof splash !== 'object') return splash;
    return safeSplashArrayClone([splash])[0] || null;
  };
  
  // Helper function to safely clone stats
  const safeStatsClone = (stats: any): SplashStats | null => {
    if (!stats || typeof stats !== 'object') return stats;
    
    return {
      total: stats.total || 0,
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      withProducts: stats.withProducts || 0,
      scheduled: stats.scheduled || 0,
    };
  };
  
  export const splashReducer: Reducer<SplashState, AnyAction> = (state = initialState, action) => {
    switch (action.type) {
      // All Splash Screens
      case GetAllSplash.Request:
        console.log('🎬 SPLASH REDUCER: GetAllSplash.Request');
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case GetAllSplash.Success:
        console.log('🎬 SPLASH REDUCER: GetAllSplash.Success', {
          splashReceived: Array.isArray(action.payload) ? action.payload.length : 0,
          payload: action.payload
        });
        
        const newState = {
          ...state,
          loading: false,
          // CRITICAL: Use safe cloning for splash screens array
          splashScreens: safeSplashArrayClone(action.payload || []),
          error: null,
        };
        
        console.log('🎬 SPLASH REDUCER: New state created', {
          splashCount: newState.splashScreens.length,
          sameReference: state.splashScreens === newState.splashScreens
        });
        
        return newState;
  
      case GetAllSplash.Fail:
        console.log('🎬 SPLASH REDUCER: GetAllSplash.Fail', {
          error: action.payload
        });
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Active Splash Screens
      case GetActiveSplash.Request:
        console.log('🎬 SPLASH REDUCER: GetActiveSplash.Request');
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case GetActiveSplash.Success:
        console.log('🎬 SPLASH REDUCER: GetActiveSplash.Success', {
          activeSplashReceived: Array.isArray(action.payload) ? action.payload.length : 0
        });
        
        return {
          ...state,
          loading: false,
          activeSplashScreens: safeSplashArrayClone(action.payload || []),
          error: null,
        };
  
      case GetActiveSplash.Fail:
        console.log('🎬 SPLASH REDUCER: GetActiveSplash.Fail', {
          error: action.payload
        });
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Splash Details
      case GetSplashDetails.Request:
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case GetSplashDetails.Success:
        return {
          ...state,
          loading: false,
          // CRITICAL: Use safe cloning for single splash
          splash: safeSplashClone(action.payload),
          error: null,
        };
  
      case GetSplashDetails.Fail:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Create Splash
      case CreateSplash.Request:
        return {
          ...state,
          loading: true,
          error: null,
          success: false,
        };
  
      case CreateSplash.Success:
        const newSplash = action.payload?.splash;
        if (!newSplash) return state;
        
        return {
          ...state,
          loading: false,
          success: true,
          // CRITICAL: Create completely new array with cloned splash screens
          splashScreens: [
            safeSplashClone(newSplash),
            ...safeSplashArrayClone(state.splashScreens)
          ],
          error: null,
        };
  
      case CreateSplash.Fail:
        return {
          ...state,
          loading: false,
          error: action.payload,
          success: false,
        };
  
      case CreateSplash.Reset:
        return {
          ...state,
          success: false,
          error: null,
        };
  
      // Update Splash
      case UpdateSplash.Request:
        return {
          ...state,
          loading: true,
          error: null,
          isUpdated: false,
        };
  
      case UpdateSplash.Success:
        const updatedSplash = action.payload?.splash;
        if (!updatedSplash) return state;
        
        return {
          ...state,
          loading: false,
          isUpdated: true,
          // CRITICAL: Create completely new splash screens array
          splashScreens: state.splashScreens.map((splash) => {
            if (splash.id === updatedSplash.id) {
              return safeSplashClone(updatedSplash);
            }
            return safeSplashClone(splash);
          }),
          error: null,
        };
  
      case UpdateSplash.Fail:
        return {
          ...state,
          loading: false,
          error: action.payload,
          isUpdated: false,
        };
  
      case UpdateSplash.Reset:
        return {
          ...state,
          isUpdated: false,
          error: null,
        };
  
      // Delete Splash
      case DeleteSplash.Request:
        return {
          ...state,
          loading: true,
          error: null,
          isDeleted: false,
        };
  
      case DeleteSplash.Success:
        return {
          ...state,
          loading: false,
          isDeleted: true,
          // CRITICAL: Filter and clone remaining splash screens
          splashScreens: safeSplashArrayClone(
            state.splashScreens.filter((splash) => splash.id !== action.payload)
          ),
          error: null,
        };
  
      case DeleteSplash.Fail:
        return {
          ...state,
          loading: false,
          error: action.payload,
          isDeleted: false,
        };
  
      case DeleteSplash.Reset:
        return {
          ...state,
          isDeleted: false,
          error: null,
        };
  
      // Toggle Status
      case ToggleSplashStatus.Request:
        return {
          ...state,
          loading: true,
          error: null,
          isStatusToggled: false,
        };
  
      case ToggleSplashStatus.Success:
        const toggledSplash = action.payload?.splash;
        if (!toggledSplash) return state;
        
        return {
          ...state,
          loading: false,
          isStatusToggled: true,
          splashScreens: state.splashScreens.map((splash) => {
            if (splash.id === toggledSplash.id) {
              return safeSplashClone(toggledSplash);
            }
            return safeSplashClone(splash);
          }),
          error: null,
        };
  
      case ToggleSplashStatus.Fail:
        return {
          ...state,
          loading: false,
          error: action.payload,
          isStatusToggled: false,
        };
  
      case ToggleSplashStatus.Reset:
        return {
          ...state,
          isStatusToggled: false,
          error: null,
        };
  
      // Update Orders
      case UpdateSplashOrders.Request:
        return {
          ...state,
          loading: true,
          error: null,
          isOrdersUpdated: false,
        };
  
      case UpdateSplashOrders.Success:
        return {
          ...state,
          loading: false,
          isOrdersUpdated: true,
          error: null,
        };
  
      case UpdateSplashOrders.Fail:
        return {
          ...state,
          loading: false,
          error: action.payload,
          isOrdersUpdated: false,
        };
  
      case UpdateSplashOrders.Reset:
        return {
          ...state,
          isOrdersUpdated: false,
          error: null,
        };
  
      // Bulk Update Status
      case BulkUpdateSplashStatus.Request:
        return {
          ...state,
          loading: true,
          error: null,
          isBulkUpdated: false,
        };
  
      case BulkUpdateSplashStatus.Success:
        return {
          ...state,
          loading: false,
          isBulkUpdated: true,
          error: null,
        };
  
      case BulkUpdateSplashStatus.Fail:
        return {
          ...state,
          loading: false,
          error: action.payload,
          isBulkUpdated: false,
        };
  
      case BulkUpdateSplashStatus.Reset:
        return {
          ...state,
          isBulkUpdated: false,
          error: null,
        };
  
      // Get Stats
      case GetSplashStats.Request:
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case GetSplashStats.Success:
        return {
          ...state,
          loading: false,
          stats: safeStatsClone(action.payload),
          error: null,
        };
  
      case GetSplashStats.Fail:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Clear Errors
      case ClearSplashErrors:
        return {
          ...state,
          error: null,
        };
  
      default:
        return state;
    }
  };