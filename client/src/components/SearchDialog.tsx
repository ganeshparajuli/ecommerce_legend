import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import {
  X,
  Search,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../redux/actions/productAction";
import type { RootState } from "../redux/store";
import { ProductImage } from "../utils/imageHelper";
import type { Product } from "../redux/constants/productConstants";

// Mock recent searches data - you can store this in localStorage or Redux
const getRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem("recentSearches");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (search: string) => {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((item) => item !== search);
    const updated = [search, ...filtered].slice(0, 5); // Keep only 5 recent searches
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is not available
  }
};

const clearRecentSearches = () => {
  try {
    localStorage.removeItem("recentSearches");
  } catch {
    // Silently fail if localStorage is not available
  }
};

// Props interface
interface SearchDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { products, loading } = useSelector(
    (state: RootState) => state.products
  );

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState("search");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Fetch products when dialog opens
  useEffect(() => {
    if (isOpen && (!products || products.length === 0)) {
      dispatch(getAllProducts() as any);
    }
  }, [isOpen, dispatch, products]);

  // Load recent searches when dialog opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
    }
  }, [isOpen]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim() || !products) return [];

    const query = searchQuery.toLowerCase();
    return products
      .filter(
        (product: Product) =>
          product.name?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
      )
      .slice(0, 8); // Limit to 8 results for better UX
  }, [searchQuery, products]);

  // Get trending/featured products (you can modify this logic)
  const trendingProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter((product: Product) => product.featured || Math.random() > 0.7) // Example: featured products or random selection
      .slice(0, 6);
  }, [products]);

  // Get unique categories
  const popularCategories = useMemo(() => {
    if (!products) return [];
    const categories = [
      ...new Set(products.map((p: Product) => p.category).filter(Boolean)),
    ];
    return categories.slice(0, 8);
  }, [products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (product: Product) => {
    saveRecentSearch(product.name);
    navigate(`/product/${product.id}`);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleCategoryClick = (category: string) => {
    saveRecentSearch(category);
    navigate(`/products?category=${encodeURIComponent(category)}`);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term);
    navigate(`/products?search=${encodeURIComponent(term)}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentItems =
      activeTab === "search"
        ? filteredProducts
        : activeTab === "trending"
        ? trendingProducts
        : recentSearches;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < currentItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev > 0 ? prev - 1 : currentItems.length - 1
      );
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      if (activeTab === "search" && filteredProducts[focusedIndex]) {
        handleProductClick(filteredProducts[focusedIndex]);
      } else if (activeTab === "trending" && trendingProducts[focusedIndex]) {
        handleProductClick(trendingProducts[focusedIndex]);
      } else if (activeTab === "recent" && recentSearches[focusedIndex]) {
        handleRecentSearchClick(recentSearches[focusedIndex]);
      }
    }
  };

  const clearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Update active tab based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setActiveTab("search");
    }
    setFocusedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement | null;
        searchInput?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[650px] p-0 rounded-xl overflow-hidden border-0 shadow-2xl">
        {/* <DialogTitle className="sr-only">Search Products</DialogTitle> */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900"
        >
          <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Search Products
              </h2>
              {/* <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button> */}
            </div>

            <form onSubmit={handleSearch} className="relative mt-4">
              <Input
                type="search"
                placeholder="Search for products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 transition-colors"
                  aria-label="Search"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

          {/* Tabs */}
          {!searchQuery && (
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("trending")}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "trending"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "recent"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Recent
              </button>
            </div>
          )}

          <div className="p-6 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">Loading products...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* Search Results */}
                {searchQuery && (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      Search Results ({filteredProducts.length})
                    </h3>
                    {filteredProducts.length > 0 ? (
                      <div className="space-y-2">
                        {filteredProducts.map((product, index) => (
                          <motion.button
                            key={product.id}
                            whileHover={{ x: 5 }}
                            onClick={() => handleProductClick(product)}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                              focusedIndex === index
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {product.image && (
                              <ProductImage
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/api/placeholder/40/40";
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{product.category}</span>
                                {product.brand && (
                                  <>
                                    <span>•</span>
                                    <span>{product.brand}</span>
                                  </>
                                )}
                                {product.finalPrice && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      ${product.finalPrice}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No products found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Trending Products */}
                {!searchQuery && activeTab === "trending" && (
                  <motion.div
                    key="trending"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      Trending Products
                    </h3>
                    <div className="space-y-2 mb-6">
                      {trendingProducts.map((product, index) => (
                        <motion.button
                          key={product.id}
                          whileHover={{ x: 5 }}
                          onClick={() => handleProductClick(product)}
                          className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                            focusedIndex === index
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {product.image && (
                            <ProductImage
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-md"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/api/placeholder/40/40";
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {product.category}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </motion.button>
                      ))}
                    </div>

                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-6 mb-3">
                      Popular Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {popularCategories.map((category) => (
                        <motion.button
                          key={category}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCategoryClick(category)}
                          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-800 dark:text-gray-200"
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recent Searches */}
                {!searchQuery && activeTab === "recent" && (
                  <motion.div
                    key="recent"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Recent Searches
                      </h3>
                      {recentSearches.length > 0 && (
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={clearRecent}
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {recentSearches.length > 0 ? (
                      <div className="space-y-2">
                        {recentSearches.map((term, index) => (
                          <motion.button
                            key={term}
                            whileHover={{ x: 5 }}
                            onClick={() => handleRecentSearchClick(term)}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                              focusedIndex === index
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900 dark:text-white">
                                {term}
                              </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No recent searches
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 mr-1">
                  ↑
                </kbd>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400">
                  ↓
                </kbd>
                <span className="ml-2">to navigate</span>
              </div>

              <div className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400">
                  Enter
                </kbd>
                <span className="ml-2">to select</span>
              </div>
            </div>

            <div>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400">
                Esc
              </kbd>
              <span className="ml-2">to close</span>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
