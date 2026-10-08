import {
  GetAllCategorySeries,
  GetCategorySeriesDetails,
  CreateCategorySeries,
  UpdateCategorySeries,
  DeleteCategorySeries,
  ClearCategorySeriesErrors,
} from "../constants/categorySeriesConstants";
import type { CategorySeriesState } from "../constants/categorySeriesConstants";
import type { Reducer, AnyAction } from "redux";

const initialState: CategorySeriesState = {
  categorySeries: [],
  series: null,
  loading: false,
  error: null,
  success: false,
  isUpdated: false,
  isDeleted: false,
};

export const categorySeriesReducer: Reducer<CategorySeriesState, AnyAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case GetAllCategorySeries.Request:
      return { ...state, loading: true, error: null };

    case GetAllCategorySeries.Success:
      return { ...state, loading: false, categorySeries: action.payload || [], error: null };

    case GetAllCategorySeries.Fail:
      return { ...state, loading: false, error: action.payload };

    case GetCategorySeriesDetails.Request:
      return { ...state, loading: true, error: null };

    case GetCategorySeriesDetails.Success:
      return { ...state, loading: false, series: action.payload || null, error: null };

    case GetCategorySeriesDetails.Fail:
      return { ...state, loading: false, error: action.payload };

    case CreateCategorySeries.Request:
      return { ...state, loading: true, error: null, success: false };

    case CreateCategorySeries.Success:
      return {
        ...state,
        loading: false,
        success: true,
        categorySeries: [action.payload, ...state.categorySeries],
        error: null,
      };

    case CreateCategorySeries.Fail:
      return { ...state, loading: false, error: action.payload, success: false };

    case CreateCategorySeries.Reset:
      return { ...state, success: false, error: null };

    case UpdateCategorySeries.Request:
      return { ...state, loading: true, error: null, isUpdated: false };

    case UpdateCategorySeries.Success:
      return {
        ...state,
        loading: false,
        isUpdated: true,
        categorySeries: state.categorySeries.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
        error: null,
      };

    case UpdateCategorySeries.Fail:
      return { ...state, loading: false, error: action.payload, isUpdated: false };

    case UpdateCategorySeries.Reset:
      return { ...state, isUpdated: false, error: null };

    case DeleteCategorySeries.Request:
      return { ...state, loading: true, error: null, isDeleted: false };

    case DeleteCategorySeries.Success:
      return {
        ...state,
        loading: false,
        isDeleted: true,
        categorySeries: state.categorySeries.filter((s) => s.id !== action.payload),
        error: null,
      };

    case DeleteCategorySeries.Fail:
      return { ...state, loading: false, error: action.payload, isDeleted: false };

    case DeleteCategorySeries.Reset:
      return { ...state, isDeleted: false, error: null };

    case ClearCategorySeriesErrors:
      return { ...state, error: null };

    default:
      return state;
  }
};
