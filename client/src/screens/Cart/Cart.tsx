import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ArrowRight,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateCartItem,
  clearCart,
  getCart,
} from "../../redux/actions/cartAction";
import {
  getStoreLocations,
  clearStoreLocationsError,
} from "../../redux/actions/settingsAction";
import type { RootState } from "../../redux/types";
import type { CartItem } from "../../redux/constants/cartConstants";
import type { StoreLocation } from "../../redux/constants/settingsConstants";
import { Button } from "../../components/ui/button";
import PageLayout from "../../components/PageLayout";
import { ProductImage } from "../../utils/imageHelper";
import toast, { Toaster } from "react-hot-toast";
import { formatPrice } from "@/utils/formatPrice";

export const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, loading, total } = useSelector(
    (state: RootState) => state.cart
  );

  // Store locations from Redux
  const {
    locations: storeLocations,
    loading: locationsLoading,
    error: locationsError,
  } = useSelector((state: RootState) => state.settings);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<StoreLocation | null>(
    null
  );
  const [showBranchSelector, setShowBranchSelector] = useState(false);

  // Initialize component and fetch cart if needed
  useEffect(() => {
    const fetchCartData = async () => {
      setIsLoading(true);
      try {
        await dispatch(getCart());
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [dispatch]);

  // Fetch store locations on component mount
  useEffect(() => {
    console.log("Fetching store locations...");
    dispatch(getStoreLocations(true)); // activeOnly = true
  }, [dispatch]);

  // Load previously selected branch from localStorage
  useEffect(() => {
    const savedBranch = localStorage.getItem("selectedBranch");
    if (savedBranch && storeLocations.length > 0) {
      try {
        const branch = JSON.parse(savedBranch);
        // Find the branch in the current locations list
        const foundBranch = storeLocations.find((loc) => loc.id === branch.id);
        if (foundBranch) {
          setSelectedBranch(foundBranch);
        } else {
          // Clear invalid saved branch
          localStorage.removeItem("selectedBranch");
        }
      } catch (error) {
        console.error("Error loading saved branch:", error);
        localStorage.removeItem("selectedBranch");
      }
    }
  }, [storeLocations]);

  // Calculate cart values
  const subtotal = total || 0;
  const estimatedShipping = 200; // Show estimated shipping
  const estimatedTotal = subtotal + estimatedShipping;

  const handleRemoveFromCart = (id: string) => {
    dispatch(removeFromCart(id));
    toast.success("Item removed from cart.");
  };

  const handleQuantityChange = (
    id: string,
    newQuantity: number,
    countInStock: number
  ) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > countInStock) newQuantity = countInStock;

    dispatch(updateCartItem(id, newQuantity));
    toast.success("Quantity updated.");
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
      toast.success("Cart cleared.");
    }
  };

  const handleBranchSelect = (branch: StoreLocation) => {
    setSelectedBranch(branch);
    setShowBranchSelector(false);

    // Save to localStorage for checkout page
    localStorage.setItem("selectedBranch", JSON.stringify(branch));
    console.log("Selected branch saved:", branch);
  };

  const proceedToCheckout = () => {
    if (!selectedBranch) {
      toast.error("Please select a store location before checkout.");
      setShowBranchSelector(true);
      return;
    }

    // Store selected branch in localStorage for checkout page
    localStorage.setItem("selectedBranch", JSON.stringify(selectedBranch));

    // Navigate to checkout
    navigate("/checkout");
  };

  const getEstimatedItemPrice = (item: CartItem): number => {
    if (typeof item.price === "number" && item.price > 0) {
      return item.price;
    }

    if (typeof item.finalPrice === "number" && item.finalPrice > 0) {
      return item.finalPrice;
    }

    if (item.product) {
      if (
        typeof item.product.finalPrice === "number" &&
        item.product.finalPrice > 0
      ) {
        return item.product.finalPrice;
      }

      if (typeof item.product.price === "number" && item.product.price > 0) {
        return item.product.price;
      }
    }

    if (total && cartItems) {
      const totalQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);
      if (totalQuantity === 0) {
        return total / cartItems.length;
      }
      return total / totalQuantity;
    }

    return 0;
  };

  // Display loading state
  if (loading || isLoading) {
    return (
      <PageLayout backgroundColor="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block p-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-2xl mb-6"
            >
              <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-600 text-lg font-medium"
            >
              Loading your cart...
            </motion.p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Display empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <PageLayout backgroundColor="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block p-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-2xl mb-6"
            >
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-black mb-4"
            >
              Your cart is empty
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-lg mb-6"
            >
              Looks like you haven't added anything to your cart yet.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/products">
                <Button className="bg-green-600 hover:bg-green-700 px-6 py-2 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                  Continue Shopping
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const itemsWithPrices = cartItems.map((item) => ({
    ...item,
    estimatedPrice: getEstimatedItemPrice(item),
  }));

  return (
    <PageLayout backgroundColor="bg-white">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12} // adds space between stacked toasts
        toastOptions={{
          duration: 3000,
          style: {
            boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-3xl font-bold text-black"
            >
              Shopping Cart ({cartItems.length}{" "}
              {cartItems.length === 1 ? "item" : "items"})
            </motion.h1>

            {cartItems.length > 0 && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Button
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 bg-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Cart Items */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="lg:col-span-8"
            >
              {/* Cart Items */}
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden mt-6">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                  <h2 className="text-xl font-bold text-black">Your Items</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {itemsWithPrices.map((item) => (
                    <motion.div
                      key={item.id || item.product_id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="p-4 hover:bg-gray-50 transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <div className="rounded-xl overflow-hidden shadow-md transform hover:scale-105 transition-all duration-300">
                          <ProductImage
                            src={item.image || item.product?.image}
                            alt={item.name || item.product?.name || "Product"}
                            className="w-16 h-16 object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-semibold text-black">
                              {item.name || item.product?.name || "Product"}
                            </h3>
                            <button
                              onClick={() =>
                                handleRemoveFromCart(item.product_id as string)
                              }
                              className="text-gray-400 hover:text-red-500 transition-all duration-300 transform hover:scale-110 p-1 rounded-full hover:bg-red-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="mt-1 text-xl font-bold text-green-600">
                            {formatPrice(item.estimatedPrice.toFixed(2))}
                          </p>

                          <div className="mt-3 flex items-center">
                            <div className="flex border border-gray-300 rounded-lg bg-white backdrop-blur-sm shadow-md">
                              <button
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-all duration-300 transform hover:scale-105"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product_id as string,
                                    item.quantity - 1,
                                    item.countInStock || 10
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="flex items-center justify-center w-10 text-black font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-all duration-300 transform hover:scale-105"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product_id as string,
                                    item.quantity + 1,
                                    item.countInStock || 10
                                  )
                                }
                                disabled={
                                  item.quantity >= (item.countInStock || 10)
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="ml-3 text-sm text-gray-600 bg-gray-100 backdrop-blur-sm px-2 py-1 rounded-full">
                              {item.countInStock || 10} available
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Store Selection */}
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                  <h2 className="text-xl font-bold text-black flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Select Store Location
                  </h2>
                </div>
                <div className="p-4">
                  {/* Loading state for locations */}
                  {locationsLoading && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center">
                        <Loader2 className="w-5 h-5 text-green-600 animate-spin mr-2" />
                        <span className="text-gray-600">
                          Loading store locations...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error state for locations */}
                  {locationsError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <div>
                          <p className="text-red-800 font-medium">
                            Error loading store locations
                          </p>
                          <p className="text-red-600 text-sm">
                            {locationsError}
                          </p>
                          <button
                            onClick={() => {
                              dispatch(clearStoreLocationsError());
                              dispatch(getStoreLocations(true));
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No locations available */}
                  {!locationsLoading &&
                    !locationsError &&
                    storeLocations.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          No store locations available
                        </p>
                        <p className="text-gray-500 text-sm">
                          Please contact support for assistance
                        </p>
                      </div>
                    )}

                  {/* Selected branch display */}
                  {!locationsLoading && selectedBranch && (
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-black">
                            {selectedBranch.locationName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedBranch.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedBranch.phone}
                          </p>
                          {selectedBranch.email && (
                            <p className="text-sm text-gray-600">
                              {selectedBranch.email}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBranchSelector(true)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* No branch selected */}
                  {!locationsLoading &&
                    !selectedBranch &&
                    storeLocations.length > 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">
                          Please select a store location to continue
                        </p>
                        <Button
                          onClick={() => setShowBranchSelector(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Select Store Location
                        </Button>
                      </div>
                    )}

                  {/* Branch Selector Modal/Dropdown */}
                  {showBranchSelector && storeLocations.length > 0 && (
                    <div className="mt-4 border border-gray-200 rounded-lg bg-white">
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <h4 className="font-medium text-black">
                          Choose Your Store ({storeLocations.length} available)
                        </h4>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {storeLocations.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => handleBranchSelect(location)}
                            className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-black">
                                  {location.locationName}
                                </h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  {location.address}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {location.phone}
                                  {location.email && ` • ${location.email}`}
                                </p>
                              </div>
                              <span
                                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  location.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {location.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBranchSelector(false)}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Order Summary */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="lg:col-span-4"
            >
              <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 mt-6 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-black mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-black font-semibold">
                      {formatPrice(subtotal.toFixed(2))}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 font-medium">
                      Estimated Shipping
                    </span>
                    <span className="text-black font-semibold">
                      {formatPrice(estimatedShipping.toFixed(2))}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-black">
                        Estimated Total
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(estimatedTotal.toFixed(2))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    onClick={proceedToCheckout}
                    disabled={!selectedBranch}
                    className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Link
                    to="/products"
                    className="block text-center text-green-600 hover:text-green-700 font-medium hover:underline transition-all duration-300"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {!selectedBranch && storeLocations.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Please select a store location before proceeding to
                      checkout.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Cart;
