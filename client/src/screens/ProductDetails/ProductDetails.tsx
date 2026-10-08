import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart, Minus, Plus, Star, ShoppingCart, ArrowLeft, Package,
  Eye, EyeOff, Trash2, Send, CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import PageLayout from "../../components/PageLayout";
import { getProductDetails } from "../../redux/actions/productAction";
import { addToCart } from "../../redux/actions/cartAction";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlistActions";
import { fetchReviews, submitReview, deleteReview, toggleReviewVisibility } from "../../redux/actions/reviewAction";
import { ProductImage, getImageUrl } from "../../utils/imageHelper";
import type { RootState } from "../../redux/store";
import { formatPrice } from "@/utils/formatPrice";
import type { Review } from "../../redux/reducers/reviewReducer";

// ─── Color name → CSS background ──────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  black: "#111111", white: "#f8f8f8", red: "#dc2626", blue: "#2563eb",
  green: "#16a34a", yellow: "#ca8a04", orange: "#ea580c", purple: "#9333ea",
  pink: "#ec4899", gray: "#6b7280", grey: "#6b7280", silver: "#c0c0c0",
  gold: "#d4af37", brown: "#92400e", navy: "#1e3a5f", cyan: "#0891b2",
  teal: "#0d9488", indigo: "#4338ca", violet: "#7c3aed", lime: "#65a30d",
  rose: "#e11d48", sky: "#0284c7", "space grey": "#6b7280", "midnight": "#1c1c1e",
  "starlight": "#f5f5f0", "product red": "#dc2626", "deep purple": "#5856d6",
};

const getColorBg = (value: string): string | null => {
  const lower = value.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Try partial match
  for (const key of Object.keys(COLOR_MAP)) {
    if (lower.includes(key)) return COLOR_MAP[key];
  }
  return null;
};

const isColorAttr = (key: string) =>
  key.toLowerCase().includes("color") || key.toLowerCase().includes("colour");

const isSizeAttr = (key: string) =>
  key.toLowerCase().includes("size") || key.toLowerCase() === "storage" ||
  key.toLowerCase() === "ram" || key.toLowerCase() === "memory";

// ─── Auth helper ───────────────────────────────────────────────────────────────
const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

