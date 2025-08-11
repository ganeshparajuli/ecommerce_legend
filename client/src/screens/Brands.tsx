import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  SearchIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  TrendingUpIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
  SortAscIcon,
  SortDescIcon,
  StarIcon,
  TagIcon,
} from "lucide-react";

import { getAllBrands } from "../redux/actions/brandAction";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { RootState } from "../redux/store";
import type { Brand } from "../redux/constants/brandConstants";
import { BrandImage } from "../utils/imageHelper";

// PageLayout and Breadcrumb components - adjust path as needed
import { PageLayout, Breadcrumb } from "../screens/Homepage/sections/NavbarSection/NavbarSection";
// Alternative import if the above doesn't work:
// import PageLayout from "../components/Layout/PageLayout";
// import Breadcrumb from "../components/UI/Breadcrumb";

const Brands = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const brands = useAppSelector(
    (state: RootState) => state.brand.brands
  );
  const loading = useAppSelector((state: RootState) => state.brand.loading);
  const reduxError = useAppSelector((state: RootState) => state.brand.error);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "products">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  // Computed values
  const isLoading = loading || (!brands && !reduxError);
  const hasBrands = Array.isArray(brands) && brands.length > 0;

  // Process brands with proper routing (same as navbar pattern)
  const processedBrands = hasBrands
    ? brands.map((brand) => ({
        ...brand,
        // Use same routing pattern as navbar
        link: `/products?brand=${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-')}`,
        count: brand.productsCount || Math.floor(Math.random() * 300) + 20, // Mock product count if not available
      }))
    : [];

  // Filter and sort brands
  const filteredBrands = processedBrands
    .filter((brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a.count - b.count;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  // Fetch brands on mount
  useEffect(() => {
    console.log("🏷️ Brands Page: Component mounted", {
      hasBrands,
      brandsLength: brands?.length || 0,
      loading,
      reduxError,
    });

    if (!hasBrands && !loading) {
      console.log("🏷️ Brands Page: Fetching brands...");
      dispatch(getAllBrands());
    }
  }, [dispatch, hasBrands, loading]);

  // Handle sort change
  const handleSortChange = (newSortBy: "name" | "products") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "All Brands", href: "/brands", current: true },
  ];

  // Featured brands (could be based on popularity or featured flag)
  const featuredBrands = filteredBrands.slice(0, 4);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Loading Brands...
              </h1>
              <p className="text-gray-600 text-lg">
                Discovering all available brands
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (reduxError || (!hasBrands && !loading)) {
    return (
      <PageLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 max-w-md mx-auto border border-blue-100 text-center"
          >
            <div className="text-6xl mb-6">🏷️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {reduxError ? "Failed to Load Brands" : "No Brands Found"}
            </h2>
            <p className="text-gray-600 mb-8">
              {reduxError
                ? "There was an error loading brands. Please try again."
                : "We're working on adding new brands. Please check back soon!"}
            </p>
            <div className="space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(getAllBrands())}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Try Again
              </motion.button>
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Browse Products
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <TagIcon className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-blue-600 font-semibold text-lg">
                Browse Brands
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All Brands
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover products from the world's leading brands. Quality, innovation, 
              and trust from {filteredBrands.length} premium brands.
            </p>
          </motion.div>

          {/* Featured Brands */}
          {featuredBrands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Featured Brands
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredBrands.map((brand, index) => (
                  <motion.div
                    key={brand._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="group"
                  >
                    <Link to={brand.link}>
                      <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
                        <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          <BrandImage
                            src={brand.image}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain p-2"
                            fallbackText={brand.name.charAt(0)}
                            onError={(error) => {
                              console.error(`❌ Brand image failed to load for ${brand.name}:`, error);
                            }}
                          />
                        </div>
                        <h3 className="text-center text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {brand.name}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-gray-200 shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Sort by:</span>
                  <button
                    onClick={() => handleSortChange("name")}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                      sortBy === "name"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Name
                    {sortBy === "name" &&
                      (sortOrder === "asc" ? (
                        <SortAscIcon className="w-4 h-4" />
                      ) : (
                        <SortDescIcon className="w-4 h-4" />
                      ))}
                  </button>
                  <button
                    onClick={() => handleSortChange("products")}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                      sortBy === "products"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Products
                    {sortBy === "products" &&
                      (sortOrder === "asc" ? (
                        <SortAscIcon className="w-4 h-4" />
                      ) : (
                        <SortDescIcon className="w-4 h-4" />
                      ))}
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <GridIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <ListIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredBrands.length} of {processedBrands.length}{" "}
              brands
              {searchTerm && (
                <span className="ml-2 text-blue-600">
                  for "{searchTerm}"
                </span>
              )}
            </div>
          </motion.div>

          {/* Brands Grid/List */}
          <AnimatePresence mode="wait" key={viewMode}>
            {viewMode === "grid" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredBrands.map((brand, index) => (
                  <motion.div
                    key={brand._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                    onMouseEnter={() => setHoveredBrand(brand._id)}
                    onMouseLeave={() => setHoveredBrand(null)}
                  >
                    <Link to={brand.link}>
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200 h-full relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                          <BrandImage
                            src={brand.image}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                            fallbackText={brand.name.charAt(0)}
                            onError={(error) => {
                              console.error(`❌ Brand image failed to load for ${brand.name}:`, error);
                            }}
                          />

                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: hoveredBrand === brand._id ? 1 : 0,
                              scale: hoveredBrand === brand._id ? 1 : 0,
                            }}
                            className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-2 shadow-lg"
                          >
                            <ShoppingBagIcon className="w-4 h-4" />
                          </motion.div>
                        </div>

                        <div className="text-center relative z-10">
                          <h3 className="text-gray-900 font-semibold text-xl mb-2 group-hover:text-blue-700 transition-colors">
                            {brand.name}
                          </h3>
                          <p className="text-gray-500 text-sm mb-4">
                            {brand.count} products available
                          </p>

                          {brand.description && (
                            <p className="text-gray-600 text-xs mb-4 line-clamp-2">
                              {brand.description}
                            </p>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: hoveredBrand === brand._id ? 1 : 0,
                              y: hoveredBrand === brand._id ? 0 : 10,
                            }}
                            className="mt-4"
                          >
                            <span className="inline-flex items-center text-blue-600 font-medium">
                              Explore Products
                              <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </motion.div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {filteredBrands.map((brand, index) => (
                  <motion.div
                    key={brand._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Link to={brand.link}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200 flex items-center"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mr-6 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <BrandImage
                            src={brand.image}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                            fallbackText={brand.name.charAt(0)}
                            onError={(error) => {
                              console.error(`❌ Brand image failed to load for ${brand.name}:`, error);
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-gray-900 font-semibold text-xl mb-2 group-hover:text-blue-700 transition-colors">
                            {brand.name}
                          </h3>
                          <p className="text-gray-500 mb-1">
                            {brand.count} products available
                          </p>
                          {brand.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {brand.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center text-blue-600 font-medium ml-4">
                          <span className="mr-2">Explore</span>
                          <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Results */}
          {filteredBrands.length === 0 && searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No brands found
              </h3>
              <p className="text-gray-600 mb-6">
                No brands match your search "{searchTerm}". Try different
                keywords.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Clear Search
              </button>
            </motion.div>
          )}

          {/* Back to Products */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
              >
                <span>Browse All Products</span>
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Brands;