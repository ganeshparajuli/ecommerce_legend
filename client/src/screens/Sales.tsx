import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSales,
  getSaleProducts,
  getSaleGifts,
  calculateCartGifts,
} from "../redux/actions/salesAction";
import { getAllProducts } from "../redux/actions/productAction";
import { ProductImage } from "./../utils/imageHelper";
import { addToCart } from "../redux/actions/cartAction";
import {
  PageLayout,
  Breadcrumb,
} from "../screens/Homepage/sections/NavbarSection/NavbarSection";
import toast from "react-hot-toast";
import PremiumFooter from "../components/PremiumFooter";

// Type definitions
interface Sale {
  id: string | number;
  name: string;
  description: string;
  status: string;
  endDate?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  productCount: number;
  hasGifts?: boolean;
}

interface Product {
  id: string | number;
  name: string;
  image: string;
  description?: string;
  finalPrice: number;
  discountPrice?: number;
  stock?: number;
  quantity?: number;
}

interface SaleProduct extends Product {
  originalPrice: number;
  salePrice: number;
  discount: number;
}

// NEW: Gift-related interfaces
interface ApplicableGift {
  type: "sale_gift" | "product_gift";
  giftProductId: string;
  giftProductName: string;
  giftProductImage?: string;
  giftQuantity: number;
  mainProductId?: string;
  reason: string;
  value?: number;
}

interface SaleGift {
  id: string;
  saleId: string;
  giftProductId: string;
  giftProductName: string;
  giftProductImage?: string;
  giftQuantity: number;
  minPurchaseAmount: number;
  minQuantity: number;
  maxGiftsPerOrder: number;
}

interface ProductGift {
  id: string;
  saleId: string;
  mainProductId: string;
  mainProductName: string;
  giftProductId: string;
  giftProductName: string;
  giftProductImage?: string;
  giftQuantity: number;
  minMainQuantity: number;
  maxGiftsPerOrder: number;
}

interface GiftData {
  saleGifts: SaleGift[];
  productGifts: ProductGift[];
}

interface User {
  id: string | number;
  // Add other user properties as needed
}

interface SaleInfo {
  originalPrice: number;
  salePrice: number;
  discount: number;
  saleId: string | number | null;
  saleName: string;
  // NEW: Gift info
  applicableGifts?: ApplicableGift[];
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Redux state interfaces
interface SalesState {
  sales: Sale[];
  products: Product[];
  gifts: GiftData | null;
  applicableGifts: ApplicableGift[];
  loading: boolean;
  giftLoading: boolean;
  error: string | null;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
}

interface UserState {
  user: User | null;
}

interface RootState {
  sales: SalesState;
  products: ProductsState;
  user: UserState;
}

// Action response interface
interface SaleProductsResponse {
  data?: {
    products: Product[];
  };
}

const Sales: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Reference to track the active sale ID across renders
  const activeSaleIdRef = useRef<string | number | null>(null);

  // Get data from Redux store
  const {
    sales = [],
    products: saleProductsFromRedux = [],
    gifts,
    applicableGifts,
    loading: salesLoading,
    giftLoading,
    error: salesError,
  } = useSelector((state: RootState) => state.sales);

  const [processedGifts, setProcessedGifts] = useState<{
    saleGifts: SaleGift[];
    productGifts: ProductGift[];
  }>({
    saleGifts: [],
    productGifts: [],
  });
  const { products: allProducts = [], loading: productsLoading } = useSelector(
    (state: RootState) => state.products
  );

  const { user } = useSelector((state: RootState) => state.user);

