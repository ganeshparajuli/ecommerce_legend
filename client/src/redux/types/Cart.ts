// src/redux/types/Cart.ts

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  quantity: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CartState {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  loading: boolean;
  error: string | null;
}