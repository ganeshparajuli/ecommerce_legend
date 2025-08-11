// src/hooks/useTypedSelectors.ts
import {useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Additional selector for userLogin state - for backward compatibility
export const useUserLogin = () => {
  const user = useAppSelector(state => state.user);
  
  // Map the state structure to match the old structure expected by components
  return {
    loading: user?.loading || false,
    error: user?.error || null,
    userInfo: user?.user || null
  };
};

// User cart selector
export const useCart = () => {
  const cart = useAppSelector(state => state.cart);
  
  return {
    cartItems: cart?.cartItems || [],
    loading: cart?.loading || false,
    error: cart?.error || null,
    itemCount: cart?.itemCount || 0,
    total: cart?.total || 0
  };
};

// Product selector
export const useProducts = () => {
  const products = useAppSelector(state => state.products);
  
  return {
    products: products?.products || [],
    product: products?.product || null,
    loading: products?.loading || false,
    error: products?.error || null
  };
};

// Order selector
export const useOrders = () => {
  const order = useAppSelector(state => state.order);
  
  return {
    orders: order?.orders || [],
    order: order?.order || null,
    loading: order?.loading || false,
    error: order?.error || null
  };
};

// Add similar selector hooks for other state slices as needed