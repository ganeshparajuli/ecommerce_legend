import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

import {
  ShoppingCart,
  Filter,
  X,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Star,
  Heart,
  Eye,
  ChevronDown,
  Menu,
  User,
  Home,
  ChevronRight,
  RefreshCw,
  Package,
  TrendingUp,
  Zap,
  Shield,
  Truck,
  Sparkles,
  Crown,
  Gift,
  Tag,
  ArrowUp,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  Flame,
} from "lucide-react";
import type { RootState } from "../../redux/store";
import { getAllProducts } from "../../redux/actions/productAction";
import { addToCart } from "../../redux/actions/cartAction";
import { ProductImage, getImageUrl } from "../../utils/imageHelper";
// Import the existing navbar component from homepage
import NavbarSection, {
  Breadcrumb,
} from "../Homepage/sections/NavbarSection/NavbarSection";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlistActions";
import FooterSection from "../Homepage/sections/FooterSection/FooterSection";
import { formatPrice } from "@/utils/formatPrice";

// Utility functions
const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

import type { Product } from "../../redux/constants/productConstants";

// Helper functions
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

// Featured Products Carousel Component
const FeaturedCarousel: React.FC<{ products: Product[] }> = ({ products }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const dispatch = useDispatch();

  const featuredProducts = products
    .filter((p) => p.category === "featured" || Math.random() > 0.7)
    .slice(0, 5);

  const toggleWishlist = (productId: string) => {
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your wishlist");
      return;
    }

    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

    const isAdding = !wishlist.includes(productId);
    if (isAdding) {
      dispatch(addToWishlist(productId) as any);
    } else {
      dispatch(removeFromWishlist(productId) as any);
    }

    toast.success(
      isAdding ? "💖 Added to wishlist!" : "💔 Removed from wishlist"
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length
    );
  };

  useEffect(() => {
    if (featuredProducts.length > 1) {
      // const interval = setInterval(nextSlide, 4000);
      // return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  if (!featuredProducts.length) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl overflow-hidden mb-6">
      <div className="relative h-48 sm:h-64 md:h-80 max-md:h-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* Content Side */}
              <div className="flex flex-col justify-center p-6 md:p-8 text-white">
                <div className="flex items-center mb-2">
                  <Flame className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">
                    FEATURED PRODUCT
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-3">
                  {featuredProducts[currentSlide]?.name}
                </h2>
                <p className="text-sm md:text-base opacity-90 mb-4 line-clamp-2">
                  {featuredProducts[currentSlide]?.description ||
                    "Premium quality product with exceptional features and outstanding performance."}
                </p>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-2xl md:text-3xl font-bold">
                    {formatPrice(featuredProducts[currentSlide]?.finalPrice)}
                  </span>
                  {getPriceAsNumber(
                    featuredProducts[currentSlide]?.actualPrice
                  ) >
                    getPriceAsNumber(
                      featuredProducts[currentSlide]?.finalPrice
                    ) && (
                    <span className="text-lg text-red-200 line-through">
                      {formatPrice(featuredProducts[currentSlide]?.actualPrice)}
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Link
                    to={`/product/${featuredProducts[currentSlide]?.id}`}
                    className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    View Product
                  </Link>
                  <button
                    onClick={() =>
                      toggleWishlist(featuredProducts[currentSlide]?.id)
                    }
                    className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlist.includes(featuredProducts[currentSlide]?.id)
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Image Side */}
              <div className="relative hidden md:flex items-center justify-center  md:w-[290px] md:h-[290px] p-4">
                <ProductImage
                  src={
                    Array.isArray(featuredProducts[currentSlide]?.image)
                      ? featuredProducts[currentSlide]?.image[0]
                      : featuredProducts[currentSlide]?.image
                  }
                  alt={featuredProducts[currentSlide]?.name}
                  className="max-w-full max-h-full object-contain"
                  fallbackUrl="/placeholder.jpg"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {featuredProducts.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {featuredProducts.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Joy Store Products Component
const JoyStoreProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const category = searchParams.get("category") || categorySlug || "";
  const brand = searchParams.get("brand") || "";
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [wishlist, setWishlist] = useState<string[]>([]);

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [minMaxPrices, setMinMaxPrices] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 1000 });

  // Redux state
  const {
    products = [],
    loading,
    error: reduxError,
  } = useSelector((state: RootState) => state.products);
  const { error: cartError } = useSelector((state: RootState) => state.cart);

  const displayProducts = products.length > 0 ? products : [];

  // Fetch products
  useEffect(() => {
    dispatch(getAllProducts() as any);

    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log("Products loading timeout reached, using fallback data");
      }
    }, 5000);

    return () => clearTimeout(loadingTimeout);
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      console.log("Products received:", products.length);
      console.log(
        "Sample product data:",
        products.slice(0, 2).map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image,
          imageType: typeof p.image,
          isArray: Array.isArray(p.image),
          brand: p.brand,
        }))
      );
    }
  }, [products]);

  // Extract categories and price ranges
  useEffect(() => {
    if (displayProducts && displayProducts.length > 0) {
      const categories = [
        ...new Set(displayProducts.map((p) => p.category)),
      ].filter(Boolean);
      setAvailableCategories(categories);

      const prices = displayProducts
        .map((p) => getPriceAsNumber(p.finalPrice || p.actualPrice))
        .filter((p) => !isNaN(p) && p > 0);

      if (prices.length > 0) {
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setMinMaxPrices({ min, max });
        setPriceRange({ min, max });
      }

      if (category) {
        const urlCategory = category.toLowerCase().replace(/-/g, " ");
        const matchingCategories = categories.filter(
          (cat) =>
            cat.toLowerCase().includes(urlCategory) ||
            urlCategory.includes(cat.toLowerCase())
        );
        setSelectedCategories(matchingCategories);
      }
    }
  }, [displayProducts, category]);

  // Filter and sort products
  useEffect(() => {
    if (!displayProducts || displayProducts.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...displayProducts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Brand filter
    if (brand) {
      filtered = filtered.filter((product) => {
        const productBrand = product.brand?.toLowerCase() || "";
        const urlBrand = brand.toLowerCase();

        const exactMatch = productBrand === urlBrand;
        const containsMatch =
          productBrand.includes(urlBrand) || urlBrand.includes(productBrand);

        return exactMatch || containsMatch;
      });
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    } else if (category) {
      filtered = filtered.filter((product) => {
        const productCategory = product.category?.toLowerCase();
        const urlCategory = category.toLowerCase().replace(/-/g, " ");
        return (
          productCategory?.includes(urlCategory) ||
          urlCategory.includes(productCategory || "")
        );
      });
    }

    // Price filter
    filtered = filtered.filter((product) => {
      const price = getPriceAsNumber(product.finalPrice || product.actualPrice);
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (
            getPriceAsNumber(a.finalPrice || a.actualPrice) -
            getPriceAsNumber(b.finalPrice || b.actualPrice)
          );
        case "price-high":
          return (
            getPriceAsNumber(b.finalPrice || b.actualPrice) -
            getPriceAsNumber(a.finalPrice || a.actualPrice)
          );
        case "featured":
          return Math.random() - 0.5;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [
    searchQuery,
    category,
    brand,
    displayProducts,
    selectedCategories,
    priceRange,
    sortBy,
  ]);

  // Handle functions
  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((c) => c !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handlePriceChange = (type: "min" | "max", value: number) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleAddToCart = (product: Product) => {
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your cart");
      return;
    }

    // Products with more than one variant need the customer to choose one on the PDP -
    // adding directly from the grid would silently pick a variant on their behalf.
    if (product.variants.length > 1) {
      navigate(`/products/${product.id}`);
      return;
    }

    const variantId = product.defaultVariant?.id;
    if (!variantId) {
      toast.error("This product is not available right now.");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

    try {
      dispatch(addToCart(variantId, 1) as any);
      toast.success(
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-800">{product.name}</div>
            <div className="text-sm text-gray-600">Added to your cart!</div>
          </div>
        </div>
      );
    } catch (error) {
      toast.error(`Failed to add ${product.name} to cart.`);
    } finally {
      setTimeout(() => {
        setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
      }, 600);
    }
  };

  const toggleWishlist = (productId: string) => {
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your wishlist");
      return;
    }

    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

    const isAdding = !wishlist.includes(productId);

    if (isAdding) {
      dispatch(addToWishlist(productId) as any);
    } else {
      dispatch(removeFromWishlist(productId) as any);
    }

    toast.success(
      isAdding ? "💖 Added to wishlist!" : "💔 Removed from wishlist"
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange(minMaxPrices);
    setSortBy("featured");
  };

  const getBreadcrumbItems = () => {
    const items = [{ name: "Home", href: "/", current: false }];

    if (brand) {
      items.push({
        name: "Products",
        href: "/products",
        current: false,
      });
      items.push({
        name: brand.charAt(0).toUpperCase() + brand.slice(1) + " Products",
        href: `/products?brand=${brand}`,
        current: true,
      });
    } else if (category) {
      items.push({
        name: "Products",
        href: "/products",
        current: false,
      });
      items.push({
        name:
          category.charAt(0).toUpperCase() +
          category.slice(1).replace(/-/g, " "),
        href: `/products/${category}`,
        current: true,
      });
    } else {
      items.push({ name: "Products", href: "/products", current: true });
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative mt-20 lg:mt-24">
      {/* Use existing Navbar from Homepage */}
      <NavbarSection />

      {/* Toast Container */}
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

      {/* Main Content */}
      <div className="pt-4 px-4 lg:px-8 relative z-10 mb-20 max-lg:mt-16 max-lg:pt-0">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb and Back Button */}
          <div className="flex justify-between items-center mb-4">
            <Breadcrumb items={getBreadcrumbItems()} />
            <Link
              to="/products"
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
            >
              Back
            </Link>
          </div>

          {/* Featured Products Carousel */}
          <FeaturedCarousel products={displayProducts} />

          {/* Compact Header Section */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex-1 mb-4 lg:mb-0">
                <div className="flex items-center mb-2">
                  <Package className="w-5 h-5 text-red-500 mr-2" />
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                    {brand
                      ? `${
                          brand.charAt(0).toUpperCase() + brand.slice(1)
                        } Products`
                      : category
                      ? `${
                          category.charAt(0).toUpperCase() +
                          category.slice(1).replace(/-/g, " ")
                        }`
                      : "Premium Collection"}
                  </h1>
                </div>
                <p className="text-gray-600 text-sm">
                  {loading
                    ? "Loading products..."
                    : `${filteredProducts.length} premium products curated for you`}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Truck className="w-3 h-3 mr-1" />
                    Free shipping NPR 50,000+
                  </span>
                  <span className="flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    100% Authentic
                  </span>
                </div>
              </div>

              {/* Controls - More Compact */}
              <div className="flex items-center space-x-3 w-full lg:w-auto">
                {/* Sort Dropdown */}
                <div className="relative flex-1 lg:flex-initial">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full"
                  >
                    <option value="featured">✨ Featured</option>
                    <option value="name">📝 A-Z</option>
                    <option value="price-low">💰 Low to High</option>
                    <option value="price-high">💎 High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-all ${
                      viewMode === "grid"
                        ? "bg-red-600 text-white"
                        : "text-gray-500 hover:text-red-400"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-all ${
                      viewMode === "list"
                        ? "bg-red-600 text-white"
                        : "text-gray-500 hover:text-red-400"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all text-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {reduxError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-6 rounded-lg text-sm">
              {typeof reduxError === "string"
                ? reduxError
                : "Error loading products"}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Compact Filters Sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="lg:col-span-1 order-2 lg:order-1"
                >
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 sticky top-32">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <SlidersHorizontal className="w-4 h-4 mr-2 text-red-500" />
                        Filters
                      </h2>
                      <button
                        onClick={resetFilters}
                        className="text-xs text-red-600 hover:text-red-500 font-medium bg-red-50 px-2 py-1 rounded-lg"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Categories */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold mb-3 text-gray-700">
                        Categories
                      </h3>
                      <div className="space-y-2">
                        {availableCategories.map((cat) => (
                          <div key={cat} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`cat-${cat}`}
                              checked={selectedCategories.includes(cat)}
                              onChange={() => handleCategoryChange(cat)}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`cat-${cat}`}
                              className="ml-2 text-sm text-gray-700 cursor-pointer"
                            >
                              {cat}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-gray-700">
                        Price Range
                      </h3>
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              Min (NPR)
                            </label>
                            <input
                              type="number"
                              value={priceRange.min}
                              onChange={(e) =>
                                handlePriceChange("min", Number(e.target.value))
                              }
                              className="w-full p-2 border border-gray-300 rounded text-xs"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              Max (NPR)
                            </label>
                            <input
                              type="number"
                              value={priceRange.max}
                              onChange={(e) =>
                                handlePriceChange("max", Number(e.target.value))
                              }
                              className="w-full p-2 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </div>
                        <input
                          type="range"
                          min={minMaxPrices.min}
                          max={minMaxPrices.max}
                          value={priceRange.max}
                          onChange={(e) =>
                            handlePriceChange("max", Number(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>NPR {minMaxPrices.min}</span>
                          <span>NPR {minMaxPrices.max}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Grid/List */}
            <div
              className={`${
                showFilters ? "lg:col-span-3" : "lg:col-span-4"
              } order-1 lg:order-2`}
            >
              {loading && displayProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 border-4 border-t-red-500 border-gray-200 rounded-full mb-4"
                  />
                  <p className="text-gray-600 text-sm">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
                  <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {brand
                      ? `No products found for brand "${brand}"`
                      : "Try adjusting your filters"}
                  </p>
                  {!reduxError && displayProducts.length > 0 && (
                    <button
                      onClick={resetFilters}
                      className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden border border-gray-200 group transition-all duration-300 ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      {/* Product Image */}
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list"
                            ? "w-48 h-48 flex-shrink-0"
                            : "h-48"
                        }`}
                      >
                        <Link
                          to={`/product/${product.id}`}
                          className="block h-full"
                        >
                          <ProductImage
                            src={
                              Array.isArray(product.image)
                                ? product.image[0]
                                : product.image
                            }
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            fallbackUrl="/placeholder.jpg"
                          />
                        </Link>

                        {/* Discount Badge */}
                        {calculateDiscount(
                          product.actualPrice,
                          product.finalPrice
                        ) > 0 && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -
                            {calculateDiscount(
                              product.actualPrice,
                              product.finalPrice
                            )}
                            % OFF
                          </div>
                        )}

                        {/* Premium Badge */}
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <Crown className="w-3 h-3 mr-1" />
                          PREMIUM
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute bottom-2 right-2 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(product.id);
                            }}
                            className={`p-2 rounded-full shadow-lg transition-all ${
                              wishlist.includes(product.id)
                                ? "bg-red-600 text-white"
                                : "bg-white text-gray-600 hover:text-red-400"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                wishlist.includes(product.id)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          </button>
                          <Link to={`/product/${product.id}`}>
                            <button className="p-2 bg-white text-gray-600 hover:text-blue-400 rounded-full shadow-lg transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div
                        className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}
                      >
                        <Link to={`/product/${product.id}`}>
                          <h3 className="text-base font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {product.description ||
                            "Premium quality product with exceptional features."}
                        </p>

                        {/* Price and Rating */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-red-600">
                              {formatPrice(
                                product.finalPrice || product.actualPrice
                              )}
                            </span>
                            {getPriceAsNumber(product.actualPrice) >
                              getPriceAsNumber(product.finalPrice) && (
                              <span className="text-gray-400 line-through text-sm">
                                {formatPrice(product.actualPrice)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (product.rating || 4)
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() =>
                            !addingToCart[product.id] &&
                            handleAddToCart(product)
                          }
                          disabled={addingToCart[product.id]}
                          className={`w-full bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center text-sm ${
                            addingToCart[product.id]
                              ? "cursor-not-allowed opacity-70"
                              : ""
                          }`}
                        >
                          {addingToCart[product.id] ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-4 h-4 border-2 border-t-white border-transparent rounded-full mr-2"
                              />
                              Adding...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {product.variants.length > 1 ? "View Options" : "Add to Cart"}
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-black hover:bg-gray-800 text-white rounded-full p-3 shadow-2xl transition-all z-50"
        title="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default JoyStoreProducts;
