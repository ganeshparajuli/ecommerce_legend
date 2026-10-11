import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart, Minus, Plus, Star, ShoppingCart, ArrowLeft, Package,
  Eye, EyeOff, Trash2, Send, CheckCircle, Check, Truck, ShieldCheck, RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import PageLayout from "../../components/PageLayout";
import { getProductDetails } from "../../redux/actions/productAction";
import { addToCart } from "../../redux/actions/cartAction";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlistActions";
import { fetchReviews, submitReview, deleteReview, toggleReviewVisibility } from "../../redux/actions/reviewAction";
import { ProductImage, getImageUrl } from "../../utils/imageHelper";
import type { RootState } from "../../redux/store";
import { formatPrice } from "@/utils/formatPrice";
import type { Review } from "../../redux/reducers/reviewReducer";

// ─── Attribute type system ────────────────────────────────────────────────────
type AttributeType = "color" | "clothing_size" | "storage" | "ram" | "generic";

// Canonical clothing size order — values outside this list sort to the end
const CLOTHING_SIZE_ORDER = [
  "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL",
  "ONE SIZE", "FREE SIZE", "FREESIZE",
];
const CLOTHING_SIZE_SET = new Set(CLOTHING_SIZE_ORDER.map((s) => s.toUpperCase()));

const STORAGE_RE = /^\d+(\.\d+)?\s*(KB|MB|GB|TB|PB)$/i;
const RAM_RE = /^\d+(\.\d+)?\s*(GB|MB)\s*(RAM|DDR\d*)?$/i;

/**
 * Auto-detects the semantic type of an attribute axis from its key name and
 * the actual values stored in the variants. No schema changes required.
 */
const getAttributeType = (key: string, values: string[]): AttributeType => {
  const k = key.toLowerCase().trim();

  if (k.includes("color") || k.includes("colour")) return "color";

  if (k === "ram" || k.startsWith("ram ") || k.endsWith(" ram") || k.includes("memory")) {
    if (values.some((v) => RAM_RE.test(v.trim()))) return "ram";
  }

  if (
    k === "storage" || k === "capacity" || k.includes("ssd") ||
    k.includes("hdd") || k.includes("disk") || k.includes("drive")
  ) {
    if (values.some((v) => STORAGE_RE.test(v.trim()))) return "storage";
  }

  if (k === "size" || k.includes("size")) {
    // Values look like clothing sizes → clothing_size
    const upperVals = values.map((v) => v.trim().toUpperCase());
    if (upperVals.some((v) => CLOTHING_SIZE_SET.has(v))) return "clothing_size";
    // Values look like storage sizes (e.g. size: "128GB") → storage
    if (upperVals.some((v) => STORAGE_RE.test(v))) return "storage";
  }

  return "generic";
};

/** Sort clothing sizes in canonical order (XS < S < M < L < XL …) */
const sortClothingSizes = (values: string[]): string[] =>
  [...values].sort((a, b) => {
    const ai = CLOTHING_SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = CLOTHING_SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

// ─── Color helpers ─────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  black: "#111111", white: "#f8f8f8", red: "#dc2626", blue: "#2563eb",
  green: "#16a34a", yellow: "#eab308", orange: "#ea580c", purple: "#9333ea",
  pink: "#ec4899", gray: "#6b7280", grey: "#6b7280", silver: "#c0c0c0",
  gold: "#d4af37", brown: "#92400e", navy: "#1e3a5f", cyan: "#0891b2",
  teal: "#0d9488", indigo: "#4338ca", violet: "#7c3aed", lime: "#65a30d",
  rose: "#e11d48", sky: "#0284c7", "space grey": "#6b7280", midnight: "#1c1c1e",
  starlight: "#f5f5f0", "product red": "#dc2626", "deep purple": "#5856d6",
  "natural titanium": "#c8beb2", "black titanium": "#2a2a2a",
  "white titanium": "#f0eeec", "desert titanium": "#c4a882",
  beige: "#f5f0e8", cream: "#fffdd0", maroon: "#800000", olive: "#808000",
  coral: "#ff6b6b", turquoise: "#40e0d0", magenta: "#ff00ff",
};

const getColorBg = (value: string): string | null => {
  const lower = value.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  for (const key of Object.keys(COLOR_MAP)) {
    if (lower.includes(key)) return COLOR_MAP[key];
  }
  return null;
};

const isLightColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
};

