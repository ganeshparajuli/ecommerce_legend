import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAllCategories } from "../../../../redux/actions/categoryAction";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import type { RootState } from "../../../../redux/store";
import type { Category } from "../../../../redux/constants/categoryConstants";

export const PopularCategories = () => {
  const dispatch = useAppDispatch();

  // FIXED: Get categories from Redux state with better selectors
  const categories = useAppSelector(
    (state: RootState) => state.category.categories
  );
  const loading = useAppSelector((state: RootState) => state.category.loading);
  const reduxError = useAppSelector((state: RootState) => state.category.error);

  // SIMPLIFIED: Remove redundant local state
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const scrollContainer = useRef<HTMLDivElement>(null);

  // FIXED: Simplified loading logic
  const isLoading = loading || (!categories && !reduxError);
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  // Process category data to ensure they have links
  const processedCategories = hasCategories
    ? categories.map((category, index) => ({
        ...category,
        link:
          category.link ||
          `/products/category/${
            category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
          }`,
        count: Math.floor(Math.random() * 500) + 50, // Mock product count for demo
      }))
    : [];

  // FIXED: Simplified useEffect for fetching categories
  useEffect(() => {
    console.log("🏪 PopularCategories: Component mounted", {
      hasCategories,
      categoriesLength: categories?.length || 0,
      loading,
      reduxError,
    });

    // Only fetch if we don't have categories and aren't already loading
    if (!hasCategories && !loading) {
      console.log("🏪 PopularCategories: Fetching categories...");
      dispatch(getAllCategories());
    }
  }, [dispatch, hasCategories, loading]);

  // FIXED: Debug useEffect to track state changes
  useEffect(() => {
    console.log("🏪 PopularCategories: State changed", {
      hasCategories,
      categoriesLength: categories?.length || 0,
      loading,
      reduxError,
      processedCategoriesLength: processedCategories.length,
    });
  }, [categories, loading, reduxError, hasCategories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainer.current) {
      const { current } = scrollContainer;
      const isMobile = window.innerWidth < 640;
      const scrollAmount = direction === "left" ? -(isMobile ? 150 : 300) : (isMobile ? 150 : 300);
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // FIXED: Enhanced loading state
  if (isLoading) {
    return (
      <section className="relative py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-gray-50 via-white to-red-50 overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Loading Categories...
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto px-2">
              Discovering our most loved product categories
            </p>
          </motion.div>

          <div className="flex justify-center">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-full max-w-[100px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px] group mx-auto"
                >
                  <div className="relative bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-3 animate-pulse"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded mx-auto animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // FIXED: Enhanced error state
  if (reduxError || (!hasCategories && !loading)) {
    return (
      <section className="relative py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-gray-50 via-white to-red-50 overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/80 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-sm mx-auto border border-red-100"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">🏪</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                {reduxError
                  ? "Failed to Load Categories"
                  : "No Categories Found"}
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
                {reduxError
                  ? "There was an error loading categories. Please try again."
                  : "We're working on adding new categories. Please check back soon!"}
              </p>
              <div className="flex flex-col gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch(getAllCategories())}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                >
                  Try Again
                </motion.button>
                <Link to="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                  >
                    Browse Products
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-gray-50 via-white to-red-50 overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12"
        >
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <TrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-600 mr-2" />
            <span className="text-red-600 font-semibold text-xs sm:text-sm md:text-base">
              Shop by Category
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Popular Categories
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-2">
            Discover our most loved product categories, curated for the best
            shopping experience ({processedCategories.length} categories
            available)
          </p>
        </motion.div>

        {/* Categories Grid/Carousel */}
        <div className="relative">
          {/* Navigation Buttons - Hidden on small screens */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("left")}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md hover:bg-white shadow-lg hover:shadow-xl rounded-full p-2 border border-gray-200 transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("right")}
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md hover:bg-white shadow-lg hover:shadow-xl rounded-full p-2 border border-gray-200 transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </motion.button>

          {/* Categories Container */}
          <div
            ref={scrollContainer}
            className="flex overflow-x-auto scrollbar-hide space-x-2 sm:space-x-3 md:space-x-4 px-1 sm:px-2 md:px-8 py-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {processedCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-none w-24 xs:w-28 sm:w-32 md:w-36 lg:w-40 group"
                style={{ scrollSnapAlign: "start" }}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link to={category.link} className="block">
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="relative bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-red-200"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category Image */}
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-3 overflow-hidden">
                      <motion.img
                        src={category.image || "/category-placeholder.jpg"}
                        alt={category.name}
                        className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 2 }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/category-placeholder.jpg";
                        }}
                      />

                      {/* Floating icon */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: hoveredCategory === category.id ? 1 : 0,
                          scale: hoveredCategory === category.id ? 1 : 0,
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-lg"
                      >
                        <ShoppingBagIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                      </motion.div>
                    </div>

                    {/* Category Info */}
                    <div className="text-center relative z-10">
                      <h3 className="text-gray-900 font-semibold text-xs sm:text-sm md:text-base mb-1 group-hover:text-red-700 transition-colors line-clamp-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-1 sm:mb-2">
                        {category.count} items
                      </p>

                      {/* CTA Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{
                          opacity: hoveredCategory === category.id ? 1 : 0,
                          y: hoveredCategory === category.id ? 0 : 5,
                        }}
                        className="mt-1 sm:mt-2"
                      >
                        <span className="inline-flex items-center text-red-600 font-medium text-xs">
                          Shop Now
                          <ChevronRightIcon className="w-2 h-2 sm:w-3 sm:h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-red-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Categories CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-6 sm:mt-8 md:mt-10"
        >
          <Link to="/categories">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center text-xs sm:text-sm md:text-base"
            >
              <span>View All Categories ({processedCategories.length})</span>
              <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularCategories;