import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  ShoppingCart,
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
  Star,
  Heart,
  Eye,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  ArrowUp,
  Tag,
} from "lucide-react";
import type { RootState } from "../../redux/store";
import { getAllProducts } from "../../redux/actions/productAction";
import { addToCart } from "../../redux/actions/cartAction";
import { ProductImage } from "../../utils/imageHelper";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlistActions";
import FooterSection from "../Homepage/sections/FooterSection/FooterSection";
import { formatPrice } from "@/utils/formatPrice";
import type { Product } from "../../redux/constants/productConstants";

const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

const getPriceAsNumber = (price: any): number => {
  if (price === null || price === undefined) return 0;
  try {
    return typeof price === "string" ? parseFloat(price) : price;
  } catch {
    return 0;
  }
};

const calculateDiscount = (actualPrice: any, finalPrice: any): number => {
  const actual = getPriceAsNumber(actualPrice);
  const final = getPriceAsNumber(finalPrice);
  if (actual === 0 || final >= actual) return 0;
  return Math.round(((actual - final) / actual) * 100);
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name A–Z" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

// ─── Featured Carousel ───────────────────────────────────────────────────────

const FeaturedCarousel: React.FC<{ products: Product[] }> = ({ products }) => {
  const [current, setCurrent] = useState(0);
  const dispatch = useDispatch();
  const featured = products.filter((p) => p.isFeatured).slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const id = setInterval(() => setCurrent((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(id);
  }, [featured.length]);

  if (!featured.length) return null;

  const product = featured[current];
  const discount = calculateDiscount(product.actualPrice, product.finalPrice);
  const price = product.finalPrice || product.actualPrice;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 bg-gray-900 select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 min-h-[260px]"
        >
          {/* Text side */}
          <div className="flex flex-col justify-center px-8 py-10 md:px-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                <Tag className="w-3 h-3" />
                Featured
              </span>
              {discount > 0 && (
                <span className="bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  Save {discount}%
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 line-clamp-2">
              {product.name}
            </h2>

            {product.description && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-5 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold text-white">{formatPrice(price)}</span>
              {discount > 0 && (
                <span className="text-gray-500 line-through text-base">
                  {formatPrice(product.actualPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/product/${product.id}`}
                className="bg-white text-gray-900 hover:bg-gray-100 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                View Product
              </Link>
              <button
                onClick={() => {
                  if (!isUserLoggedIn()) {
                    toast.error("Please log in to save items");
                    return;
                  }
                  dispatch(addToWishlist(product.id) as any);
                  toast.success("Saved to wishlist");
                }}
                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Save to wishlist"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image side */}
          <div className="hidden md:flex items-center justify-center py-8 pr-10">
            <div className="relative w-56 h-56">
              <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl scale-75" />
              <ProductImage
                src={Array.isArray(product.image) ? product.image[0] : product.image}
                alt={product.name}
                className="relative w-full h-full object-contain drop-shadow-2xl"
                fallbackUrl="/placeholder.jpg"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      {featured.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((i) => (i - 1 + featured.length) % featured.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrent((i) => (i + 1) % featured.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Product Card ────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isAdding: boolean;
  isWishlisted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  onAddToCart,
  onToggleWishlist,
  isAdding,
  isWishlisted,
}) => {
  const discount = calculateDiscount(product.actualPrice, product.finalPrice);
  const price = product.finalPrice || product.actualPrice;
  const hasMultipleVariants = product.variants?.length > 1;

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden group transition-all duration-200 shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 ${
        viewMode === "list" ? "flex" : "flex flex-col"
      }`}
    >
      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        className={`relative block overflow-hidden flex-shrink-0 bg-white ${
          viewMode === "list" ? "w-44 h-44" : "aspect-square"
        }`}
      >
        <ProductImage
          src={Array.isArray(product.image) ? product.image[0] : product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          fallbackUrl="/placeholder.jpg"
        />

        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}

        {/* Hover actions */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product.id);
            }}
            className={`p-1.5 rounded-full shadow transition-colors ${
              isWishlisted
                ? "bg-red-600 text-white"
                : "bg-white text-gray-500 hover:text-red-600"
            }`}
            title="Add to wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          <Link to={`/product/${product.id}`}>
            <div
              className="p-1.5 bg-white text-gray-500 hover:text-gray-900 rounded-full shadow transition-colors"
              title="Quick view"
            >
              <Eye className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div className={`p-4 flex flex-col border-t border-gray-100 ${viewMode === "list" ? "flex-1 border-t-0 border-l" : ""}`}>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-red-600 transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        {viewMode === "list" && product.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-2">{product.description}</p>
        )}

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(product.rating)
                    ? "text-amber-400 fill-current"
                    : "text-gray-200 fill-current"
                }`}
              />
            ))}
            {product.reviewCount > 0 && (
              <span className="text-xs text-gray-400 ml-0.5">({product.reviewCount})</span>
            )}
          </div>
        )}

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-gray-900">{formatPrice(price)}</span>
            {discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.actualPrice)}
              </span>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => !isAdding && onAddToCart(product)}
            disabled={isAdding}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              isAdding
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 active:scale-95 text-white"
            }`}
          >
            {isAdding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                {hasMultipleVariants ? "Choose Option" : "Add to Cart"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Filter Sidebar ──────────────────────────────────────────────────────────

interface FilterSidebarProps {
  categories: string[];
  selected: string[];
  priceRange: { min: number; max: number };
  bounds: { min: number; max: number };
  onCategoryChange: (cat: string) => void;
  onPriceChange: (type: "min" | "max", value: number) => void;
  onReset: () => void;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selected,
  priceRange,
  bounds,
  onCategoryChange,
  onPriceChange,
  onReset,
  onClose,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-32 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="text-xs text-red-600 hover:text-red-700 font-medium"
        >
          Clear all
        </button>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Categories */}
    {categories.length > 0 && (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Category
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(cat)}
                onChange={() => onCategoryChange(cat)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>
    )}

    {/* Price Range */}
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Price Range
      </h3>
      <div className="space-y-3">
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={priceRange.max}
          onChange={(e) => onPriceChange("max", Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Min</label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => onPriceChange("min", Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Max</label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => onPriceChange("max", Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatPrice(bounds.min)}</span>
          <span>{formatPrice(bounds.max)}</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const JoyStoreProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const category = searchParams.get("category") || categorySlug || "";
  const brand = searchParams.get("brand") || "";

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1_000_000 });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 1_000_000 });

  const { products = [], loading, error: reduxError } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(getAllProducts() as any);
  }, [dispatch]);

  // Build category list and price bounds from fetched products
  useEffect(() => {
    if (!products.length) return;

    const cats = [...new Set(products.map((p) => p.category))].filter(Boolean) as string[];
    setAvailableCategories(cats);

    const prices = products
      .map((p) => getPriceAsNumber(p.finalPrice || p.actualPrice))
      .filter((p) => !isNaN(p) && p > 0);

    if (prices.length) {
      const bounds = { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
      setPriceBounds(bounds);
      setPriceRange(bounds);
    }

    if (category) {
      const slug = category.toLowerCase().replace(/-/g, " ");
      setSelectedCategories(
        cats.filter(
          (c) => c.toLowerCase().includes(slug) || slug.includes(c.toLowerCase())
        )
      );
    }
  }, [products, category]);

  // Filter + sort
  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }

    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (brand) {
      const b = brand.toLowerCase();
      result = result.filter((p) => {
        const pb = (p.brand as any)?.name?.toLowerCase() || (typeof p.brand === "string" ? p.brand.toLowerCase() : "");
        return pb.includes(b) || b.includes(pb);
      });
    }

    if (selectedCategories.length) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    } else if (category) {
      const slug = category.toLowerCase().replace(/-/g, " ");
      result = result.filter((p) => {
        const pc = p.category?.toLowerCase() || "";
        return pc.includes(slug) || slug.includes(pc);
      });
    }

    result = result.filter((p) => {
      const price = getPriceAsNumber(p.finalPrice || p.actualPrice);
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Stable sort — no Math.random()
    result.sort((a, b) => {
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
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "featured":
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });

    setFilteredProducts(result);
  }, [searchQuery, category, brand, products, selectedCategories, priceRange, sortBy]);

  const handleAddToCart = (product: Product) => {
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your cart");
      return;
    }
    if (product.variants?.length > 1) {
      navigate(`/product/${product.id}`);
      return;
    }
    const variantId = product.defaultVariant?.id;
    if (!variantId) {
      toast.error("This product is not available right now.");
      return;
    }
    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));
    dispatch(addToCart(variantId, 1) as any);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddingToCart((prev) => ({ ...prev, [product.id]: false })), 800);
  };

  const handleToggleWishlist = (productId: string) => {
    if (!isUserLoggedIn()) {
      toast.error("Please log in to save items");
      return;
    }
    const isAdding = !wishlist.includes(productId);
    setWishlist((prev) =>
      isAdding ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
    if (isAdding) {
      dispatch(addToWishlist(productId) as any);
      toast.success("Saved to wishlist");
    } else {
      dispatch(removeFromWishlist(productId) as any);
      toast.success("Removed from wishlist");
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handlePriceChange = (type: "min" | "max", value: number) => {
    setPriceRange((prev) => ({ ...prev, [type]: value }));
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange(priceBounds);
    setSortBy("featured");
  };

  const pageTitle = brand
    ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} Products`
    : category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")
    : "All Products";

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    ...(brand ? [{ label: brand.charAt(0).toUpperCase() + brand.slice(1), href: "" }] : []),
    ...(category && !brand ? [{ label: pageTitle, href: "" }] : []),
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavbarSection />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[180px] pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" />}
              {crumb.href && i < crumbs.length - 1 ? (
                <Link to={crumb.href} className="hover:text-gray-700 transition-colors whitespace-nowrap">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-800 font-medium whitespace-nowrap">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Page header — title left, controls right, always on same row */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading && !products.length
                ? "Loading…"
                : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {/* Sort */}
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                }`}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                showFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {selectedCategories.length > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none font-semibold ${showFilters ? "bg-white text-gray-900" : "bg-red-600 text-white"}`}>
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Featured Carousel */}
        <FeaturedCarousel products={products} />

        {/* Error */}
        {reduxError && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {typeof reduxError === "string" ? reduxError : "Failed to load products"}
          </div>
        )}

        <div className={`grid gap-6 ${showFilters ? "lg:grid-cols-[240px_1fr]" : "grid-cols-1"}`}>
          {/* Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="lg:col-span-1"
              >
                <FilterSidebar
                  categories={availableCategories}
                  selected={selectedCategories}
                  priceRange={priceRange}
                  bounds={priceBounds}
                  onCategoryChange={handleCategoryChange}
                  onPriceChange={handlePriceChange}
                  onReset={resetFilters}
                  onClose={() => setShowFilters(false)}
                />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products */}
          <div>
            {loading && !products.length ? (
              /* Skeleton grid */
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? showFilters
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-52 bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-8 bg-gray-100 rounded mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-base font-semibold text-gray-800 mb-1">No products found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {brand ? `No results for "${brand}"` : "Try adjusting your filters"}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? showFilters
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                  >
                    <ProductCard
                      product={product}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isAdding={!!addingToCart[product.id]}
                      isWishlisted={wishlist.includes(product.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-gray-900 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-colors z-50"
        title="Back to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      <FooterSection />
    </div>
  );
};

export default JoyStoreProducts;