  const [activeSale, setActiveSale] = useState<Sale | null>(null);
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [cartItems, setCartItems] = useState<
    Array<{ productId: string; quantity: number; price: number }>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (gifts) {
      console.log("Processing gifts data:", gifts);

      // Map snake_case API response to camelCase
      const mapSaleGifts = (saleGifts: any[]): SaleGift[] => {
        return saleGifts.map((gift) => ({
          id: gift.id || gift.gift_id,
          saleId: gift.sale_id || gift.saleId,
          giftProductId:
            gift.gift_product_id || gift.product_id || gift.giftProductId,
          giftProductName:
            gift.product_name || gift.giftProductName || "Gift Product",
          giftProductImage: gift.product_image || gift.giftProductImage,
          giftQuantity: Number(gift.gift_quantity || gift.giftQuantity) || 1,
          minPurchaseAmount:
            parseFloat(gift.min_purchase_amount || gift.minPurchaseAmount) || 0,
          minQuantity: Number(gift.min_quantity || gift.minQuantity) || 1,
          maxGiftsPerOrder:
            Number(gift.max_gifts_per_order || gift.maxGiftsPerOrder) || 1,
        }));
      };

      const mapProductGifts = (productGifts: any[]): ProductGift[] => {
        return productGifts.map((gift) => ({
          id: gift.id || gift.gift_id,
          saleId: gift.sale_id || gift.saleId,
          mainProductId: gift.main_product_id || gift.mainProductId,
          mainProductName:
            gift.main_product_name || gift.mainProductName || "Main Product",
          giftProductId: gift.gift_product_id || gift.giftProductId,
          giftProductName:
            gift.gift_product_name || gift.giftProductName || "Gift Product",
          giftProductImage: gift.gift_product_image || gift.giftProductImage,
          giftQuantity: Number(gift.gift_quantity || gift.giftQuantity) || 1,
          minMainQuantity:
            Number(gift.min_main_quantity || gift.minMainQuantity) || 1,
          maxGiftsPerOrder:
            Number(gift.max_gifts_per_order || gift.maxGiftsPerOrder) || 1,
        }));
      };

      const processedSaleGifts = mapSaleGifts(gifts.saleGifts || []);
      const processedProductGifts = mapProductGifts(gifts.productGifts || []);

      setProcessedGifts({
        saleGifts: processedSaleGifts,
        productGifts: processedProductGifts,
      });

      console.log("Processed gifts:", {
        saleGifts: processedSaleGifts.length,
        productGifts: processedProductGifts.length,
      });
    }
  }, [gifts]);

  // Fetch all sales and products
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        console.log("Fetching all sales and products...");

        // First get all products
        await dispatch(getAllProducts() as any);

        // Then get all sales
        await dispatch(getAllSales() as any);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load sales data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // NEW: Fetch sale gifts when active sale changes
  useEffect(() => {
    const fetchSaleGifts = async () => {
      if (activeSale && activeSale.id) {
        try {
          console.log("Fetching gifts for sale:", activeSale.id);
          await dispatch(getSaleGifts(String(activeSale.id)) as any);
        } catch (err) {
          console.error("Error fetching sale gifts:", err);
        }
      }
    };

    fetchSaleGifts();
  }, [activeSale, dispatch]);

  // NEW: Calculate applicable gifts when cart items change
  useEffect(() => {
    const calculateGifts = async () => {
      if (activeSale && activeSale.id && cartItems.length > 0) {
        try {
          console.log("Calculating applicable gifts for cart:", cartItems);
          await dispatch(
            calculateCartGifts(String(activeSale.id), cartItems) as any
          );
        } catch (err) {
          console.error("Error calculating gifts:", err);
        }
      }
    };

    // Debounce gift calculation
    const timeoutId = setTimeout(calculateGifts, 500);
    return () => clearTimeout(timeoutId);
  }, [cartItems, activeSale, dispatch]);

  // Process sale products and ensure they persist
  const processSaleProducts = useCallback(
    async (currentActiveSale: Sale): Promise<void> => {
      try {
        // Skip if we already processed this sale
        if (
          activeSaleIdRef.current === currentActiveSale.id &&
          saleProducts.length > 0
        ) {
          console.log("Already processed this sale, using existing products");
          return;
        }

        // Update the active sale ID ref
        activeSaleIdRef.current = currentActiveSale.id;

        // Fetch the products for this sale
        console.log("Fetching products for sale ID:", currentActiveSale.id);
        const saleProductsResponse = (await dispatch(
          getSaleProducts(currentActiveSale.id) as any
        )) as SaleProductsResponse;

        // Check for products in response or Redux store
        let productData: Product[] | (string | number)[] = [];

        if (
          saleProductsResponse &&
          saleProductsResponse.data &&
          saleProductsResponse.data.products
        ) {
          productData = saleProductsResponse.data.products;
          console.log("Using products from API response:", productData);
        } else if (saleProductsFromRedux && saleProductsFromRedux.length > 0) {
          productData = saleProductsFromRedux;
          console.log("Using products from Redux state:", productData);
        }

        // Process products based on their format
        let discountedProducts: SaleProduct[] = [];

        if (productData.length > 0) {
          if (typeof productData[0] === "object" && productData[0] !== null) {
            // If we have complete product objects
            console.log("Processing complete product objects");
            discountedProducts = (productData as Product[]).map((product) => {
              const originalPrice =
                parseFloat(String(product.finalPrice)) ||
                parseFloat(String(product.discountPrice)) ||
                0;

              // Calculate discount
              const discountAmount =
                currentActiveSale.discountType === "percentage"
                  ? (originalPrice * currentActiveSale.discountValue) / 100
                  : currentActiveSale.discountValue;

              const salePrice = Math.max(0, originalPrice - discountAmount);

              return {
                ...product,
                originalPrice,
                salePrice,
                discount:
                  currentActiveSale.discountType === "percentage"
                    ? currentActiveSale.discountValue
                    : Math.round((discountAmount / originalPrice) * 100) || 0,
              };
            });
          } else {
            // If we have product IDs
            console.log("Processing product IDs:", productData);
            discountedProducts = (productData as (string | number)[])
              .map((productId) => {
                // Find matching product in all products
                const product = allProducts.find((p) => p.id === productId);

                if (!product) return null;

                const originalPrice =
                  parseFloat(String(product.finalPrice)) ||
                  parseFloat(String(product.discountPrice)) ||
                  0;

                // Calculate discount
                const discountAmount =
                  currentActiveSale.discountType === "percentage"
                    ? (originalPrice * currentActiveSale.discountValue) / 100
                    : currentActiveSale.discountValue;

                const salePrice = Math.max(0, originalPrice - discountAmount);

                return {
                  ...product,
                  originalPrice,
                  salePrice,
                  discount:
                    currentActiveSale.discountType === "percentage"
                      ? currentActiveSale.discountValue
                      : Math.round((discountAmount / originalPrice) * 100) || 0,
                };
              })
              .filter((product): product is SaleProduct => product !== null);
          }

          if (discountedProducts.length > 0) {
            console.log(
              "Found discounted products:",
              discountedProducts.length
            );
            setSaleProducts(discountedProducts);
            return;
          }
        }

        // Fallback approach if no products returned but sale has products
        if (currentActiveSale.productCount > 0) {
          console.log("Using random products as fallback");
          const randomProducts: SaleProduct[] = allProducts
            .slice(0, currentActiveSale.productCount)
            .map((product) => {
              const originalPrice =
                parseFloat(String(product.finalPrice)) ||
                parseFloat(String(product.discountPrice)) ||
                0;

              // Calculate discount
              const discountAmount =
                currentActiveSale.discountType === "percentage"
                  ? (originalPrice * currentActiveSale.discountValue) / 100
                  : currentActiveSale.discountValue;

              const salePrice = Math.max(0, originalPrice - discountAmount);

              return {
                ...product,
                originalPrice,
                salePrice,
                discount:
                  currentActiveSale.discountType === "percentage"
                    ? currentActiveSale.discountValue
                    : Math.round((discountAmount / originalPrice) * 100) || 0,
              };
            });

          setSaleProducts(randomProducts);
        } else {
          console.log("No products found for this sale");
          setSaleProducts([]);
        }
      } catch (err) {
        console.error("Error processing sale products:", err);
        setError("Failed to load sale products. Please try again later.");
      }
    },
    [dispatch, allProducts, saleProductsFromRedux, saleProducts.length]
  );

  // Find active sale and its products
  useEffect(() => {
    const processSales = async (): Promise<void> => {
      if (loading || sales.length === 0) {
        return;
      }

      console.log("Processing sales...");

      // Find active sales
      const activeSales = sales.filter((sale) => sale.status === "active");
      console.log("Active sales found:", activeSales.length);

      if (activeSales.length === 0) {
        // If no active sales, use default products with mock discounts
        if (allProducts.length > 0) {
          console.log("No active sales, using default products with discounts");
          const defaultProducts: SaleProduct[] = allProducts
            .slice(0, 6)
            .map((product) => ({
              ...product,
              originalPrice: product.finalPrice,
              salePrice: Math.max(0, product.finalPrice * 0.8), // 20% discount as default
              discount: 20,
            }));

          setSaleProducts(defaultProducts);
        }
        return;
      }

      // Use the first active sale
      const currentActiveSale = activeSales[0];
      setActiveSale(currentActiveSale);

      // Process the sale products
      await processSaleProducts(currentActiveSale);
    };

    processSales();
  }, [sales, allProducts, loading, processSaleProducts]);

  // Countdown timer for the active sale
  useEffect(() => {
    if (!activeSale || !activeSale.endDate) return;

    const saleEndDate = new Date(activeSale.endDate);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = saleEndDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSale]);

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price || 0);
  };

  // NEW: Update cart items when products are added
  const updateCartItems = (
    productId: string,
    quantity: number,
    price: number
  ) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { productId, quantity, price }];
      }
    });
  };

  const addCartHandler = async (
    e: React.MouseEvent<HTMLButtonElement>,
    product: SaleProduct
  ): Promise<void> => {
    e.stopPropagation();
    const activeSaleData = activeSale || sales[0]; // First active sale

    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      toast.loading("Adding to cart...", { id: "add-to-cart" });

      // Calculate sale price for FIXED discount type
      let salePrice: number, discount: number;
      if (activeSaleData && activeSaleData.discountType === "fixed") {
        // Fixed discount: Subtract fixed amount from original price
        salePrice = Math.max(
          0,
          product.finalPrice - activeSaleData.discountValue
        );

        // Calculate discount percentage
        discount = Math.round(
          (activeSaleData.discountValue / product.finalPrice) * 100
        );
      } else if (
        activeSaleData &&
        activeSaleData.discountType === "percentage"
      ) {
        // Percentage discount
        salePrice =
          product.finalPrice * (1 - activeSaleData.discountValue / 100);
        discount = activeSaleData.discountValue;
      } else {
        // No discount
        salePrice = product.finalPrice;
        discount = 0;
      }

      // Create sale info object with gifts
      const saleInfo: SaleInfo = {
        originalPrice: product.finalPrice,
        salePrice: salePrice,
        discount: discount,
        saleId: activeSaleData ? activeSaleData.id : null,
        saleName: activeSaleData ? activeSaleData.name : "Sale",
        applicableGifts: applicableGifts, // Include current applicable gifts
      };

      console.log("Detailed Sale Calculation:", {
        productOriginalPrice: product.finalPrice,
        saleDiscountType: activeSaleData?.discountType,
        saleDiscountValue: activeSaleData?.discountValue,
        calculatedSalePrice: salePrice,
        calculatedDiscount: discount,
        applicableGifts: applicableGifts.length,
      });

      const result = await dispatch(addToCart(product.id, 1, saleInfo) as any);
      toast.dismiss("add-to-cart");

      if (result === "success") {
        toast.success("Added to cart");
        // Update cart items for gift calculation
        updateCartItems(String(product.id), 1, salePrice);
      } else if (result === "login-required") {
        toast.error("Please login to add items to cart");
        navigate("/login");
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      toast.dismiss("add-to-cart");
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart");
    }
  };

  const AvailableGiftsSection: React.FC = () => {
    const { saleGifts, productGifts } = processedGifts;

    if (!saleGifts.length && !productGifts.length) return null;

    return (
      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-2 border-pink-200 rounded-3xl p-8 mb-12 shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="text-4xl animate-bounce">🎁</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              FREE GIFTS AVAILABLE!
            </h2>
            <div className="text-4xl animate-bounce">🎁</div>
          </div>
          <p className="text-lg text-gray-600">
            Add qualifying items to your cart and get these amazing gifts for
            FREE!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sale-Level Gifts */}
          {saleGifts.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-pink-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full text-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Spend & Get Gifts
                </h3>
              </div>
              <div className="space-y-4">
                {saleGifts.map((gift, index) => (
                  <div
                    key={gift.id || index}
                    className="bg-pink-50 rounded-xl p-4 border border-pink-200"
                  >
                    <div className="flex items-center gap-4">
                      {gift.giftProductImage && (
                        <ProductImage
                          src={gift.giftProductImage}
                          alt={gift.giftProductName}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-pink-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-800 mb-1">
                          {gift.giftProductName}
                          <span className="ml-2 px-2 py-1 bg-pink-200 text-pink-800 text-sm rounded-full">
                            x{gift.giftQuantity}
                          </span>
                        </div>
                        <div className="text-pink-600 font-semibold mb-2">
                          💰 Spend {formatPrice(gift.minPurchaseAmount)}+
                          {gift.minQuantity > 1 &&
                            ` with ${gift.minQuantity}+ items`}
                        </div>
                        <div className="text-xs text-gray-600">
                          Max {gift.maxGiftsPerOrder} gift(s) per order
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          FREE
                        </div>
                        <div className="text-xs text-gray-500">
                          when qualified
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product-Specific Gifts */}
          {productGifts.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Buy & Get Gifts
                </h3>
              </div>
              <div className="space-y-4">
                {productGifts.map((gift, index) => (
                  <div
                    key={gift.id || index}
                    className="bg-purple-50 rounded-xl p-4 border border-purple-200"
                  >
                    <div className="flex items-center gap-4">
                      {gift.giftProductImage && (
                        <ProductImage
                          src={gift.giftProductImage}
                          alt={gift.giftProductName}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-800 mb-1">
                          {gift.giftProductName}
                          <span className="ml-2 px-2 py-1 bg-purple-200 text-purple-800 text-sm rounded-full">
                            x{gift.giftQuantity}
                          </span>
                        </div>
                        <div className="text-purple-600 font-semibold mb-2">
                          🛒 Buy {gift.minMainQuantity}x {gift.mainProductName}
                        </div>
                        <div className="text-xs text-gray-600">
                          Max {gift.maxGiftsPerOrder} gift(s) per order
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          FREE
                        </div>
                        <div className="text-xs text-gray-500">
                          when qualified
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold shadow-lg">
            <span>🛍️</span>
            <span>Start Shopping to Unlock Your Gifts!</span>
            <span>✨</span>
          </div>
        </div>
      </div>
    );
  };

  const GiftDisplay: React.FC = () => {
    if (!applicableGifts || applicableGifts.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl animate-pulse">🎉</div>
          <h3 className="text-2xl font-bold text-green-800">
            Congratulations! Your Free Gifts:
          </h3>
        </div>
        <div className="grid gap-4">
          {applicableGifts.map((gift, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-green-200"
            >
              {gift.giftProductImage && (
                <ProductImage
                  src={gift.giftProductImage}
                  alt={gift.giftProductName}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-green-300"
                />
              )}
              <div className="flex-1">
                <div className="font-bold text-xl text-gray-800 mb-1">
                  {gift.giftProductName}
                  <span className="ml-2 px-3 py-1 bg-green-200 text-green-800 text-sm rounded-full">
                    x{gift.giftQuantity}
                  </span>
                </div>
                <div className="text-green-600 font-medium">{gift.reason}</div>
                {gift.value && (
                  <div className="text-sm text-gray-600">
                    Value: {formatPrice(gift.value)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">FREE</div>
                <div className="text-sm text-green-700 font-medium">
                  Added to cart!
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ENHANCED: Helper function to check if product has gifts
  const getProductGifts = (productId: string | number) => {
    return processedGifts.productGifts.filter(
      (gift) => gift.mainProductId === String(productId)
    );
  };

  // ENHANCED: Helper function to format gift text
  const formatGiftText = (gifts: ProductGift[]) => {
    if (gifts.length === 0) return null;
    const gift = gifts[0]; // Show first gift
    return `Buy ${gift.minMainQuantity}+ get ${gift.giftProductName} FREE!`;
  };

  // // NEW: Component to display gift eligibility hints
  // const GiftEligibilityHints: React.FC = () => {
  //   if (!gifts || (!gifts.saleGifts.length && !gifts.productGifts.length))
  //     return null;

  //   return (
  //     <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8">
  //       <div className="flex items-center gap-3 mb-4">
  //         <div className="text-2xl">✨</div>
  //         <h3 className="text-lg font-bold text-blue-800">
  //           Unlock Free Gifts!
  //         </h3>
  //       </div>
  //       <div className="grid gap-3">
  //         {gifts.saleGifts.map((gift) => (
  //           <div key={gift.id} className="text-sm text-blue-700">
  //             💝 Spend {formatPrice(gift.minPurchaseAmount)}+ and get{" "}
  //             <strong>{gift.giftProductName}</strong> free!
  //           </div>
  //         ))}
  //         {gifts.productGifts.map((gift) => (
  //           <div key={gift.id} className="text-sm text-blue-700">
  //             🎯 Buy {gift.minMainQuantity}x{" "}
  //             <strong>{gift.mainProductName}</strong> and get{" "}
  //             <strong>{gift.giftProductName}</strong> free!
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  if (loading || salesLoading || productsLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || salesError) {
    return (
      <PageLayout>
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <div className="text-center p-8 max-w-md bg-white rounded-2xl shadow-lg">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">{error || salesError}</p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Breadcrumb
        items={[
          { name: "Home", link: "/" },
          { name: "Sales", link: "/sales" },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Modern Hero Banner */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-gray-700 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Live Sale Event
                {/* NEW: Gift indicator */}
                {activeSale?.hasGifts && (
                  <span className="ml-3 inline-flex items-center">
                    <span className="text-yellow-500 mr-1">🎁</span>
                    <span className="text-xs">Free Gifts Available</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 sm:mb-6">
                {activeSale ? activeSale.name : "Seasonal Sale Event"}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                {activeSale
                  ? activeSale.description
                  : "Discover amazing deals with up to 50% off on selected premium items!"}
              </p>

              {/* Modern Countdown Timer */}
              {activeSale && activeSale.endDate && (
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                  {[
                    { value: timeLeft.days, label: "Days" },
                    { value: timeLeft.hours, label: "Hours" },
                    { value: timeLeft.minutes, label: "Minutes" },
                    { value: timeLeft.seconds, label: "Seconds" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 sm:p-6 w-20 sm:w-24 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {item.value}
                      </div>
                      <div className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 font-medium">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
              >
                <span>Shop Now</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Gift Sections */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Show all available gifts prominently */}
          <AvailableGiftsSection />

          {/* Show applicable gifts from current cart */}
          <GiftDisplay />
        </div>

        {/* Modern Products Section */}
        <div
          id="products"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
        >
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              {activeSale ? `${activeSale.name} Products` : "Sale Products"}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>

            {/* Show gift summary */}
            {(processedGifts.saleGifts.length > 0 ||
              processedGifts.productGifts.length > 0) && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                <span className="text-2xl">🎁</span>
                <span className="font-semibold text-gray-700">
                  {processedGifts.saleGifts.length +
                    processedGifts.productGifts.length}{" "}
                  free gifts available with qualifying purchases!
                </span>
              </div>
            )}
          </div>

          {/* Loading indicator for gifts */}
          {giftLoading && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                <span className="text-sm">Calculating your gifts...</span>
              </div>
            </div>
          )}

          {saleProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                No Sale Products Available
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We're currently updating our sale collection. Check back soon
                for amazing deals!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {saleProducts.map((product) => {
                const productGifts = getProductGifts(product.id);
                const hasProductGifts = productGifts.length > 0;
                const giftText = formatGiftText(productGifts);

                return (
                  <div
                    key={product.id}
                    className={`group bg-white rounded-2xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 border ${
                      hasProductGifts
                        ? "border-yellow-300 ring-2 ring-yellow-200"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="relative overflow-hidden">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Discount Badge */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {product.discount}% OFF
                      </div>

                      {/* ENHANCED: Gift Badge */}
                      {hasProductGifts && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                          🎁 FREE GIFT
                        </div>
                      )}

                      {/* Sale-level gift indicator */}
                      {processedGifts.saleGifts.length > 0 &&
                        !hasProductGifts && (
                          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            💝 Gift Eligible
                          </div>
                        )}

                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description
                          ? product.description.length > 80
                            ? product.description.substring(0, 80) + "..."
                            : product.description
                          : "Premium quality product with excellent features"}
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-blue-600">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            (product.stock || product.quantity || 0) < 5
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {(product.stock || product.quantity || 0) < 5
                            ? `Only ${
                                product.stock || product.quantity || 0
                              } left!`
                            : `${
                                product.stock || product.quantity || 0
                              } in stock`}
                        </span>
                      </div>

                      {/* ENHANCED: Product-specific gift display */}
                      {hasProductGifts && (
                        <div className="mb-4 space-y-2">
                          {productGifts.map((gift, index) => (
                            <div
                              key={gift.id || index}
                              className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🎁</span>
                                <span className="font-bold text-yellow-800 text-sm">
                                  FREE GIFT INCLUDED!
                                </span>
                              </div>
                              <div className="text-xs text-yellow-700 font-medium">
                                Buy {gift.minMainQuantity}+ of this item
                              </div>
                              <div className="text-xs text-yellow-600">
                                Get <strong>{gift.giftProductName}</strong> x
                                {gift.giftQuantity} FREE!
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Sale-level gift hint */}
                      {!hasProductGifts &&
                        processedGifts.saleGifts.length > 0 && (
                          <div className="mb-3 p-2 bg-pink-50 border border-pink-200 rounded-lg">
                            <div className="text-xs text-pink-700 font-medium">
                              💝 Add to cart to qualify for free gifts!
                            </div>
                          </div>
                        )}

                      <button
                        onClick={(e) => addCartHandler(e, product)}
                        className={`w-full px-4 py-3 font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 ${
                          hasProductGifts
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l4.5-6M7 13h10m0 0l1.5 6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                          />
                        </svg>
                        {hasProductGifts
                          ? "Add to Cart + Get Gift!"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <PremiumFooter />
    </PageLayout>
  );
};

export default Sales;
