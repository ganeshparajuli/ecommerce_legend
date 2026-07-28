import {
  AddToCart,
  GetCart,
  UpdateCartItem,
  RemoveCartItem,
  ClearCart,
  GetCartCount,
  ToggleCartItem,
  ClearCartErrors,
} from "../constants/cartConstants";
import api from "../api";
import type { Dispatch } from "redux";

const getErrorMessage = (error: any): string =>
  error.response?.data?.error || error.response?.data?.message || error.message || "An error occurred";

const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

interface SaleInfo {
  saleId?: string | null;
}

export const initializeCart = () => async (dispatch: Dispatch): Promise<void> => {
  if (!isLoggedIn()) {
    dispatch({ type: GetCart.Success, payload: { cartItems: [], cartTotal: 0, itemCount: 0 } });
    return;
  }
  dispatch(getCart() as any);
};

/** Add a specific product variant to the cart (this is what determines price - not the product). */
export const addToCart = (productVariantId: string, quantity = 1, saleInfo?: SaleInfo) => async (
  dispatch: Dispatch
): Promise<"login-required" | "success" | "error"> => {
  try {
    if (!isLoggedIn()) {
      dispatch({ type: AddToCart.Fail, payload: "User not logged in" });
      return "login-required";
    }

    dispatch({ type: AddToCart.Request });

    const { data } = await api.post("cart/", {
      productVariantId,
      quantity,
      saleId: saleInfo?.saleId ?? undefined,
    });

    dispatch({ type: AddToCart.Success, payload: data.data });
    dispatch(getCart(true) as any);
    dispatch(getCartCount());

    return "success";
  } catch (error) {
    dispatch({ type: AddToCart.Fail, payload: getErrorMessage(error) });
    return "error";
  }
};

export const getCart = (force = false) => async (dispatch: Dispatch, getState: () => any): Promise<void> => {
  try {
    if (!isLoggedIn()) {
      dispatch({ type: GetCart.Success, payload: { cartItems: [], cartTotal: 0, itemCount: 0 } });
      return;
    }

    const { cart } = getState();
    if (!force && cart?.cartFetched) return;

    dispatch({ type: GetCart.Request });
    const { data } = await api.get("cart");
    dispatch({ type: GetCart.Success, payload: data.data });
  } catch (error) {
    dispatch({ type: GetCart.Fail, payload: getErrorMessage(error) });
  }
};

export const updateCartItem = (productVariantId: string, quantity: number) => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) return;
    dispatch({ type: UpdateCartItem.Request });
    await api.put(`cart/${productVariantId}`, { quantity });
    dispatch(getCart(true) as any);
  } catch (error) {
    dispatch({ type: UpdateCartItem.Fail, payload: getErrorMessage(error) });
  }
};

export const removeFromCart = (productVariantId: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) return;
    dispatch({ type: RemoveCartItem.Request });
    await api.delete(`cart/${productVariantId}`);
    dispatch({ type: RemoveCartItem.Success, payload: productVariantId });
    dispatch(getCartCount());
  } catch (error) {
    dispatch({ type: RemoveCartItem.Fail, payload: getErrorMessage(error) });
  }
};

export const clearCart = () => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) {
      dispatch({ type: ClearCart.Success });
      return;
    }
    dispatch({ type: ClearCart.Request });
    await api.delete("cart/");
    dispatch({ type: ClearCart.Success });
  } catch (error) {
    dispatch({ type: ClearCart.Fail, payload: getErrorMessage(error) });
  }
};

export const getCartCount = () => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) {
      dispatch({ type: GetCartCount.Success, payload: 0 });
      return;
    }
    dispatch({ type: GetCartCount.Request });
    const { data } = await api.get("cart/count");
    dispatch({ type: GetCartCount.Success, payload: data.data.count });
  } catch (error) {
    dispatch({ type: GetCartCount.Fail, payload: 0 });
  }
};

export const toggleCartItem = (productVariantId: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) return;
    await api.patch(`cart/${productVariantId}/toggle`);
    dispatch({ type: ToggleCartItem, payload: { productVariantId } });
  } catch (error) {
    dispatch({ type: RemoveCartItem.Fail, payload: getErrorMessage(error) });
  }
};

export const clearErrors = () => (dispatch: Dispatch): void => {
  dispatch({ type: ClearCartErrors });
};
