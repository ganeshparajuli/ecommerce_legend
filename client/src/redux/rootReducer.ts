// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';

// Import all reducers
import { userReducer } from './reducers/userReducer';
import { productReducer } from './reducers/productReducer';
import { cartReducer } from './reducers/cartReducer';
import { orderReducer } from './reducers/orderReducer';
import { categoryReducer } from './reducers/categoryReducer';
import { paymentReducer } from './reducers/paymentReducer';
import { profileReducer } from './reducers/profileReducer';
import { checkoutReducer } from './reducers/checkoutReducer';
import { saleReducer } from './reducers/saleReducer';
import { contactReducer } from './reducers/contactReducer';
import { faqReducer } from './reducers/faqReducer';
import { wishListReducer } from './reducers/wishListReducer';
import { brandReducer } from './reducers/brandReducer';
import { newsletterReducer } from './reducers/newsletterReducer';

// Import promo code reducers
import {
  activePromoCodesReducer,
  appliedPromoCodeReducer,
  promoCodeDetailsReducer,
  promoCodeReducer,
  promoCodeValidationReducer,
  promoCodesReducer,
} from './reducers/promoReducer';

// Combine all reducers - matching your store.ts configuration
const rootReducer = combineReducers({
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
  promoCodes: promoCodesReducer,
  activePromoCodes: activePromoCodesReducer,
  promoCodeDetails: promoCodeDetailsReducer,
  promoCode: promoCodeReducer,
  promoCodeValidation: promoCodeValidationReducer,
  appliedPromoCode: appliedPromoCodeReducer,
  newsletter: newsletterReducer, // Added newsletter reducer
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;