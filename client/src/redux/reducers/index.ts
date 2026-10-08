// src/redux/reducers/index.ts - Ensure all reducers are properly exported
import { userReducer } from './userReducer';
import { productReducer } from './productReducer';
import { cartReducer } from './cartReducer';
import { orderReducer } from './orderReducer';
import { categoryReducer } from './categoryReducer';
import { paymentReducer } from './paymentReducer';
import { profileReducer } from './profileReducer';
import { checkoutReducer } from './checkoutReducer';
import { saleReducer } from './saleReducer';
import { contactReducer } from './contactReducer';
import { faqReducer } from './faqReducer';
import { wishListReducer } from './wishListReducer';
import { brandReducer } from './brandReducer';
import { categorySeriesReducer } from './categorySeriesReducer';
import { newsletterReducer } from './newsletterReducer'; // CRITICAL: Import newsletter reducer

import {
  activePromoCodesReducer,
  appliedPromoCodeReducer,
  promoCodeDetailsReducer,
  promoCodeReducer,
  promoCodeValidationReducer,
  promoCodesReducer,
} from './promoReducer';

// Export all reducers
export {
  userReducer,
  productReducer,
  cartReducer,
  orderReducer,
  categoryReducer,
  paymentReducer,
  profileReducer,
  checkoutReducer,
  saleReducer,
  contactReducer,
  faqReducer,
  wishListReducer,
  brandReducer,
  categorySeriesReducer,
  newsletterReducer, // CRITICAL: Export newsletter reducer
  activePromoCodesReducer,
  appliedPromoCodeReducer,
  promoCodeDetailsReducer,
  promoCodeReducer,
  promoCodeValidationReducer,
  promoCodesReducer,
};

// Verify all reducers are properly exported
if (process.env.NODE_ENV === 'development') {
  console.log('📋 Reducers Index: Checking exports...', {
    userReducer: !!userReducer,
    productReducer: !!productReducer,
    cartReducer: !!cartReducer,
    orderReducer: !!orderReducer,
    categoryReducer: !!categoryReducer,
    paymentReducer: !!paymentReducer,
    profileReducer: !!profileReducer,
    checkoutReducer: !!checkoutReducer,
    saleReducer: !!saleReducer,
    contactReducer: !!contactReducer,
    faqReducer: !!faqReducer,
    wishListReducer: !!wishListReducer,
    brandReducer: !!brandReducer,
    newsletterReducer: !!newsletterReducer, // CRITICAL: Verify this
    promoCodesReducer: !!promoCodesReducer,
  });
}