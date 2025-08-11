
// ALL types in one file to avoid import issues

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Cart types
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

// Order types
export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export interface Order {
  id?: string;
  user?: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt?: Date;
}

export interface OrderState {
  order: Order | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

// For compatibility
export type OrderCreateState = OrderState;
export type OrderDetailsState = OrderState;
export type OrderPayState = OrderState;
export type OrderListMyState = OrdersState;

// Product types
export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
  reviews?: Review[];
}

export interface ProductListState {
  loading: boolean;
  products: Product[];
  error: string | null;
  page?: number;
  pages?: number;
}

export interface ProductDetailsState {
  loading: boolean;
  product?: Product;
  error: string | null;
}

export interface ProductReviewState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Wishlist types
export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  countInStock?: number;
  description?: string;
  brand?: string;
  category?: string;
  rating?: number;
  numReviews?: number;
}

export interface WishlistState {
  loading: boolean;
  items: WishlistItem[];
  error: string | null;
}

// Root state interface
export interface RootState {
  userLogin: UserState;
  userRegister: UserState;
  userDetails: UserState;
  userUpdateProfile: {
    loading: boolean;
    success: boolean;
    error: string | null;
  };
  cart: CartState;
  orderCreate: OrderCreateState;
  orderDetails: OrderDetailsState;
  orderPay: OrderPayState;
  orderListMy: OrderListMyState;
  productList: ProductListState;
  productDetails: ProductDetailsState;
  productReview: ProductReviewState;
  wishlist: WishlistState;
}