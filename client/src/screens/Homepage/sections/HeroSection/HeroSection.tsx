import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { ProductImage } from "../../../../utils/imageHelper";
import { getAllProducts } from "../../../../redux/actions/productAction";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import {
  addToWishlist,
  removeFromWishlistByProductId,
} from "../../../../redux/actions/wishlistActions";
import toast, { Toaster } from "react-hot-toast";

const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

interface Product {
  id: string;
  name: string;
  actualPrice: number;
  discountPrice: number;
  finalPrice: number;
  description: string;
  image: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  featured?: boolean; // Added featured property
  specifications?: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export const HeroSection: React.FC = () => {
  const dispatch = useDispatch();
  const {
    products: reduxProducts,
    loading,
    error: reduxError,
  } = useSelector((state: RootState) => state.products);

  const { wishlist } = useSelector((state: RootState) => state.wishlist);

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const favorites = new Set(
    Array.isArray(wishlist)
      ? wishlist.map((item: any) => item.product_id || item.productId)
      : []
  );

  // Process data from Redux
  // Process data from Redux - Filter only featured products
  useEffect(() => {
    if (reduxProducts && reduxProducts.length > 0) {
      const processedProducts = reduxProducts
        .filter(
          (product: any) => product.featured === true || product.featured === 1
        ) // Only show featured products (handles both boolean and integer)
        .map((product: any) => ({
          ...product,
          image: product.image,
        }));
      setProducts(processedProducts);
      setIsLoading(false);
    } else if (loading === false) {
      if (reduxError) {
        setError(reduxError);
      }
      setIsLoading(false);
    }
  }, [reduxProducts, loading, reduxError]);

  useEffect(() => {
    if (!products?.length && !loading) {
      dispatch(getAllProducts() as any);
    }
  }, [dispatch, products?.length, loading]);

  const goToNextSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % products.length);
  }, [products]);

  const goToPrevSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  }, [products]);

  useEffect(() => {
    if (isAutoPlaying && products.length > 0) {
      const interval = setInterval(goToNextSlide, 6000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, goToNextSlide, products.length]);

  const handleManualNavigation = (callback: () => void): void => {
    setIsAutoPlaying(false);
    callback();
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handleTouchStart = (e: React.TouchEvent): void => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = (): void => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleManualNavigation(goToNextSlide);
    } else if (isRightSwipe) {
      handleManualNavigation(goToPrevSlide);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const toggleFavorite = async (productId: string): Promise<void> => {
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

    const isInWishlist = favorites.has(productId);

    try {
      if (isInWishlist) {
        const result = await dispatch(
          removeFromWishlistByProductId(productId) as any
        );

        if (
          result.type === "REMOVE_FROM_WISHLIST_SUCCESS" ||
          result.type.includes("Success")
        ) {
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
            },
          });
        } else if (result.error === "product-not-in-wishlist") {
          toast.info("Item was already removed from wishlist", {
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
        } else {
          throw new Error("Failed to remove from wishlist");
        }
      } else {
        const result = await dispatch(addToWishlist(productId) as any);

        if (
          result.type === "ADD_TO_WISHLIST_SUCCESS" ||
          result.type.includes("Success")
        ) {
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
        } else {
          throw new Error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
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
    }
  };

  const retryFetch = (): void => {
    setIsLoading(true);
    setError(null);
    dispatch(getAllProducts() as any);
  };

  const toggleAutoPlay = (): void => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative h-[500px] md:h-[600px] lg:h-[70vh] w-full bg-gradient-to-br  from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-red-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading products...</p>
            <p className="text-lg text-gray-600">
              Loading featured products...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative h-[500px] md:h-[600px] lg:h-[70vh] w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
            <p className="text-xl text-gray-800 mb-6">
              Unable to load products
            </p>
            <p className="text-xl text-gray-800 mb-6">
              Unable to load featured products
            </p>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
              onClick={retryFetch}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No products state
  // No featured products state
  if (products.length === 0) {
    return (
      <div className="relative h-[500px] md:h-[600px] lg:h-[70vh] w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
            <p className="text-xl text-gray-800 mb-6">No products available</p>
            <p className="text-xl text-gray-800 mb-6">
              No featured products available
            </p>
            <Link to="/products">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3">
                Browse Categories Browse All Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentProduct = products[currentSlide];

  return (
    <div
      className="relative h-[500px] md:h-[600px] lg:h-[70vh] w-full bg-gradient-to-br mt-12 from-gray-50 to-gray-100 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Toaster />

      {/* Background decorative element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/30 to-transparent opacity-60"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full flex items-center"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-0 w-full items-center min-h-[500px]">
              {/* Product Image - Full Display */}
              <div className="order-2 lg:order-1 flex justify-center items-center relative p-6 lg:p-10">
                <div className="relative w-full max-w-lg">
                  {/* Main Product Image - No Card Container */}
                  <div className="relative w-full h-80 md:h-96 lg:h-[450px]">
                    <ProductImage
                      src={currentProduct.image}
                      alt={currentProduct.name}
                      className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                      fallbackUrl="/placeholder.jpg"
                    />

                    {/* Floating Heart Button */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => toggleFavorite(currentProduct.id)}
                        className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 ${
                          favorites.has(currentProduct.id)
                            ? "bg-red-100 text-red-600"
                            : "bg-white/80 text-gray-400 hover:text-red-600"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.has(currentProduct.id)
                              ? "fill-current"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info - Right Side */}
              <div className="order-1 lg:order-2 text-center lg:text-left lg:pl-8 lg:pr-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Discount Offer Badge */}
                  {/* Featured Badge */}
                  <div className="inline-block">
                    <p className="text-gray-600 text-sm md:text-base font-medium mb-3 uppercase tracking-wide">
                      Capture Action Smarter
                    </p>
                    <div className="flex items-center justify-center lg:justify-start space-x-2 mb-3">
                      <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide">
                        Featured
                      </span>
                      <p className="text-gray-600 text-sm md:text-base font-medium uppercase tracking-wide">
                        Capture Action Smarter
                      </p>
                    </div>
                  </div>

                  {/* Product Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-black mb-6 leading-tight uppercase">
                    {currentProduct.name}
                  </h1>

                  {/* Price Section */}
                  <div className="flex items-center justify-center lg:justify-start space-x-4 mb-8 flex-wrap">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-red-600">
                      ₨{currentProduct.finalPrice.toLocaleString()}
                    </span>
                    {currentProduct.actualPrice !==
                      currentProduct.finalPrice && (
                      <>
                        <span className="text-lg md:text-xl text-gray-500 line-through">
                          ₨{currentProduct.actualPrice.toLocaleString()}
                        </span>
                        <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-full uppercase tracking-wide">
                          SAVE ₨
                          {(
                            currentProduct.actualPrice -
                            currentProduct.finalPrice
                          ).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link to={`/product/${currentProduct.id}`}>
                      <Button
                        size="lg"
                        className="bg-black hover:bg-gray-800 text-white px-10 py-4 text-base md:text-lg font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      >
                        Available Now
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={() => handleManualNavigation(goToPrevSlide)}
            className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all transform hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleManualNavigation(goToNextSlide)}
            className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all transform hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {products.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() =>
                handleManualNavigation(() => setCurrentSlide(index))
              }
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-red-600 shadow-lg"
                  : "w-3 bg-black/30 hover:bg-black/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play control */}
      {products.length > 1 && (
        <button
          onClick={toggleAutoPlay}
          className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full p-3 shadow-xl transition-all transform hover:scale-110"
        >
          {isAutoPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};
