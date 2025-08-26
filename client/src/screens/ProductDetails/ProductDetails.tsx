import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Minus,
  Plus,
  Star,
  ShoppingCart,
  Eye,
  Share2,
  ArrowLeft,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import PageLayout from "../../components/PageLayout";
import { getProductDetails } from "../../redux/actions/productAction";
import { addToCart } from "../../redux/actions/cartAction";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlistActions";
import { ProductImage, getImageUrl } from "../../utils/imageHelper";
import type { RootState } from "../../redux/store";
import { formatPrice } from "@/utils/formatPrice";

// Utility functions
const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Redux state
  const { product, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const { wishlist } = useSelector(
    (state: RootState) => state.wishlist || { wishlist: [] }
  );

  // Fetch product details when component mounts or ID changes
  useEffect(() => {
    if (id) {
      console.log("Fetching product details for ID:", id);
      dispatch(getProductDetails(id) as any);
    }
  }, [dispatch, id]);

  // Check if product is wishlisted
  useEffect(() => {
    if (product && wishlist) {
      setIsWishlisted(wishlist.includes(product.id));
    }
  }, [product, wishlist]);

  // Debug log
  useEffect(() => {
    console.log("Product state:", { product, loading, error });
  }, [product, loading, error]);

  const tabs = [
    { id: "details", label: "DETAILS" },
    { id: "specifications", label: "SPECIFICATIONS" },
    { id: "reviews", label: "REVIEWS" },
    { id: "related", label: "RELATED PRODUCTS" },
  ];

  const handleQuantityChange = (action: string) => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if user is logged in first
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your cart", {
        duration: 3000,
        position: "bottom-right",
        style: {
          background: "#ffffff",
          color: "#dc2626",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px",
        },
      });
      return;
    }

    setAddingToCart(true);
    try {
      dispatch(addToCart({ ...product, quantity }) as any);

      toast.success(
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mr-3">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-600">
              Added {quantity} to cart!
            </div>
          </div>
        </div>,
        {
          duration: 4000,
          position: "bottom-right",
          style: {
            background: "#ffffff",
            color: "#111827",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          },
        }
      );
    } catch (error) {
      toast.error(`Failed to add ${product.name} to cart.`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!product) return;

    // Check if user is logged in first
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your wishlist", {
        duration: 3000,
        position: "bottom-right",
        style: {
          background: "#ffffff",
          color: "#dc2626",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px",
        },
      });
      return;
    }

    const willBeWishlisted = !isWishlisted;

    try {
      // Update local state optimistically
      setIsWishlisted(willBeWishlisted);

      // Dispatch Redux actions
      if (willBeWishlisted) {
        const result = await dispatch(addToWishlist(product.id) as any);
        if (result.type.includes("Success")) {
          toast.success("💖 Added to wishlist!", {
            duration: 2000,
            position: "bottom-right",
            style: {
              background: "#ffffff",
              color: "#dc2626",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "14px",
              padding: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
          });
        } else if (result.type === "ALREADY_EXISTS") {
          toast.info("Item already in your wishlist", {
            duration: 2000,
            position: "bottom-right",
            style: {
              background: "#ffffff",
              color: "#059669",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "14px",
              padding: "12px",
            },
          });
        }
      } else {
        const result = await dispatch(removeFromWishlist(product.id) as any);
        if (result.type.includes("Success")) {
          toast.success("💔 Removed from wishlist", {
            duration: 2000,
            position: "bottom-right",
            style: {
              background: "#ffffff",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "14px",
              padding: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
          });
        }
      }
    } catch (error) {
      // Revert local state on error
      setIsWishlisted(!willBeWishlisted);

      // Show error toast
      toast.error("Something went wrong. Please try again.", {
        duration: 3000,
        position: "bottom-right",
        style: {
          background: "#ffffff",
          color: "#dc2626",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px",
        },
      });

      console.error("Wishlist error:", error);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // const formatPrice = (price: any): string => {
  //   if (price === null || price === undefined) return "0.00";
  //   try {
  //     const numPrice = typeof price === "string" ? parseFloat(price) : price;
  //     return numPrice.toFixed(2);
  //   } catch (e) {
  //     return "0.00";
  //   }
  // };

  const getPriceAsNumber = (price: any): number => {
    if (price === null || price === undefined) return 0;
    try {
      return typeof price === "string" ? parseFloat(price) : price;
    } catch (e) {
      return 0;
    }
  };

  const calculateDiscount = (actualPrice: any, finalPrice: any): number => {
    const actual = getPriceAsNumber(actualPrice);
    const final = getPriceAsNumber(finalPrice);
    if (actual === 0) return 0;
    return Math.round(((actual - final) / actual) * 100);
  };

  const renderTabContent = () => {
    if (!product) return null;

    switch (activeTab) {
      case "details":
        return (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Product Details
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {product.description ||
                "Experience exceptional quality with this premium product."}
            </p>
            {product.keyFeatures &&
              Array.isArray(product.keyFeatures) &&
              product.keyFeatures.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">
                    Key Features:
                  </h4>
                  <ul className="space-y-2">
                    {product.keyFeatures.map(
                      (feature: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm sm:text-base text-gray-700"
                        >
                          <span className="text-red-600 font-bold">
                            {index + 1}.
                          </span>
                          <span>{feature}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        );
      case "specifications":
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Technical Specifications
            </h3>
            {product.specifications &&
            typeof product.specifications === "object" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 gap-1 sm:gap-0"
                  >
                    <span className="text-sm sm:text-base pr-0 sm:pr-10 text-gray-600 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm sm:text-base text-gray-600">
                No specifications available.
              </p>
            )}
          </div>
        );
      case "reviews":
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Customer Reviews
            </h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="flex">{renderStars(product.rating || 0)}</div>
                <span className="text-base sm:text-lg font-semibold text-gray-900">
                  {product.rating || 0}
                </span>
                <span className="text-sm sm:text-base text-gray-600">
                  ({product.reviews || 0} reviews)
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Reviews coming soon...
              </p>
            </div>
          </div>
        );
      case "related":
        return (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Related Products
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Related products will be displayed here.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <PageLayout className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-t-red-600 border-r-red-200 border-b-red-200 border-l-red-200 rounded-full"
        />
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <Package className="w-16 h-16 sm:w-20 sm:h-20 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all text-sm sm:text-base"
          >
            Back to Products
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="min-h-screen bg-white">
      <Toaster />

      <div className="max-w-7xl mx-auto pt-20 sm:pt-28 lg:pt-36 xl:pt-48 px-3 sm:px-4 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-red-600 mb-4 sm:mb-6 lg:mb-8 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Products
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="aspect-square bg-gray-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-gray-200">
              <ProductImage
                src={product.image}
                index={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
                fallbackUrl="/placeholder.jpg"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <ProductImage
                  key={index}
                  src={product.image}
                  index={index}
                  alt={`${product.name} ${index + 1}`}
                  className={`aspect-square rounded-lg sm:rounded-xl object-cover cursor-pointer border-2 transition-all ${
                    selectedImage === index
                      ? "border-red-600 shadow-lg"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedImage(index)}
                  fallbackUrl="/placeholder.jpg"
                />
              )).filter((_, index) => {
                const imageUrl = getImageUrl(product.image, index);
                return imageUrl !== null;
              })}
            </div>
          </motion.div>

          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="flex">{renderStars(product.rating || 0)}</div>
                <span className="text-xs sm:text-sm text-gray-600">
                  ({product.reviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-red-600">
                  {formatPrice(product.finalPrice)}
                </span>
                {getPriceAsNumber(product.actualPrice) >
                  getPriceAsNumber(product.finalPrice) && (
                  <>
                    <span className="text-base sm:text-lg text-gray-500 line-through">
                      {formatPrice(product.actualPrice)}
                    </span>
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      -
                      {calculateDiscount(
                        product.actualPrice,
                        product.finalPrice
                      )}
                      % OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  Availability:
                </span>
                <span
                  className={`font-semibold text-sm sm:text-base ${
                    product.quantity > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              {product.sku && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 text-sm sm:text-base">
                    SKU:
                  </span>
                  <span className="text-gray-900 text-sm sm:text-base">
                    {product.sku}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  Category:
                </span>
                <span className="text-gray-900 text-sm sm:text-base">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="font-medium text-gray-900 text-sm sm:text-base">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-xl sm:rounded-2xl bg-white w-fit">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="p-2 sm:p-3 hover:bg-gray-100 rounded-l-xl sm:rounded-l-2xl transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                  <span className="px-4 sm:px-6 py-2 sm:py-3 min-w-[3rem] sm:min-w-[4rem] text-center text-gray-900 font-semibold text-sm sm:text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="p-2 sm:p-3 hover:bg-gray-100 rounded-r-xl sm:rounded-r-2xl transition-colors"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.quantity === 0}
                  className={`flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base ${
                    addingToCart || product.quantity === 0
                      ? "opacity-75 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full"
                      />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                    isWishlisted
                      ? "border-red-600 bg-red-50 text-red-600"
                      : "border-gray-300 bg-white hover:border-red-600 hover:text-red-600 text-gray-600"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isWishlisted ? "fill-current" : ""
                    }`}
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-t border-gray-200 pt-6 sm:pt-8"
        >
          <div className="border-b border-gray-200 mb-4 sm:mb-6">
            <nav className="-mb-px flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="min-h-[300px] sm:min-h-[400px] bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200">
            {renderTabContent()}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ProductDetailPage;
