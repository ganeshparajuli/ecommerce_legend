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

const resolvePrice = (p: Record<string, unknown>): number => {
  // defaultVariant from controller getter
  const dv = p.defaultVariant as Record<string, unknown> | null | undefined;
  const dvPrice = parseFloat(String(dv?.price ?? 0));
  if (dvPrice > 0) return dvPrice;

  // priceRange fallback
  const pr = p.priceRange as Record<string, unknown> | null | undefined;
  const prMin = parseFloat(String(pr?.min ?? 0));
  if (prMin > 0) return prMin;

  // variants[0] fallback in case defaultVariant is null
  const variants = p.variants as Array<Record<string, unknown>> | null | undefined;
  if (Array.isArray(variants) && variants.length > 0) {
    const vPrice = parseFloat(String(variants[0].price ?? 0));
    if (vPrice > 0) return vPrice;
  }

  // Flat-price fallback for any other schema
  return parseFloat(String(p.actualPrice ?? p.actual_price ?? p.finalPrice ?? p.final_price ?? p.price ?? p.discountPrice ?? 0)) || 0;
};

const resolveImage = (p: Record<string, unknown>): string | null => {
  // Sequelize association: images: [{ url }]
  const imgs = p.images as Array<Record<string, unknown>> | null | undefined;
  if (Array.isArray(imgs) && imgs.length > 0) return String(imgs[0].url ?? "");
  // Flat string fallback
  const flat = p.image ?? p.product_images ?? p.thumbnail ?? null;
  return flat ? String(flat) : null;
};

const resolveComparePrice = (p: Record<string, unknown>): number => {
  const dv = p.defaultVariant as Record<string, unknown> | null | undefined;
  const cap = parseFloat(String(dv?.compareAtPrice ?? 0));
  if (cap > 0) return cap;
  const variants = p.variants as Array<Record<string, unknown>> | null | undefined;
  if (Array.isArray(variants) && variants.length > 0) {
    const vc = parseFloat(String(variants[0].compareAtPrice ?? 0));
    if (vc > 0) return vc;
  }
  return 0;
};

const resolveStock = (p: Record<string, unknown>): number => {
  const dv = p.defaultVariant as Record<string, unknown> | null | undefined;
  if (dv?.quantity !== undefined) return Number(dv.quantity);
  const variants = p.variants as Array<Record<string, unknown>> | null | undefined;
  if (Array.isArray(variants)) return variants.reduce((sum, v) => sum + Number(v.quantity ?? 0), 0);
  return Number(p.stock ?? p.quantity ?? 0);
};

