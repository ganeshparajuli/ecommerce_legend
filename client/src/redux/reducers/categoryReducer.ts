// src/reducers/categoryReducer.ts - COMPLETE FIXED VERSION with immutability
import {
  GetAllCategories,
  GetCategoryDetails,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  ClearCategoryErrors,
} from "../constants/categoryConstants";
import type {
  Category,
  CategoryState
} from "../constants/categoryConstants"
import type { Reducer, AnyAction } from 'redux';

const initialState: CategoryState = {
  categories: [],
  category: null,
  loading: false,
  error: null,
  success: false,
  isUpdated: false,
  isDeleted: false,
};

// CRITICAL: Helper function to safely clone categories array
const safeCloneCategories = (categories: any[]): Category[] => {
  if (!Array.isArray(categories)) return [];
  
  return categories.map(category => {
    if (!category || typeof category !== 'object') return category;
    
    // Create a completely new object for each category
    return {
      id: category.id || category._id,
      name: category.name || 'Unnamed Category',
      slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-'),
      description: category.description || '',
      image: category.image || category.imageUrl || '/category-placeholder.jpg',
      icon: category.icon || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
      sortOrder: category.sortOrder || 0,
      createdAt: category.createdAt || category.created_at,
      updatedAt: category.updatedAt || category.updated_at,
      // Handle any additional properties
      ...Object.keys(category).reduce((acc, key) => {
        if (!['id', '_id', 'name', 'slug', 'description', 'image', 'imageUrl', 
              'icon', 'isActive', 'sortOrder', 'createdAt', 'updatedAt', 
              'created_at', 'updated_at'].includes(key)) {
          acc[key] = category[key];
        }
        return acc;
      }, {} as any)
    };
  });
};

// Helper function to safely clone a single category
const safeCloneCategory = (category: any): Category | null => {
  if (!category || typeof category !== 'object') return category;
  return safeCloneCategories([category])[0] || null;
};

export const categoryReducer: Reducer<CategoryState, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    // All Categories
    case GetAllCategories.Request:
      console.log('🏪 CATEGORY REDUCER: GetAllCategories.Request');
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetAllCategories.Success:
      console.log('🏪 CATEGORY REDUCER: GetAllCategories.Success', {
        categoriesReceived: Array.isArray(action.payload) ? action.payload.length : 0,
        payload: action.payload
      });
      
      const newState = {
        ...state,
        loading: false,
        // CRITICAL: Use safe cloning for categories array
        categories: safeCloneCategories(action.payload || []),
        error: null,
      };
      
      console.log('🏪 CATEGORY REDUCER: New state created', {
        categoriesCount: newState.categories.length,
        sameReference: state.categories === newState.categories
      });
      
      return newState;

    case GetAllCategories.Fail:
      console.log('🏪 CATEGORY REDUCER: GetAllCategories.Fail', {
        error: action.payload
      });
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Category Details
    case GetCategoryDetails.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetCategoryDetails.Success:
      return {
        ...state,
        loading: false,
        // CRITICAL: Use safe cloning for single category
        category: safeCloneCategory(action.payload),
        error: null,
      };

    case GetCategoryDetails.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // New Category
    case CreateCategory.Request:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };

    case CreateCategory.Success:
      const newCategory = action.payload?.category;
      if (!newCategory) return state;
      
      return {
        ...state,
        loading: false,
        success: true,
        // CRITICAL: Create completely new array with cloned categories
        categories: [
          safeCloneCategory(newCategory),
          ...safeCloneCategories(state.categories)
        ],
        error: null,
      };

    case CreateCategory.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case CreateCategory.Reset:
      return {
        ...state,
        success: false,
        error: null,
      };

    // Update Category
    case UpdateCategory.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isUpdated: false,
      };

    case UpdateCategory.Success:
      const updatedCategory = action.payload?.category;
      if (!updatedCategory) return state;
      
      return {
        ...state,
        loading: false,
        isUpdated: true,
        // CRITICAL: Create completely new categories array
        categories: state.categories.map((category) => {
          if (category.id === updatedCategory.id) {
            return safeCloneCategory(updatedCategory);
          }
          return safeCloneCategory(category);
        }),
        error: null,
      };

    case UpdateCategory.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isUpdated: false,
      };

    case UpdateCategory.Reset:
      return {
        ...state,
        isUpdated: false,
        error: null,
      };

    // Delete Category
    case DeleteCategory.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isDeleted: false,
      };

    case DeleteCategory.Success:
      return {
        ...state,
        loading: false,
        isDeleted: true,
        // CRITICAL: Filter and clone remaining categories
        categories: safeCloneCategories(
          state.categories.filter((category) => category.id !== action.payload)
        ),
        error: null,
      };

    case DeleteCategory.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isDeleted: false,
      };

    case DeleteCategory.Reset:
      return {
        ...state,
        isDeleted: false,
        error: null,
      };

    // Clear Errors
    case ClearCategoryErrors:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};