import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProductImage } from "../../../../utils/imageHelper";
import { getAllProducts } from "../../../../redux/actions/productAction";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import { addToCart } from "../../../../redux/actions/cartAction";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../../redux/actions/wishlistActions";
import toast, { Toaster } from "react-hot-toast";
import { formatPrice } from "@/utils/formatPrice";

// Utility functions
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
  created_at: string;
  updated_at: string;
  rating?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

export const NewArrivals = () => {
  const dispatch = useDispatch();
  const {
    products: reduxProducts,
    loading,
    error: reduxError,
  } = useSelector((state: RootState) => state.products);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Process products data - limit to 5 products for responsive layout
  useEffect(() => {
    if (reduxProducts && reduxProducts.length > 0) {
      const processedProducts = reduxProducts
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5) // Show 5 products in a row
        .map((product: any, index: number) => ({
          ...product,
          rating: 4 + Math.random() * 1,
          isNew: index < 3, // First 3 are new
          isTrending: index < 1, // First 1 is trending
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

  // Initial fetch
  useEffect(() => {
    if (!reduxProducts || reduxProducts.length === 0) {
      dispatch(getAllProducts() as any);
    }
  }, [dispatch, reduxProducts]);

  const toggleFavorite = async (productId: string) => {
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your wishlist", {
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }

    const isCurrentlyFavorited = favorites.has(productId);

    try {
      let result;

      if (isCurrentlyFavorited) {
        result = await dispatch(removeFromWishlist(productId) as any);

        if (
          result &&
          (result.type === "REMOVE_FROM_WISHLIST_SUCCESS" ||
            (result.type &&
              result.type.includes &&
              result.type.includes("Success")) ||
            result.success === true)
        ) {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.delete(productId);
            return newFavorites;
          });

          toast.success("💔 Removed from wishlist", {
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          toast.error("Failed to remove from wishlist. Please try again.", {
            duration: 3000,
            position: "bottom-right",
          });
        }
      } else {
        result = await dispatch(addToWishlist(productId) as any);

        if (
          result &&
          (result.type === "ADD_TO_WISHLIST_SUCCESS" ||
            (result.type &&
              result.type.includes &&
              result.type.includes("Success")) ||
            result.success === true)
        ) {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.add(productId);
            return newFavorites;
          });

          toast.success("💖 Added to wishlist!", {
            duration: 2000,
            position: "bottom-right",
          });
        } else if (result && result.type === "ALREADY_EXISTS") {
          toast.info("Item already in your wishlist", {
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          toast.error("Failed to add to wishlist. Please try again.", {
            duration: 3000,
            position: "bottom-right",
          });
        }
      }
    } catch (error) {
      console.error("❌ Wishlist error:", error);
      toast.error("Something went wrong. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your cart", {
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

    try {
      dispatch(addToCart({ ...product, quantity: 1 }) as any);

      toast.success(`${product.name} added to cart!`, {
        duration: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`Failed to add ${product.name} to cart.`, {
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      setTimeout(() => {
        setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
      }, 600);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black">
              New Arrivals
            </h2>
            <Link
              to="/products"
              className="text-black hover:text-gray-600 font-medium text-sm flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 h-72 sm:h-80 lg:h-96 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black">
              New Arrivals
            </h2>
            <Link
              to="/products"
              className="text-black hover:text-gray-600 font-medium text-sm flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="text-center py-1">
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => dispatch(getAllProducts() as any)}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className=" bg-white">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black">
            New Arrivals
          </h2>
          <Link
            to="/products"
            className="text-black hover:text-gray-600 font-medium text-sm flex items-center transition-colors"
          >
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Products Grid - Responsive Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative border border-gray-100 rounded-lg"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link to={`/product/${product.id}`} className="block ">
                <div className="relative overflow-hidden bg-white">
                  {/* Product Badges */}
                  {product.isNew && (
                    <span className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 text-xs font-bold rounded z-10">
                      NEW
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all hover:scale-110 ${
                      favorites.has(product.id)
                        ? "bg-red-100 text-red-600"
                        : "bg-white/80 text-gray-400 hover:text-red-600"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(product.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  {/* Product Image */}
                  <div className="relative">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      fallbackUrl="/placeholder.jpg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Price */}
                    <div className="space-y-1">
                      {product.actualPrice !== product.finalPrice && (
                        <span className="text-xs sm:text-sm text-gray-500 line-through block">
                          {formatPrice(product.actualPrice)}
                        </span>
                      )}
                      <span className="text-sm sm:text-base font-bold text-black block">
                        {formatPrice(product.finalPrice)}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-800 text-sm sm:text-base leading-tight line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Color Variants - Mock data for visual similarity to screenshot */}
                    <div className="flex items-center space-x-1 pt-1">
                      <div className="w-4 h-4 rounded-full bg-red-500 border border-gray-200"></div>
                      <div className="w-4 h-4 rounded-full bg-blue-500 border border-gray-200"></div>
                      <div className="w-4 h-4 rounded-full bg-green-500 border border-gray-200"></div>
                      <span className="text-xs text-gray-500 ml-1">+1</span>
                    </div>
                  </div>
                </div>
                {/* Hover Overlay for Quick Actions */}
                <AnimatePresence>
                  {hoveredProduct === product.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/5 flex items-center justify-center"
                      // onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={
                            addingToCart[product.id] || product.quantity <= 0
                          }
                          className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                          {addingToCart[product.id] ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border-2 border-t-gray-600 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                            />
                          ) : (
                            <ShoppingCart className="w-4 h-4 text-gray-700" />
                          )}
                        </button>

                        <Link
                          to={`/product/${product.id}`}
                          className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all"
                        >
                          <Eye className="w-4 h-4 text-gray-700" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