const mapProductToSaleProduct = (product: Record<string, unknown>, sale: Sale): SaleProduct => {
  const variantPrice = resolvePrice(product);         // actual selling price
  const comparePrice = resolveComparePrice(product);  // crossed-out original price
  // originalPrice = compareAtPrice if available, else variantPrice (so we can apply sale discount to it)
  const originalPrice = comparePrice > 0 ? comparePrice : variantPrice;
  const discountAmount = sale.discountType === "percentage"
    ? (variantPrice * sale.discountValue) / 100
    : sale.discountValue;
  const salePrice = Math.max(0, variantPrice - discountAmount);
  const discount = sale.discountType === "percentage"
    ? sale.discountValue
    : variantPrice > 0 ? Math.round((discountAmount / variantPrice) * 100) : 0;
  const stock = resolveStock(product);
  return {
    ...(product as unknown as Product),
    image: resolveImage(product) as string,
    stock,
    quantity: stock,
    originalPrice,
    salePrice,
    discount,
  };
};

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
            discountedProducts = (productData as unknown as Record<string, unknown>[]).map(
              (product) => mapProductToSaleProduct(product, currentActiveSale)
            );
          } else {
            // If we have product IDs
            console.log("Processing product IDs:", productData);
            discountedProducts = (productData as (string | number)[])
              .map((productId) => {
                const product = (allProducts as any[]).find((p) => p.id === productId);
                if (!product) return null;
                return mapProductToSaleProduct(product, currentActiveSale);
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
          const randomProducts: SaleProduct[] = (allProducts as any[])
            .slice(0, currentActiveSale.productCount)
            .map((product) => mapProductToSaleProduct(product, currentActiveSale));

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
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-6 bg-amber-500 rounded-full" />
          <div>
            <h2 className="text-base font-bold text-gray-900">Free Gifts Available</h2>
            <p className="text-xs text-gray-500 mt-0.5">Add qualifying items to your cart to unlock</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {saleGifts.map((gift, index) => (
            <div key={gift.id || index} className="flex items-center gap-3 bg-white border border-amber-200 rounded-xl p-3">
              {gift.giftProductImage && (
                <ProductImage src={gift.giftProductImage} alt={gift.giftProductName} className="w-12 h-12 object-contain rounded-lg border border-gray-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{gift.giftProductName} <span className="text-xs font-normal text-gray-500">×{gift.giftQuantity}</span></p>
                <p className="text-xs text-amber-700 font-medium mt-0.5">Spend {formatPrice(gift.minPurchaseAmount)}+{gift.minQuantity > 1 ? ` with ${gift.minQuantity}+ items` : ""}</p>
                <p className="text-[10px] text-gray-400">Max {gift.maxGiftsPerOrder} per order</p>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded flex-shrink-0">FREE</span>
            </div>
          ))}

          {productGifts.map((gift, index) => (
            <div key={gift.id || index} className="flex items-center gap-3 bg-white border border-amber-200 rounded-xl p-3">
              {gift.giftProductImage && (
                <ProductImage src={gift.giftProductImage} alt={gift.giftProductName} className="w-12 h-12 object-contain rounded-lg border border-gray-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{gift.giftProductName} <span className="text-xs font-normal text-gray-500">×{gift.giftQuantity}</span></p>
                <p className="text-xs text-amber-700 font-medium mt-0.5">Buy {gift.minMainQuantity}× {gift.mainProductName}</p>
                <p className="text-[10px] text-gray-400">Max {gift.maxGiftsPerOrder} per order</p>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded flex-shrink-0">FREE</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const GiftDisplay: React.FC = () => {
    if (!applicableGifts || applicableGifts.length === 0) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-bold text-green-800">Your Free Gifts</h3>
        </div>
        <div className="space-y-2">
          {applicableGifts.map((gift, index) => (
            <div key={index} className="flex items-center gap-3 bg-white border border-green-200 rounded-xl p-3">
              {gift.giftProductImage && (
                <ProductImage src={gift.giftProductImage} alt={gift.giftProductName} className="w-10 h-10 object-contain rounded-lg border border-gray-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{gift.giftProductName} <span className="text-xs font-normal text-gray-500">×{gift.giftQuantity}</span></p>
                <p className="text-xs text-green-600 mt-0.5">{gift.reason}</p>
                {gift.value ? <p className="text-[10px] text-gray-400">Value: {formatPrice(gift.value)}</p> : null}
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-100 border border-green-300 px-2 py-0.5 rounded flex-shrink-0">Added FREE</span>
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

  //// NEW: Component to display gift eligibility hints
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
        <div className="min-h-screen flex justify-center items-center bg-white">
          <div className="w-8 h-8 border-2 border-t-red-600 border-r-red-200 border-b-red-200 border-l-red-200 rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (error || salesError) {
    return (
      <PageLayout>
        <div className="min-h-screen flex justify-center items-center bg-white">
          <div className="text-center p-8 max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-6">{error || salesError}</p>
            <button
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors"
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
        bgColor="black"
        items={[
          { name: "Home", href: "/" },
          { name: "Sales", href: "/sales" },
        ]}
      />
      <div className="min-h-screen bg-white">

        {/* ── Hero Banner ── */}
        <div className="bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="text-center max-w-3xl mx-auto">
              {/* Live pill */}
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live Sale
                {activeSale?.hasGifts && (
                  <span className="ml-2 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                    Free Gifts Available
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
                {activeSale ? activeSale.name : "Seasonal Sale Event"}
              </h1>

              <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                {activeSale
                  ? activeSale.description
                  : "Discover amazing deals with up to 50% off on selected premium items."}
              </p>

              {/* Countdown */}
              {activeSale && activeSale.endDate && (
                <div className="flex justify-center gap-3 mb-10">
                  {[
                    { value: timeLeft.days, label: "Days" },
                    { value: timeLeft.hours, label: "Hours" },
                    { value: timeLeft.minutes, label: "Min" },
                    { value: timeLeft.seconds, label: "Sec" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/10 rounded-xl px-5 py-4 min-w-[72px] text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-all"
              >
                Shop All Products
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Gift Sections ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <AvailableGiftsSection />
          <GiftDisplay />
        </div>

        {/* ── Products Section ── */}
        <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Section header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-6 bg-red-600 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeSale ? `${activeSale.name} Products` : "Sale Products"}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">{saleProducts.length} items on sale</p>
              </div>
            </div>
            {(processedGifts.saleGifts.length > 0 || processedGifts.productGifts.length > 0) && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {processedGifts.saleGifts.length + processedGifts.productGifts.length} free gifts available
              </div>
            )}
          </div>

          {giftLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <div className="w-3.5 h-3.5 border-2 border-t-red-600 border-gray-200 rounded-full animate-spin" />
              Calculating eligible gifts…
            </div>
          )}

          {saleProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">No sale products right now</h3>
              <p className="text-sm text-gray-500 mb-6">We're updating our deals. Check back soon.</p>
              <Link to="/products" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {saleProducts.map((product) => {
                const productGifts = getProductGifts(product.id);
                const hasProductGifts = productGifts.length > 0;

                return (
                  <div
                    key={product.id}
                    className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 shadow-sm hover:shadow-lg ${
                      hasProductGifts ? "border-amber-300" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {/* Image */}
                    <Link to={`/product/${product.id}`} className="relative block aspect-square bg-white overflow-hidden">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-400"
                      />
                      {/* Discount badge */}
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        -{product.discount}%
                      </span>
                      {/* Gift badge */}
                      {hasProductGifts && (
                        <span className="absolute top-2 right-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          + Gift
                        </span>
                      )}
                      {!hasProductGifts && processedGifts.saleGifts.length > 0 && (
                        <span className="absolute bottom-2 left-2 bg-gray-900/70 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                          Gift eligible
                        </span>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-3 border-t border-gray-100">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-red-600 transition-colors mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-900">{formatPrice(product.salePrice)}</span>
                        <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                      </div>

                      {/* Stock */}
                      <p className={`text-[10px] font-medium mb-2.5 ${
                        (product.stock || product.quantity || 0) < 5 ? "text-red-500" : "text-green-600"
                      }`}>
                        {(product.stock || product.quantity || 0) < 5
                          ? `Only ${product.stock || product.quantity || 0} left`
                          : `In stock`}
                      </p>

                      {/* Gift detail */}
                      {hasProductGifts && (
                        <div className="mb-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          {productGifts.map((gift, i) => (
                            <p key={i} className="text-[10px] text-amber-700 font-medium">
                              Buy {gift.minMainQuantity}+ → get {gift.giftProductName} x{gift.giftQuantity} free
                            </p>
                          ))}
                        </div>
                      )}
                      {!hasProductGifts && processedGifts.saleGifts.length > 0 && (
                        <p className="text-[10px] text-gray-500 mb-2.5">Add to cart to unlock free gift</p>
                      )}

                      <button
                        onClick={(e) => addCartHandler(e, product)}
                        className="w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold py-2 rounded-lg transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6M7 13h10m0 0l1.5 6" />
                        </svg>
                        {hasProductGifts ? "Add to Cart + Gift" : "Add to Cart"}
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