// ─── Auth helper ───────────────────────────────────────────────────────────────
const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

// ─── Interactive star component ────────────────────────────────────────────────
const StarInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(n)} className="focus:outline-none">
          <Star className={`w-6 h-6 transition-colors ${n <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
};

const StarDisplay = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${cls} ${n <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
};

const RatingBar = ({ count, total, label }: { count: number; total: number; label: string }) => (
  <div className="flex items-center gap-2 text-xs text-gray-600">
    <span className="w-4 text-right font-medium">{label}</span>
    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
      <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: total ? `${(count / total) * 100}%` : "0%" }} />
    </div>
    <span className="w-5 text-gray-500">{count}</span>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { product, loading, error } = useSelector((state: RootState) => state.products);
  const { wishlist } = useSelector((state: RootState) => state.wishlist || { wishlist: [] });
  const { user } = useSelector((state: RootState) => state.user);
  const { reviews, loading: reviewsLoading, submitting } = useSelector(
    (state: RootState) => (state as any).reviews || { reviews: [], loading: false, submitting: false }
  );

  const isAdmin = user && ["admin", "sub-admin"].includes(user.role ?? "");
  const loggedIn = isUserLoggedIn();

  useEffect(() => { if (id) dispatch(getProductDetails(id) as any); }, [dispatch, id]);

  useEffect(() => {
    if (product?.defaultVariant) {
      setSelectedAttributes(product.defaultVariant.attributes || {});
      setQuantity(1);
    }
  }, [product?.id]);

  useEffect(() => {
    if (activeTab === "reviews" && id) dispatch(fetchReviews(id) as any);
  }, [activeTab, id, dispatch]);

  useEffect(() => {
    setReviewSubmitted(false);
    setReviewRating(0);
    setReviewComment("");
  }, [id]);

  const attributeOptions = React.useMemo(() => {
    const options: Record<string, string[]> = {};
    (product?.variants || []).forEach((variant) => {
      Object.entries(variant.attributes || {}).forEach(([key, value]) => {
        if (!options[key]) options[key] = [];
        if (!options[key].includes(value)) options[key].push(value);
      });
    });
    return options;
  }, [product?.variants]);

  const selectedVariant = React.useMemo(() => {
    if (!product?.variants?.length) return product?.defaultVariant;
    const allAxes = Object.keys(attributeOptions);
    const allSelected = allAxes.length === 0 || allAxes.every((k) => selectedAttributes[k]);
    if (!allSelected) return null;
    const match = product.variants.find((variant) =>
      Object.entries(selectedAttributes).every(([key, value]) => variant.attributes?.[key] === value)
    );
    return match ?? null;
  }, [product, selectedAttributes, attributeOptions]);

  useEffect(() => { setQuantity(1); }, [selectedVariant?.id]);

  const totalVariants = product?.variants?.length || 0;
  const hasVariants = totalVariants > 0 && Object.keys(attributeOptions).length > 0;
  // Variants exist but have no attributes configured — admin data issue
  const hasUnconfiguredVariants = totalVariants > 1 && !hasVariants;

  useEffect(() => {
    if (product && wishlist) setIsWishlisted(wishlist.includes(product.id));
  }, [product, wishlist]);

  const visibleReviews: Review[] = isAdmin ? reviews : reviews.filter((r: Review) => r.isVisible);
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star, count: visibleReviews.filter((r: Review) => r.rating === star).length,
  }));
  const userAlreadyReviewed = reviews.some((r: Review) => r.userId === user?.id);

  const isVariantSelected = selectedVariant !== null;
  const maxStock = selectedVariant?.quantity ?? 0;

  const getPriceAsNumber = (price: number | string | null | undefined): number => {
    if (price === null || price === undefined) return 0;
    return typeof price === "string" ? parseFloat(price) : price;
  };

  const calculateDiscount = (actual: number | string | null | undefined, final: number | string | null | undefined): number => {
    const a = getPriceAsNumber(actual);
    const f = getPriceAsNumber(final);
    if (a === 0 || a <= f) return 0;
    return Math.round(((a - f) / a) * 100);
  };

  /**
   * Smart attribute selection with auto-resolve.
   *
   * When the user picks an option that makes the current combination invalid
   * (no variant matches all axes), find the variant that has the clicked value
   * AND the most overlap with the remaining selections, then adopt its full
   * attribute set. This is the same pattern used by Shopify / Apple Store.
   */
  const handleAttrSelect = (attrKey: string, value: string) => {
    const newAttrs = { ...selectedAttributes, [attrKey]: value };
    const variants = product?.variants ?? [];

    // Exact match — ideal, just apply it
    const exact = variants.find((v) =>
      Object.entries(newAttrs).every(([k, val]) => v.attributes?.[k] === val)
    );
    if (exact) { setSelectedAttributes(newAttrs); return; }

    // No exact match — find the variant that has the chosen value and the
    // highest overlap with the other currently selected attributes
    const candidates = variants.filter((v) => v.attributes?.[attrKey] === value);
    if (!candidates.length) return; // value genuinely doesn't exist in any variant

    const best = candidates.reduce((winner, v) => {
      const score = Object.entries(newAttrs).filter(([k, val]) => v.attributes?.[k] === val).length;
      const bestScore = Object.entries(newAttrs).filter(([k, val]) => winner.attributes?.[k] === val).length;
      return score > bestScore ? v : winner;
    });

    setSelectedAttributes({ ...(best.attributes || {}) });
  };

  const handleQuantityChange = (action: string) => {
    if (action === "increase") setQuantity((prev) => Math.min(prev + 1, maxStock));
    else if (action === "decrease" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isUserLoggedIn()) { toast.error("Please log in to add items to your cart"); return; }
    if (!selectedVariant?.id) { toast.error("Please select all options before adding to cart"); return; }
    setAddingToCart(true);
    try {
      dispatch(addToCart(selectedVariant.id, quantity) as any);
      toast.success(`Added ${quantity} × ${product.name} to cart!`);
    } catch {
      toast.error(`Failed to add ${product.name} to cart.`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (!isUserLoggedIn()) { toast.error("Please log in to use wishlist"); return; }
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      if (next) await dispatch(addToWishlist(product.id) as any);
      else await dispatch(removeFromWishlist(product.id) as any);
    } catch { setIsWishlisted(!next); }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedIn) { toast.error("Please log in to submit a review"); return; }
    if (reviewRating === 0) { toast.error("Please select a star rating"); return; }
    if (!reviewComment.trim()) { toast.error("Please write a comment"); return; }
    try {
      await dispatch(submitReview(id!, reviewRating, reviewComment.trim()) as any);
      setReviewSubmitted(true);
      setReviewRating(0);
      setReviewComment("");
      toast.success("Review submitted!");
      dispatch(getProductDetails(id!) as any);
    } catch (err) {
      toast.error((err as Error).message || "Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    await dispatch(deleteReview(reviewId) as any);
    dispatch(getProductDetails(id!) as any);
    toast.success("Review deleted");
  };

  const handleToggleVisibility = async (reviewId: string) => {
    await dispatch(toggleReviewVisibility(reviewId) as any);
  };

  // ─── Variant selector ─────────────────────────────────────────────────────────
  const renderVariantSelector = () => {
    if (!hasVariants) return null;

    return (
      <div className="space-y-5">
        {Object.entries(attributeOptions).map(([attrKey, rawValues]) => {
          const type = getAttributeType(attrKey, rawValues);
          const selected = selectedAttributes[attrKey];

          // Sort clothing sizes in canonical order
          const values = type === "clothing_size" ? sortClothingSizes(rawValues) : rawValues;

          // A value is available if ANY variant carries it for this axis.
          // We don't require it to combine with the current selection — the
          // handleAttrSelect auto-resolve will switch to the best matching
          // variant when the user clicks it.
          const wouldMatchFor = (value: string) =>
            (product?.variants ?? []).some((v) => v.attributes?.[attrKey] === value);

          // ── Attribute type label ──
          const typeLabel: Record<AttributeType, string> = {
            color: "Color",
            clothing_size: "Size",
            storage: "Storage",
            ram: "RAM",
            generic: attrKey.charAt(0).toUpperCase() + attrKey.slice(1),
          };

          return (
            <div key={attrKey}>
              {/* Label row with selected value */}
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-sm font-semibold text-gray-600">{typeLabel[type]}:</span>
                {selected ? (
                  <span className="text-sm font-bold text-gray-900">{selected}</span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Select {typeLabel[type].toLowerCase()}</span>
                )}
              </div>

              {/* ── COLOR swatches ── */}
              {type === "color" && (
                <div className="flex flex-wrap gap-3">
                  {values.map((value) => {
                    const bg = getColorBg(value);
                    const isSelected = selected === value;
                    const canSelect = wouldMatchFor(value);
                    const light = bg ? isLightColor(bg) : false;
                    return (
                      <button
                        key={value}
                        type="button"
                        title={value}
                        disabled={!canSelect}
                        onClick={() => handleAttrSelect(attrKey, value)}
                        className={`flex flex-col items-center gap-1.5 focus:outline-none transition-opacity ${!canSelect ? "opacity-35 cursor-not-allowed" : ""}`}
                      >
                        <span
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-red-500 scale-110 border-transparent"
                              : canSelect
                              ? "border-gray-200 hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 hover:scale-105"
                              : "border-gray-100"
                          }`}
                          style={{ backgroundColor: bg || "#e5e7eb" }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5" style={{ color: light ? "#374151" : "#ffffff" }} />
                          )}
                          {!bg && !isSelected && (
                            <span className="text-[10px] text-gray-600 font-bold">{value.slice(0, 2).toUpperCase()}</span>
                          )}
                        </span>
                        <span className={`text-[11px] text-center leading-tight max-w-[56px] truncate ${isSelected ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                          {value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── CLOTHING SIZE buttons ── */}
              {type === "clothing_size" && (
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selected === value;
                    const canSelect = wouldMatchFor(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={!canSelect}
                        onClick={() => handleAttrSelect(attrKey, value)}
                        className={`relative min-w-[48px] h-10 px-3 rounded-lg border-2 text-sm font-bold tracking-wide transition-all ${
                          isSelected
                            ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                            : canSelect
                            ? "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                            : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {/* Diagonal strikethrough for unavailable */}
                        {!canSelect && (
                          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                            <line x1="0" y1="100%" x2="100%" y2="0" stroke="#d1d5db" strokeWidth="1.5" />
                          </svg>
                        )}
                        {value.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── STORAGE / RAM capacity pills ── */}
              {(type === "storage" || type === "ram") && (
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selected === value;
                    const canSelect = wouldMatchFor(value);
                    // Split "128 GB" or "128GB" into number + unit for styling
                    const match = value.match(/^(\d+(?:\.\d+)?)\s*([A-Za-z]+)(.*)$/);
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={!canSelect}
                        onClick={() => handleAttrSelect(attrKey, value)}
                        className={`relative px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                          isSelected
                            ? "border-red-600 bg-red-50 text-red-700 shadow-sm"
                            : canSelect
                            ? "border-gray-200 bg-white text-gray-800 hover:border-red-300 hover:text-red-600"
                            : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {!canSelect && (
                          <svg className="absolute inset-0 w-full h-full rounded-lg" preserveAspectRatio="none">
                            <line x1="5%" y1="95%" x2="95%" y2="5%" stroke="#d1d5db" strokeWidth="1.5" />
                          </svg>
                        )}
                        {match ? (
                          <span>
                            <span className="font-bold">{match[1]}</span>
                            <span className={`text-xs ml-0.5 ${isSelected ? "text-red-500" : canSelect ? "text-gray-500" : "text-gray-300"}`}>
                              {match[2]}{match[3]}
                            </span>
                          </span>
                        ) : value}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── GENERIC attribute pills ── */}
              {type === "generic" && (
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selected === value;
                    const canSelect = wouldMatchFor(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={!canSelect}
                        onClick={() => handleAttrSelect(attrKey, value)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-gray-900 bg-gray-900 text-white"
                            : canSelect
                            ? "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                            : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Reviews tab ──────────────────────────────────────────────────────────────
  const renderReviewsTab = () => {
    const avg = product?.rating || 0;
    const total = visibleReviews.length;
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          <div className="flex flex-col items-center justify-center text-center min-w-[110px] bg-white border border-gray-100 rounded-2xl p-5">
            <span className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</span>
            <div className="my-2"><StarDisplay rating={avg} size="md" /></div>
            <span className="text-xs text-gray-500">{total} review{total !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex-1 space-y-2 justify-center flex flex-col">
            {ratingCounts.map(({ star, count }) => (
              <RatingBar key={star} label={String(star)} count={count} total={total} />
            ))}
          </div>
        </div>

        {loggedIn && !userAlreadyReviewed && !reviewSubmitted && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h4 className="font-semibold text-gray-900 mb-4">Write a Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Your Rating</label>
                <StarInput value={reviewRating} onChange={setReviewRating} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Your Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {loggedIn && userAlreadyReviewed && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            You have already reviewed this product.
          </div>
        )}

        {!loggedIn && (
          <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <button onClick={() => navigate("/login")} className="text-red-600 font-semibold hover:underline">Log in</button>{" "}to write a review.
          </div>
        )}

        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-t-red-600 border-r-red-200 border-b-red-200 border-l-red-200 rounded-full" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {(isAdmin ? reviews : visibleReviews).map((review: Review) => (
              <div key={review.id} className={`border rounded-2xl p-4 transition-all ${!review.isVisible ? "border-dashed border-gray-200 bg-gray-50 opacity-70" : "border-gray-100 bg-white"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(review.user?.name || review.reviewerName || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-900">{review.user?.name || review.reviewerName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StarDisplay rating={review.rating} />
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        {isAdmin && !review.isVisible && (
                          <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Hidden</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button title={review.isVisible ? "Hide" : "Show"} onClick={() => handleToggleVisibility(review.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        {review.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button title="Delete" onClick={() => handleDeleteReview(review.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── Tab content ──────────────────────────────────────────────────────────────
  const tabs = [
    { id: "details", label: "Details" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: `Reviews (${product?.reviewCount || 0})` },
  ];

  const renderTabContent = () => {
    if (!product) return null;
    switch (activeTab) {
      case "details":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {product.description || "Experience exceptional quality with this premium product."}
            </p>
            {product.keyFeatures?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {product.keyFeatures.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case "specifications":
        return (
          <div>
            {product.specifications && typeof product.specifications === "object" ? (
              <div className="divide-y divide-gray-100">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex py-2.5 gap-4">
                    <span className="w-40 flex-shrink-0 text-sm text-gray-500 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No specifications available.</p>
            )}
          </div>
        );
      case "reviews":
        return renderReviewsTab();
      default:
        return null;
    }
  };

  // ─── Loading / error states ───────────────────────────────────────────────────
  if (loading) {
    return (
      <PageLayout className="min-h-screen bg-white flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-t-red-600 border-r-red-100 border-b-red-100 border-l-red-100 rounded-full" />
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <Package className="w-16 h-16 text-red-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <button onClick={() => navigate("/products")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all text-sm">
            Back to Products
          </button>
        </div>
      </PageLayout>
    );
  }

  // Image list (only non-null)
  const imageCount = Array.from({ length: 8 }, (_, i) => i).filter((i) => getImageUrl(product.image, i) !== null);

  const discountPct = isVariantSelected
    ? calculateDiscount(selectedVariant!.compareAtPrice, selectedVariant!.price)
    : 0;

  // ─── Main render ──────────────────────────────────────────────────────────────
  return (
    <PageLayout className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pt-4 sm:pt-28 lg:pt-32 px-3 sm:px-4 lg:px-8 pb-16">

        {/* Breadcrumb / back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-red-600 mb-5 transition-colors gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </motion.button>

        {/* ── Product section ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* ── Left: Image Gallery ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              {/* Thumbnail strip */}
              {imageCount.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 w-16 flex-shrink-0">
                  {imageCount.map((index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === index
                          ? "border-red-500 shadow-md"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <ProductImage
                        src={product.image} index={index} alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        fallbackUrl="/placeholder.jpg"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1">
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full"
                    >
                      <ProductImage
                        src={product.image} index={selectedImage} alt={product.name}
                        className="w-full h-full object-contain p-4"
                        fallbackUrl="/placeholder.jpg"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Mobile thumbnails */}
                {imageCount.length > 1 && (
                  <div className="sm:hidden flex gap-2 mt-3 overflow-x-auto pb-1">
                    {imageCount.map((index) => (
                      <button key={index} onClick={() => setSelectedImage(index)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          selectedImage === index ? "border-red-500" : "border-gray-100 hover:border-gray-300"
                        }`}>
                        <ProductImage src={product.image} index={index} alt="" className="w-full h-full object-cover" fallbackUrl="/placeholder.jpg" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Right: Product Info ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-5">

              {/* Brand + category chips */}
              <div className="flex flex-wrap gap-2">
                {product.brand && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                    {product.brand}
                  </span>
                )}
                {product.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">{product.name}</h1>

              {/* Rating row */}
              <div className="flex items-center gap-2">
                <StarDisplay rating={product.rating || 0} size="md" />
                <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
                {maxStock > 0 && isVariantSelected && (
                  <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    In Stock
                  </span>
                )}
                {isVariantSelected && maxStock === 0 && (
                  <span className="ml-auto text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Price */}
              <div className="flex flex-wrap items-end gap-3">
                {isVariantSelected ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(getPriceAsNumber(selectedVariant!.price))}
                    </span>
                    {getPriceAsNumber(selectedVariant!.compareAtPrice) > getPriceAsNumber(selectedVariant!.price) && (
                      <>
                        <span className="text-base text-gray-400 line-through mb-1">
                          {formatPrice(getPriceAsNumber(selectedVariant!.compareAtPrice))}
                        </span>
                        {discountPct > 0 && (
                          <span className="mb-1 text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">
                            {discountPct}% OFF
                          </span>
                        )}
                      </>
                    )}
                    {quantity > 1 && (
                      <span className="text-xs text-gray-400 mb-1 w-full">
                        {formatPrice(getPriceAsNumber(selectedVariant!.price) * quantity)} total for {quantity}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900">
                      {product.priceRange?.min === product.priceRange?.max
                        ? formatPrice(product.priceRange?.min ?? product.finalPrice)
                        : `${formatPrice(product.priceRange?.min)} – ${formatPrice(product.priceRange?.max)}`}
                    </span>
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-1">
                      Select options to see price
                    </span>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Variant selectors */}
              {renderVariantSelector()}

              {/* Admin data issue: variants exist but no attributes defined */}
              {hasUnconfiguredVariants && (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p>This product has multiple variants — contact support or check back later for all options.</p>
                </div>
              )}

              {/* Quantity + actions */}
              <div className="space-y-3 pt-1">
                {/* Quantity row */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium w-20">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors text-gray-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-gray-900 border-x border-gray-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange("increase")}
                      disabled={quantity >= maxStock || !isVariantSelected}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors text-gray-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {isVariantSelected && maxStock > 0 && (
                    <span className="text-xs text-gray-400">{maxStock} available</span>
                  )}
                </div>

                {/* Add to Cart + Wishlist */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddToCart}
                    disabled={addingToCart || !isVariantSelected || maxStock === 0}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all ${
                      !isVariantSelected || maxStock === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md"
                    } ${addingToCart ? "opacity-75" : ""}`}
                  >
                    {addingToCart ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-t-white border-r-white/30 border-b-white/30 border-l-white/30 rounded-full" />
                    ) : (
                      <ShoppingCart className="w-4.5 h-4.5" />
                    )}
                    {addingToCart ? "Adding..." : !isVariantSelected ? "Select Options" : maxStock === 0 ? "Out of Stock" : "Add to Cart"}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWishlist}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                      isWishlisted ? "border-red-500 bg-red-50 text-red-500" : "border-gray-200 bg-white text-gray-400 hover:border-red-400 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </motion.button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                {[
                  { icon: Truck, text: "Free Delivery" },
                  { icon: ShieldCheck, text: "1 Year Warranty" },
                  { icon: RotateCcw, text: "7 Day Returns" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1 py-2.5 bg-gray-50 rounded-xl">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{text}</span>
                  </div>
                ))}
              </div>

              {/* SKU */}
              {selectedVariant?.sku && (
                <p className="text-xs text-gray-400">SKU: {selectedVariant.sku}</p>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Tabs section ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tab nav */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all relative ${
                  activeTab === tab.id
                    ? "text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 sm:p-7 min-h-[250px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ProductDetailPage;
