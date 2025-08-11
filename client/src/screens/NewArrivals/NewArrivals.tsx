import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  EyeIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ProductImage } from "../../utils/imageHelper";
import { getAllProducts } from "../../redux/actions/productAction";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlistActions";

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
  const scrollContainer = useRef<HTMLDivElement>(null);

  // Process products data
  useEffect(() => {
    if (reduxProducts && reduxProducts.length > 0) {
      // Get newest products and add mock data for demo
      const processedProducts = reduxProducts
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 8)
        .map((product: any, index: number) => ({
          ...product,
          rating: 4 + Math.random() * 1, // Mock rating 4-5
          isNew: index < 3,
          isTrending: index < 2,
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

  const scroll = (direction: "left" | "right") => {
    if (scrollContainer.current) {
      const { current } = scrollContainer;
      const scrollAmount = direction === "left" ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      dispatch(removeFromWishlist(productId) as any);
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
      dispatch(addToWishlist(productId) as any);
    }
    setFavorites(newFavorites);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
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
      <section className="relative py-20 bg-gradient-to-br from-white via-red-50 to-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <div className="flex items-center mb-4">
                <SparklesIcon className="w-8 h-8 text-red-600 mr-3" />
                <span className="text-red-600 font-semibold text-lg">
                  Fresh Arrivals
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                New Arrivals
              </h2>
            </div>
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
          </motion.div>

          <div className="flex space-x-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex-none w-80"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-br from-white via-red-50 to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="flex items-center mb-4">
              <SparklesIcon className="w-8 h-8 text-red-600 mr-3" />
              <span className="text-red-600 font-semibold text-lg">
                Fresh Arrivals
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              New Arrivals
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Discover the latest products just added to our collection
            </p>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center text-red-600 hover:text-red-700 font-semibold transition-colors group"
          >
            <span>View all products</span>
            <ChevronRightIcon className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md hover:bg-white shadow-lg hover:shadow-xl rounded-full p-3 border border-gray-200 transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md hover:bg-white shadow-lg hover:shadow-xl rounded-full p-3 border border-gray-200 transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-700" />
          </motion.button>

          {/* Products Container */}
          <div
            ref={scrollContainer}
            className="flex overflow-x-auto scrollbar-hide space-x-6 px-12 py-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-none w-80 group"
                style={{ scrollSnapAlign: "start" }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Product Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
                    {product.isNew && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center"
                      >
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        NEW
                      </motion.span>
                    )}
                    {product.isTrending && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full flex items-center"
                      >
                        <TrendingUpIcon className="w-3 h-3 mr-1" />
                        TRENDING
                      </motion.span>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {product.actualPrice !== product.finalPrice && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        -
                        {Math.round(
                          ((product.actualPrice - product.finalPrice) /
                            product.actualPrice) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative mb-6 group">
                    <div className="w-full h-64 bg-gray-50 rounded-xl overflow-hidden">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                        fallbackUrl="/placeholder.jpg"
                      />
                    </div>

                    {/* Overlay Actions */}
                    <AnimatePresence>
                      {hoveredProduct === product.id && (
                        <motion.div
                          key="overlay-actions" // Add unique key
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center space-x-3"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(product.id);
                            }}
                            className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
                              favorites.has(product.id)
                                ? "bg-red-500 text-white"
                                : "bg-white text-gray-700 hover:bg-red-50"
                            }`}
                          >
                            <HeartIcon className="w-5 h-5" />
                          </motion.button>

                          <Link to={`/product/${product.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-3 rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-lg transition-all duration-200"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </motion.button>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Product Info */}
                  <div className="relative z-10">
                    <div className="mb-3">
                      <span className="text-sm text-red-600 font-medium">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="text-gray-900 font-semibold text-lg mb-3 line-clamp-2 group-hover:text-red-700 transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-2">
                        {renderStars(product.rating || 4.5)}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({product.rating?.toFixed(1) || "4.5"})
                      </span>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-gray-900 font-bold text-xl">
                            ₨{product.finalPrice.toLocaleString()}
                          </span>
                          {product.actualPrice !== product.finalPrice && (
                            <span className="text-gray-500 line-through text-sm">
                              ₨{product.actualPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {product.actualPrice !== product.finalPrice && (
                          <span className="text-green-600 text-sm font-medium">
                            Save ₨
                            {(
                              product.actualPrice - product.finalPrice
                            ).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group"
                      >
                        <ShoppingCartIcon className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
                      </motion.button>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center mt-3 text-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-gray-600">
                          {product.quantity > 0
                            ? `${product.quantity} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All CTA for Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 md:hidden"
        >
          <Link to="/new-arrivals">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
            >
              <span>View All New Arrivals</span>
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NewArrivals;