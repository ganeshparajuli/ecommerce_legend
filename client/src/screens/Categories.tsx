import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAllCategories } from "../redux/actions/categoryAction";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { RootState } from "../redux/store";
import type { Category } from "../redux/constants/categoryConstants";
import { PageLayout, Breadcrumb } from "../screens/Homepage/sections/NavbarSection/NavbarSection";

const Categories = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const categories = useAppSelector(
    (state: RootState) => state.category.categories
  );
  const loading = useAppSelector((state: RootState) => state.category.loading);
  const reduxError = useAppSelector((state: RootState) => state.category.error);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "products">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // Computed values
  const isLoading = loading || (!categories && !reduxError);
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  // Process categories with mock data for demo
  const processedCategories = hasCategories
    ? categories.map((category) => ({
        ...category,
        link:
          category.link ||
          `/products/category/${
            category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
          }`,
        count: Math.floor(Math.random() * 500) + 50, // Mock product count
      }))
    : [];

  // Filter and sort categories
  const filteredCategories = processedCategories
    .filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Fetch categories on mount
  useEffect(() => {
    if (!hasCategories && !loading) {
      dispatch(getAllCategories());
    }
  }, [dispatch, hasCategories, loading]);

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
    { name: "All Categories", href: "/categories", current: true },
  ];

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Loading Categories...
              </h1>
              <p className="text-gray-600 text-lg">
                Discovering all available categories
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
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 animate-pulse"></div>
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
  if (reduxError || (!hasCategories && !loading)) {
    return (
      <PageLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 max-w-md mx-auto border border-red-100 text-center"
          >
            <div className="text-6xl mb-6">🏪</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {reduxError ? "Failed to Load Categories" : "No Categories Found"}
            </h2>
            <p className="text-gray-600 mb-8">
              {reduxError
                ? "There was an error loading categories. Please try again."
                : "We're working on adding new categories. Please check back soon!"}
            </p>
            <div className="space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(getAllCategories())}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <TrendingUpIcon className="w-8 h-8 text-red-600 mr-3" />
              <span className="text-red-600 font-semibold text-lg">
                Browse Categories
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All Categories
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our complete collection of product categories. Find exactly
              what you're looking for with {filteredCategories.length} categories
              to choose from.
            </p>
          </motion.div>

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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
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
                        ? "bg-red-100 text-red-700"
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
                        ? "bg-red-100 text-red-700"
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
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <GridIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-white text-red-600 shadow-sm"
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
              Showing {filteredCategories.length} of {processedCategories.length}{" "}
              categories
              {searchTerm && (
                <span className="ml-2 text-red-600">
                  for "{searchTerm}"
                </span>
              )}
            </div>
          </motion.div>

          {/* Categories Grid/List */}
          <AnimatePresence mode="wait" key={viewMode}>
            {viewMode === "grid" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link to={category.link}>
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-red-200 h-full"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden">
                          <motion.img
                            src={category.image || "/category-placeholder.jpg"}
                            alt={category.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: 2 }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/category-placeholder.jpg";
                            }}
                          />

                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: hoveredCategory === category.id ? 1 : 0,
                              scale: hoveredCategory === category.id ? 1 : 0,
                            }}
                            className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-2 shadow-lg"
                          >
                            <ShoppingBagIcon className="w-4 h-4" />
                          </motion.div>
                        </div>

                        <div className="text-center relative z-10">
                          <h3 className="text-gray-900 font-semibold text-xl mb-2 group-hover:text-red-700 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-gray-500 text-sm mb-4">
                            {category.count} products available
                          </p>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: hoveredCategory === category.id ? 1 : 0,
                              y: hoveredCategory === category.id ? 0 : 10,
                            }}
                            className="mt-4"
                          >
                            <span className="inline-flex items-center text-red-600 font-medium">
                              Shop Now
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
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Link to={category.link}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-red-200 flex items-center"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mr-6 overflow-hidden flex-shrink-0">
                          <img
                            src={category.image || "/category-placeholder.jpg"}
                            alt={category.name}
                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/category-placeholder.jpg";
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-gray-900 font-semibold text-xl mb-2 group-hover:text-red-700 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-gray-500">
                            {category.count} products available
                          </p>
                        </div>

                        <div className="flex items-center text-red-600 font-medium ml-4">
                          <span className="mr-2">Shop Now</span>
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
          {filteredCategories.length === 0 && searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-600 mb-6">
                No categories match your search "{searchTerm}". Try different
                keywords.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
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

export default Categories;