// ─── Interactive star component ────────────────────────────────────────────────
const StarInput = ({
  value, onChange,
}: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              n <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// ─── Static star display ───────────────────────────────────────────────────────
const StarDisplay = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${n <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
};

// ─── Rating bar ────────────────────────────────────────────────────────────────
const RatingBar = ({ count, total, label }: { count: number; total: number; label: string }) => (
  <div className="flex items-center gap-2 text-xs text-gray-600">
    <span className="w-6 text-right">{label}</span>
    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
      <div
        className="bg-yellow-400 h-1.5 rounded-full transition-all"
        style={{ width: total ? `${(count / total) * 100}%` : "0%" }}
      />
    </div>
    <span className="w-6">{count}</span>
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

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Redux state
  const { product, loading, error } = useSelector((state: RootState) => state.products);
  const { wishlist } = useSelector((state: RootState) => state.wishlist || { wishlist: [] });
  const { user } = useSelector((state: RootState) => state.user);
  const { reviews, loading: reviewsLoading, submitting } = useSelector(
    (state: RootState) => (state as unknown as Record<string, unknown>).reviews as { reviews: Review[]; loading: boolean; submitting: boolean } || { reviews: [], loading: false, submitting: false }
  );

  const isAdmin = user && ["admin", "sub-admin"].includes(user.role ?? "");
  const loggedIn = isUserLoggedIn();

  useEffect(() => {
    if (id) dispatch(getProductDetails(id) as any);
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.defaultVariant) {
      setSelectedAttributes(product.defaultVariant.attributes || {});
      setQuantity(1);
    }
  }, [product?.id]);

  // Fetch reviews when reviews tab opens
  useEffect(() => {
    if (activeTab === "reviews" && id) {
      dispatch(fetchReviews(id) as any);
    }
  }, [activeTab, id, dispatch]);

  // Reset submitted flag when product changes
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
    const match = product.variants.find((variant) =>
      Object.entries(selectedAttributes).every(([key, value]) => variant.attributes?.[key] === value)
    );
    return match || product.defaultVariant;
  }, [product, selectedAttributes]);

  const hasMultipleVariants = (product?.variants?.length || 0) > 1;

  useEffect(() => {
    if (product && wishlist) setIsWishlisted(wishlist.includes(product.id));
  }, [product, wishlist]);

  // Review stats
  const visibleReviews: Review[] = isAdmin ? reviews : reviews.filter((r: Review) => r.isVisible);
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: visibleReviews.filter((r: Review) => r.rating === star).length,
  }));

  // Check if current user already submitted a review
  const userAlreadyReviewed = reviews.some((r: Review) => r.userId === user?.id);

  const tabs = [
    { id: "details", label: "DETAILS" },
    { id: "specifications", label: "SPECIFICATIONS" },
    { id: "reviews", label: `REVIEWS (${product?.reviewCount || 0})` },
    { id: "related", label: "RELATED PRODUCTS" },
  ];

  const handleQuantityChange = (action: string) => {
    if (action === "increase") setQuantity((prev) => prev + 1);
    else if (action === "decrease" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your cart");
      return;
    }
    if (!selectedVariant?.id) {
      toast.error("Please select a valid option before adding to cart");
      return;
    }
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
    } catch {
      setIsWishlisted(!next);
    }
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
      // Refresh product to update rating count
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

  const getPriceAsNumber = (price: number | string | null | undefined): number => {
    if (price === null || price === undefined) return 0;
    return typeof price === "string" ? parseFloat(price) : price;
  };

  const calculateDiscount = (actual: number | string | null | undefined, final: number | string | null | undefined): number => {
    const a = getPriceAsNumber(actual);
    const f = getPriceAsNumber(final);
    if (a === 0) return 0;
    return Math.round(((a - f) / a) * 100);
  };

  // ─── Variant selector rendering ──────────────────────────────────────────────
  const renderVariantSelector = () => {
    if (!hasMultipleVariants || !Object.keys(attributeOptions).length) return null;
    return (
      <div className="space-y-4">
        {Object.entries(attributeOptions).map(([attrKey, values]) => {
          const isColor = isColorAttr(attrKey);
          const isSize = !isColor && isSizeAttr(attrKey);
          return (
            <div key={attrKey}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 text-sm capitalize">{attrKey}:</span>
                {isColor && selectedAttributes[attrKey] && (
                  <span className="text-sm text-gray-600">{selectedAttributes[attrKey]}</span>
                )}
              </div>

              {isColor ? (
                // Color swatches
                <div className="flex flex-wrap gap-2.5">
                  {values.map((value) => {
                    const bg = getColorBg(value);
                    const isSelected = selectedAttributes[attrKey] === value;
                    const wouldMatch = (product?.variants ?? []).some((v) =>
                      Object.entries({ ...selectedAttributes, [attrKey]: value }).every(
                        ([k, val]) => v.attributes?.[k] === val
                      )
                    );
                    if (bg) {
                      return (
                        <button
                          key={value}
                          type="button"
                          title={value}
                          disabled={!wouldMatch}
                          onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attrKey]: value }))}
                          className={`relative w-8 h-8 rounded-full border-2 transition-all focus:outline-none ${
                            isSelected ? "border-red-600 scale-110 shadow-md" : wouldMatch ? "border-gray-300 hover:border-gray-500" : "border-gray-200 opacity-40 cursor-not-allowed"
                          }`}
                          style={{ backgroundColor: bg }}
                        >
                          {isSelected && (
                            <span
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ color: value.toLowerCase().includes("white") || value.toLowerCase().includes("silver") || value.toLowerCase().includes("gold") || value.toLowerCase().includes("starlight") ? "#374151" : "#fff" }}
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    }
                    // Fallback to text pill for unknown colors
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={!wouldMatch}
                        onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attrKey]: value }))}
                        className={`px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all ${
                          isSelected ? "border-red-600 bg-red-50 text-red-700" : wouldMatch ? "border-gray-300 bg-white hover:border-red-400 text-gray-700" : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : isSize ? (
                // Size / storage pills — slightly larger, bold
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selectedAttributes[attrKey] === value;
                    const wouldMatch = (product?.variants ?? []).some((v) =>
                      Object.entries({ ...selectedAttributes, [attrKey]: value }).every(
                        ([k, val]) => v.attributes?.[k] === val
                      )
                    );
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={!wouldMatch}
                        onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attrKey]: value }))}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          isSelected
                            ? "border-red-600 bg-red-600 text-white shadow-md"
                            : wouldMatch
                            ? "border-gray-300 bg-white hover:border-red-400 text-gray-800"
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Generic attribute — outlined pills
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selectedAttributes[attrKey] === value;
                    const wouldMatch = (product?.variants ?? []).some((v) =>
                      Object.entries({ ...selectedAttributes, [attrKey]: value }).every(
                        ([k, val]) => v.attributes?.[k] === val
                      )
                    );
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={!wouldMatch}
                        onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attrKey]: value }))}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-red-600 bg-red-50 text-red-700"
                            : wouldMatch
                            ? "border-gray-300 bg-white hover:border-red-400 text-gray-700"
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
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
        {selectedVariant?.sku && (
          <p className="text-xs text-gray-400">SKU: {selectedVariant.sku}</p>
        )}
      </div>
    );
  };

  // ─── Reviews tab content ──────────────────────────────────────────────────────
  const renderReviewsTab = () => {
    const avg = product?.rating || 0;
    const total = visibleReviews.length;

    return (
      <div className="space-y-6">
        {/* Rating summary */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          <div className="flex flex-col items-center justify-center text-center min-w-[100px]">
            <span className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</span>
            <StarDisplay rating={avg} size="md" />
            <span className="mt-1 text-sm text-gray-500">{total} review{total !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingCounts.map(({ star, count }) => (
              <RatingBar key={star} label={String(star)} count={count} total={total} />
            ))}
          </div>
        </div>

        {/* Write a review */}
        {loggedIn && !userAlreadyReviewed && !reviewSubmitted && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <h4 className="font-semibold text-gray-900 mb-3">Write a Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Your Rating</label>
                <StarInput value={reviewRating} onChange={setReviewRating} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Your Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
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
            <button onClick={() => navigate("/login")} className="text-red-600 font-semibold hover:underline">
              Log in
            </button>{" "}
            to write a review.
          </div>
        )}

        {/* Review list */}
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-t-red-600 border-r-red-200 border-b-red-200 border-l-red-200 rounded-full"
            />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {(isAdmin ? reviews : visibleReviews).map((review: Review) => (
              <div
                key={review.id}
                className={`border rounded-xl p-4 transition-all ${
                  !review.isVisible ? "border-dashed border-gray-300 bg-gray-50 opacity-70" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(review.user?.name || review.reviewerName || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-900">
                        {review.user?.name || review.reviewerName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StarDisplay rating={review.rating} />
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        {isAdmin && !review.isVisible && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">Hidden</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        title={review.isVisible ? "Hide review" : "Show review"}
                        onClick={() => handleToggleVisibility(review.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {review.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        title="Delete review"
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2.5 text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── Tab content router ───────────────────────────────────────────────────────
  const renderTabContent = () => {
    if (!product) return null;
    switch (activeTab) {
      case "details":
        return (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Product Details</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {product.description || "Experience exceptional quality with this premium product."}
            </p>
            {product.keyFeatures && Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {product.keyFeatures.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                      <span className="text-red-600 font-bold">{index + 1}.</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case "specifications":
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Technical Specifications</h3>
            {product.specifications && typeof product.specifications === "object" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 gap-1">
                    <span className="text-sm sm:text-base pr-0 sm:pr-10 text-gray-600 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No specifications available.</p>
            )}
          </div>
        );
      case "reviews":
        return renderReviewsTab();
      case "related":
        return (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Related Products</h3>
            <p className="text-sm text-gray-600">Related products will be displayed here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // ─── Loading / error states ───────────────────────────────────────────────────
  if (loading) {
    return (
      <PageLayout className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-red-600 border-r-red-200 border-b-red-200 border-l-red-200 rounded-full"
        />
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <Package className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all text-sm"
          >
            Back to Products
          </button>
        </div>
      </PageLayout>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────────
  return (
    <PageLayout className="min-h-screen bg-white">
      <Toaster />
      <div className="max-w-7xl mx-auto pt-0 sm:pt-28 lg:pt-32 xl:pt-32 px-3 sm:px-4 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-red-600 mb-4 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <ProductImage
                src={product.image}
                index={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
                fallbackUrl="/placeholder.jpg"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }, (_, index) => (
                <ProductImage
                  key={index}
                  src={product.image}
                  index={index}
                  alt={`${product.name} ${index + 1}`}
                  className={`aspect-square rounded-xl object-cover cursor-pointer border transition-all ${
                    selectedImage === index ? "border-red-400 shadow-md" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedImage(index)}
                  fallbackUrl="/placeholder.jpg"
                />
              )).filter((_, index) => getImageUrl(product.image, index) !== null)}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-1">
                <StarDisplay rating={product.rating || 0} size="md" />
                <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-red-600">
                  {formatPrice(getPriceAsNumber(selectedVariant?.price ?? product.finalPrice) * quantity)}
                </span>
                {getPriceAsNumber(selectedVariant?.compareAtPrice) > getPriceAsNumber(selectedVariant?.price) && (
                  <>
                    <span className="text-base text-gray-500 line-through">
                      {formatPrice(getPriceAsNumber(selectedVariant?.compareAtPrice) * quantity)}
                    </span>
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                      -{calculateDiscount(selectedVariant?.compareAtPrice, selectedVariant?.price)}% OFF
                    </span>
                  </>
                )}
              </div>
              {quantity > 1 && (
                <p className="text-xs text-gray-500">
                  {formatPrice(selectedVariant?.price ?? product.finalPrice)} each
                </p>
              )}
            </div>

            {/* Variant selector */}
            {renderVariantSelector()}

            {/* Stock + meta */}
            <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Availability</span>
                <span className={`font-semibold ${(selectedVariant?.quantity ?? 0) > 0 ? "text-green-600" : "text-red-600"}`}>
                  {(selectedVariant?.quantity ?? 0) > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              {product.sku && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">SKU</span>
                  <span className="text-gray-900">{product.sku}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Category</span>
                <span className="text-gray-900">{product.category}</span>
              </div>
            </div>

            {/* Quantity + actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900 text-sm">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-2xl bg-white">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="p-2.5 hover:bg-gray-100 rounded-l-2xl transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-5 py-2.5 min-w-[3.5rem] text-center font-semibold text-gray-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="p-2.5 hover:bg-gray-100 rounded-r-2xl transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={addingToCart || (selectedVariant?.quantity ?? 0) === 0}
                  className={`flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
                    addingToCart || (selectedVariant?.quantity ?? 0) === 0 ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {addingToCart ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full"
                    />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {addingToCart ? "Adding..." : (selectedVariant?.quantity ?? 0) === 0 ? "Out of Stock" : "Add to Cart"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className={`p-3.5 rounded-2xl border-2 transition-all ${
                    isWishlisted ? "border-red-600 bg-red-50 text-red-600" : "border-gray-300 bg-white hover:border-red-600 hover:text-red-600 text-gray-600"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-t border-gray-200"
        >
          <div className="border-b border-gray-200 mb-4 sm:mb-6">
            <nav className="-mb-px flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="min-h-[300px] bg-gray-50 rounded-xl p-4 sm:p-6 border mb-2 text-gray-800">
            {renderTabContent()}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ProductDetailPage;
