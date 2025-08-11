// src/redux/hooks.ts

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState } from './types';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;