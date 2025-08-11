import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Grid,
  List,
  Search,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  NavbarSection,
  Breadcrumb,
} from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import { useDispatch, useSelector } from "react-redux";
import {
  getWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlistActions";
import { addToCart } from "../../redux/actions/cartAction";
import { toast } from "react-hot-toast";
// import type { WishlistItem } from "../../redux/constants/wishlistConstants";
import { ProductImage } from "../../utils/imageHelper";

interface DisplayWishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  addedAt: string;
  availability: "in-stock" | "out-of-stock" | "low-stock";
}

// Create stable selector functions to prevent unnecessary re-renders
const selectUserState = (state: any) => state.user || {};
const selectWishlistState = (state: any) => state.wishlist || {};

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Ref to prevent multiple API calls on component mount
  const isInitialMount = useRef(true);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [localError, setLocalError] = useState("");

  // Use stable selectors
  const userState = useSelector(selectUserState);
  const wishlistState = useSelector(selectWishlistState);

  // Memoize derived values to prevent unnecessary re-renders
  const isAuthenticated = useMemo(
    () => !!userState.isAuthenticated,
    [userState.isAuthenticated]
  );
  const user = useMemo(() => userState.user || null, [userState.user]);

  const wishlist = useMemo(() => {
    // Handle different possible state structures more thoroughly
    let items = [];

    // Check all possible locations where the data might be stored
    if (Array.isArray(wishlistState.wishlist)) {
      items = wishlistState.wishlist;
    } else if (Array.isArray(wishlistState.items)) {
      items = wishlistState.items;
    } else if (Array.isArray(wishlistState.data)) {
      items = wishlistState.data;
    } else if (wishlistState.data && typeof wishlistState.data === "object") {
      // Handle API response structure: {success: true, count: 1, data: [...]}
      if (Array.isArray(wishlistState.data.data)) {
        items = wishlistState.data.data;
      } else if (Array.isArray(wishlistState.data.items)) {
        items = wishlistState.data.items;
      }
    }

    return items;
  }, [wishlistState]);

  const loading = useMemo(
    () => !!wishlistState.loading,
    [wishlistState.loading]
  );
  const error = useMemo(
    () => wishlistState.error || null,
    [wishlistState.error]
  );
  const success = useMemo(
    () => !!wishlistState.success,
    [wishlistState.success]
  );
  const wishlistFetched = useMemo(
    () => !!wishlistState.wishlistFetched,
    [wishlistState.wishlistFetched]
  );

  useEffect(() => {
    console.log("🔍 REDUX STATE DEBUG:", {
      wishlistState: wishlistState,
      wishlist: wishlist,
      loading: loading,
      wishlistFetched: wishlistFetched,
    });
  }, [wishlistState, wishlist, loading, wishlistFetched]);

  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isInitialMount.current = false;
    };
  }, []);

  // SUPER SIMPLE FIX: Only fetch once on mount if authenticated
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/wishlist" } });
      return;
    }

    // Only fetch once on initial mount
    if (isInitialMount.current && isAuthenticated && !loading) {
      console.log("🔄 Fetching wishlist - one time on mount");
      dispatch(getWishlist() as any);
      isInitialMount.current = false;
    }
  }, [isAuthenticated, navigate, dispatch, loading]);

  // Transform wishlist data with memoization for better performance
  const displayItems = useMemo(() => {
    if (!Array.isArray(wishlist)) {
      return [];
    }

    console.log("🔍 RAW WISHLIST DATA:", wishlist);

    return wishlist.map((item: any, index: number): DisplayWishlistItem => {
      console.log(`🔍 WISHLIST ITEM ${index}:`, item);

      // More comprehensive category extraction
      let productCategory = "Uncategorized";

      // Check all possible category locations
      if (item.category) {
        productCategory =
          typeof item.category === "string"
            ? item.category
            : item.category.name || "Uncategorized";
      } else if (item.product_category) {
        productCategory = item.product_category;
      } else if (item.product?.category) {
        if (typeof item.product.category === "string") {
          productCategory = item.product.category;
        } else if (item.product.category?.name) {
          productCategory = item.product.category.name;
        }
      }

      // Extract other fields
      const productName =
        item.product_name ||
        item.product?.name ||
        item.name ||
        "Unknown Product";

      console.log(`🔍 EXTRACTED NAME: "${productName}" from:`, {
        product_name: item.product_name,
        "product?.name": item.product?.name,
        name: item.name,
      });

      // Price extraction
      let productPrice = 0;
      const priceValue =
        item.price || item.product?.finalPrice || item.product?.actualPrice;

      console.log(`🔍 EXTRACTED PRICE: "${priceValue}" from:`, {
        price: item.price,
        "product?.finalPrice": item.product?.finalPrice,
        "product?.actualPrice": item.product?.actualPrice,
      });

      if (priceValue) {
        const numPrice =
          typeof priceValue === "string" ? parseFloat(priceValue) : priceValue;
        productPrice =
          typeof numPrice === "number" && !isNaN(numPrice) ? numPrice : 0;
      }

      // Image extraction - handle JSON string arrays
      let productImage = "/api/placeholder/300/300";
      const imageValue = item.image || item.product?.image;

      console.log(`🔍 EXTRACTED IMAGE: "${imageValue}" from:`, {
        image: item.image,
        "product?.image": item.product?.image,
      });

      if (imageValue) {
        if (typeof imageValue === "string" && imageValue.startsWith("[")) {
          try {
            const parsedImages = JSON.parse(imageValue);
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              const baseUrl =
                import.meta.env.VITE_IMAGE_SERVER_URL;
              // Remove leading slash if it exists to avoid double slashes
              const imagePath = parsedImages[0].startsWith("/")
                ? parsedImages[0]
                : "/" + parsedImages[0];
              productImage = `${baseUrl}${imagePath}`;
            }
          } catch (e) {
            console.log("Failed to parse image JSON:", e);
            productImage = imageValue;
          }
        } else if (typeof imageValue === "string") {
          productImage = imageValue;
        }
      }

      const result = {
        id: item.id,
        productId: item.product_id || item.productId || item.product?.id || "",
        name: productName,
        price: productPrice,
        originalPrice: undefined,
        image: productImage,
        category: productCategory,
        addedAt: new Date(item.added_at || Date.now()).toISOString(),
        availability: "in-stock" as const,
      };

      console.log(`🔍 FINAL RESULT ${index}:`, result);
      return result;
    });
  }, [wishlist]);

  // Memoize filtered items for better performance
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return displayItems;

    const searchLower = searchTerm.toLowerCase();
    return displayItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
    );
  }, [displayItems, searchTerm]);

  // Optimized event handlers with useCallback
  const handleRemoveFromWishlist = useCallback(
    async (itemId: string) => {
      try {
        setLocalError("");
        const result = await (dispatch as any)(removeFromWishlist(itemId));

        if (
          result === "success" ||
          result?.type === "REMOVE_FROM_WISHLIST_SUCCESS"
        ) {
          toast.success("Item removed from wishlist");
        } else {
          toast.error("Failed to remove item");
          setLocalError("Failed to remove item from wishlist");
        }
      } catch (error) {
        console.error("Remove from wishlist error:", error);
        toast.error("An error occurred");
        setLocalError("An error occurred while removing item");
      }
    },
    [dispatch]
  );

  const handleAddToCart = useCallback(
    async (item: DisplayWishlistItem) => {
      try {
        setLocalError("");
        if (!isAuthenticated) {
          navigate("/login", { state: { from: "/wishlist" } });
          return;
        }

        const result = await (dispatch as any)(addToCart(item.productId, 1));

        if (result === "success" || result?.type?.includes("SUCCESS")) {
          toast.success(`${item.name} added to cart!`);
        } else {
          toast.error("Failed to add item to cart");
          setLocalError("Failed to add item to cart");
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        toast.error("An error occurred");
        setLocalError("An error occurred while adding to cart");
      }
    },
    [dispatch, isAuthenticated, navigate]
  );

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const getAvailabilityStatus = useCallback((availability: string) => {
    switch (availability) {
      case "in-stock":
        return {
          text: "In Stock",
          color: "text-green-600 bg-green-50 border-green-200",
        };
      case "low-stock":
        return {
          text: "Low Stock",
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        };
      case "out-of-stock":
        return {
          text: "Out of Stock",
          color: "text-red-600 bg-red-50 border-red-200",
        };
      default:
        return {
          text: "Unknown",
          color: "text-gray-600 bg-gray-50 border-gray-200",
        };
    }
  }, []);

  // Show loading state only when we don't have data and are loading
  if (loading && displayItems.length === 0 && !wishlistFetched) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarSection />
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
            <p className="text-black mt-4 font-medium text-center">
              Loading your wishlist...
            </p>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarSection />
        <div className="flex justify-center items-center h-64">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-bold text-black mb-2">
              Login Required
            </h3>
            <p className="text-gray-600 mb-6">
              Please log in to view your wishlist
            </p>
            <button
              onClick={() =>
                navigate("/login", { state: { from: "/wishlist" } })
              }
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 font-medium transform hover:scale-105"
            >
              Log In
            </button>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavbarSection />
      <Breadcrumb
        items={[
          { name: "Home", href: "/", current: false },
          { name: "Profile", href: "/profile", current: false },
          { name: "Wishlist", href: "/wishlist", current: true },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center w-full lg:w-auto">
              <button
                onClick={() => navigate("/profile")}
                className="mr-4 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 text-black" />
              </button>
              <div className="flex items-center justify-between w-full lg:w-auto">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-black">
                    My Wishlist
                  </h1>
                  <p className="text-gray-600 font-medium">
                    {filteredItems.length}{" "}
                    {filteredItems.length === 1 ? "item" : "items"} saved
                  </p>
                </div>
                <div className="flex items-center space-x-2 lg:hidden">
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-green-100 text-green-600"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-green-100 text-green-600"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              {/* View Mode Toggle - Desktop */}
              <div className="hidden lg:flex items-center space-x-2 bg-gray-50 rounded-xl p-1">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-500 hover:bg-white hover:text-black"
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-500 hover:bg-white hover:text-black"
                  }`}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search wishlist..."
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm text-black placeholder-gray-500 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {(error || localError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl shadow-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <span className="text-red-800 font-medium">
                {error || localError}
              </span>
            </div>
          </motion.div>
        )}

        {/* Loading State for Actions */}
        {loading && displayItems.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-lg">
            <div className="flex items-center text-green-800">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent mr-3"></div>
              <span className="font-medium">Updating wishlist...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && wishlistFetched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 max-w-lg mx-auto">
              <Heart className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold text-black mb-3">
                {searchTerm ? "No items found" : "Your wishlist is empty"}
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Save items you love for later"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate("/products")}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 font-bold text-lg shadow-lg transform hover:scale-105"
                >
                  Start Shopping
                </button>
              )}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-gray-600 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-all duration-300 font-bold text-lg shadow-lg transform hover:scale-105"
                >
                  Clear Search
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Items Grid/List */}
        {!loading && filteredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "grid-cols-1 gap-6"
            }`}
          >
            {filteredItems.map((item) => {
              const status = getAvailabilityStatus(item.availability);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    viewMode === "list" ? "flex p-6" : "p-6"
                  }`}
                >
                  <div
                    className={viewMode === "list" ? "flex-shrink-0 mr-6" : ""}
                  >
                    <div className="relative">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        className={`object-cover rounded-xl ${
                          viewMode === "list" ? "w-32 h-32" : "w-full h-48"
                        }`}
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`${viewMode === "list" ? "flex-1" : "mt-4"}`}>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-black line-clamp-2 text-lg">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {item.category}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-xl text-black">
                          Rs{" "}
                          {typeof item.price === "number"
                            ? item.price.toFixed(2)
                            : "0.00"}
                        </span>
                        {item.originalPrice &&
                          typeof item.originalPrice === "number" && (
                            <span className="text-gray-400 line-through text-sm">
                              Rs {item.originalPrice.toFixed(2)}
                            </span>
                          )}
                      </div>

                      <span
                        className={`inline-block text-xs px-3 py-1 rounded-full border font-medium ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>

                    <div className={`${viewMode === "list" ? "mt-6" : "mt-6"}`}>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.availability === "out-of-stock"}
                        className="w-full bg-green-600 text-white rounded-xl px-6 py-3 text-sm font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <FooterSection />
    </div>
  );
};

export default Wishlist;