import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  getAllSales,
  getSaleDetails,
  createSale,
  updateSale,
  deleteSale,
  getSaleProducts,
  addProductsToSale,
  getSalesAnalytics,
  getSaleGifts,
  updateSaleGifts,
  clearErrors,
} from "../../../../redux/actions/salesAction";
import { getAllProducts } from "../../../../redux/actions/productAction";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../redux/store";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Filter,
  DollarSign,
  ShoppingBag,
  Calendar,
  Activity,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  XCircle,
  Tag,
  Package,
  Percent,
  Gift,
  Star,
  Target,
  Settings,
  Save,
} from "lucide-react";

// GLOBAL TRACKING: Use sessionStorage to persist across component remounts
const FETCH_KEY = "sales_data_fetched";
const COMPONENT_MOUNT_KEY = "sales_component_mounts";

interface Sale {
  id: string;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "ended" | "draft";
  productCount?: number;
  totalSales?: number;
  hasGifts?: boolean;
  createdAt?: string;
  [key: string]: any;
}

interface Product {
  id: string;
  name: string;
  category: string;
  finalPrice: number;
  stock: number;
  image?: string;
  [key: string]: any;
}

// NEW: Gift-related interfaces
interface SaleGift {
  id?: string;
  saleId?: string;
  giftProductId: string;
  giftProductName?: string;
  giftQuantity: number;
  minPurchaseAmount: number;
  minQuantity: number;
  maxGiftsPerOrder: number;
  isActive?: boolean;
}

interface ProductGift {
  id?: string;
  saleId?: string;
  mainProductId: string;
  mainProductName?: string;
  giftProductId: string;
  giftProductName?: string;
  giftQuantity: number;
  minMainQuantity: number;
  maxGiftsPerOrder: number;
  isActive?: boolean;
}

interface GiftData {
  saleGifts: SaleGift[];
  productGifts: ProductGift[];
}

const Sales: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // NEW: Gift management state
  const [activeGiftTab, setActiveGiftTab] = useState<"sale" | "product">(
    "sale"
  );
  const [saleGifts, setSaleGifts] = useState<SaleGift[]>([]);
  const [productGifts, setProductGifts] = useState<ProductGift[]>([]);
  const [giftProductSearch, setGiftProductSearch] = useState("");
  const [isLoadingGifts, setIsLoadingGifts] = useState(false);
  const [isSavingGifts, setIsSavingGifts] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<Sale>>({
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    startDate: "",
    endDate: "",
    status: "draft",
  });

  // DEBUGGING: Track component mounts
  const mountId = useRef(Math.random().toString(36).substr(2, 9));
  const renderCount = useRef(0);
  renderCount.current++;

  // Get sales from Redux store
  const {
    sales = [],
    sale = {},
    products: saleProductsList = [],
    gifts,
    analytics = {},
    loading,
    giftLoading,
    error: reduxError,
    success,
  } = useSelector((state: RootState) => state.sales);

  console.log("gifts", gifts)

  // Get products from store
  const { products: availableProducts = [] } = useSelector(
    (state: RootState) => state.products
  );

  // BULLETPROOF FIX: Use sessionStorage + timestamp to prevent duplicate fetches
  useEffect(() => {
    const now = Date.now();
    const lastFetch = sessionStorage.getItem(FETCH_KEY);
    const timeSinceLastFetch = lastFetch ? now - parseInt(lastFetch) : Infinity;

    // Track component mounts for debugging
    const mountCount =
      parseInt(sessionStorage.getItem(COMPONENT_MOUNT_KEY) || "0") + 1;
    sessionStorage.setItem(COMPONENT_MOUNT_KEY, mountCount.toString());

    console.log(
      `🔍 Sales component mount #${mountCount} (ID: ${mountId.current}, Render: ${renderCount.current})`
    );
    console.log(`🔍 Last fetch was ${timeSinceLastFetch}ms ago`);

    // Only fetch if:
    // 1. Never fetched before, OR
    // 2. Last fetch was more than 5 seconds ago (prevents rapid refetches)
    if (!lastFetch || timeSinceLastFetch > 5000) {
      console.log("🔄 Initial data fetch... (Mount #" + mountCount + ")");

      // Mark as fetched BEFORE dispatching to prevent race conditions
      sessionStorage.setItem(FETCH_KEY, now.toString());

      // Dispatch both actions
      dispatch(getAllSales());
      dispatch(getAllProducts());
      dispatch(getSalesAnalytics());
    } else {
      console.log("⏭️ Skipping fetch - too recent (Mount #" + mountCount + ")");
    }
  }, []); // EMPTY dependency array

  // FIXED: Use Redux products state properly
  useEffect(() => {
    if (saleProductsList && saleProductsList.length >= 0) {
      console.log(`🔄 Redux products state updated:`, saleProductsList);
      setSaleProducts(saleProductsList);
    }
  }, [saleProductsList]);

  // NEW: Update local gift state when Redux gifts state changes
  useEffect(() => {
    if (gifts) {
      console.log("🎁 Redux gifts state updated:", gifts);

      // Map snake_case API response to camelCase for consistency
      const mapSaleGifts = (saleGifts) => {
        return saleGifts.map((gift) => ({
          id: gift.id,
          saleId: gift.sale_id,
          giftProductId: gift.gift_product_id || gift.product_id, // fallback for both field names
          giftProductName: gift.product_name || gift.giftProductName,
          giftQuantity: gift.gift_quantity || gift.giftQuantity || 1,
          minPurchaseAmount: parseFloat(
            gift.min_purchase_amount || gift.minPurchaseAmount || 0
          ),
          minQuantity: gift.min_quantity || gift.minQuantity || 1,
          maxGiftsPerOrder:
            gift.max_gifts_per_order || gift.maxGiftsPerOrder || 1,
          isActive:
            gift.is_active !== undefined ? Boolean(gift.is_active) : true,
          // Additional product info from API
          productPrice: gift.product_price,
          productStock: gift.product_stock,
          productImage: gift.product_image,
        }));
      };

      const mapProductGifts = (productGifts) => {
        return productGifts.map((gift) => ({
          id: gift.id,
          saleId: gift.sale_id,
          mainProductId: gift.main_product_id || gift.mainProductId,
          mainProductName: gift.main_product_name || gift.mainProductName,
          giftProductId: gift.gift_product_id || gift.giftProductId,
          giftProductName: gift.gift_product_name || gift.giftProductName,
          giftQuantity: gift.gift_quantity || gift.giftQuantity || 1,
          minMainQuantity: gift.min_main_quantity || gift.minMainQuantity || 1,
          maxGiftsPerOrder:
            gift.max_gifts_per_order || gift.maxGiftsPerOrder || 1,
          isActive:
            gift.is_active !== undefined ? Boolean(gift.is_active) : true,
        }));
      };

      // Apply mapping and update local state
      const mappedSaleGifts = mapSaleGifts(gifts.saleGifts || []);
      const mappedProductGifts = mapProductGifts(gifts.productGifts || []);

      setSaleGifts(mappedSaleGifts);
      setProductGifts(mappedProductGifts);

      console.log("✅ Local gift state updated:", {
        saleGifts: mappedSaleGifts.length,
        productGifts: mappedProductGifts.length,
        totalGifts: mappedSaleGifts.length + mappedProductGifts.length,
      });
    } else {
      console.log("ℹ️ Gifts state is null/undefined");
    }
  }, [gifts]);

  // FIXED: Get products from Redux state first, fallback to local state
  const displayProducts = useMemo(() => {
    const products =
      saleProductsList && saleProductsList.length > 0
        ? saleProductsList
        : saleProducts;

    console.log(`📊 Display products:`, products);
    return products;
  }, [saleProductsList, saleProducts]);

  // Handle successful operations
  useEffect(() => {
    if (success) {
      setShowCreateModal(false);
      setShowSaleDetails(false);
      setSelectedSale(null);
      setFormData({
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        startDate: "",
        endDate: "",
        status: "draft",
      });
      setSelectedProducts([]);
      // NEW: Reset gift state
      setSaleGifts([]);
      setProductGifts([]);
    }
  }, [success]);

  // FIXED: Memoize filtered sales to prevent unnecessary recalculations
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        sale.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.id && sale.id.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "" || sale.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sales, searchTerm, statusFilter]);

  // FIXED: Memoize overall metrics calculation
  const {
    totalSales,
    activeSales,
    scheduledSales,
    totalRevenue,
    salesWithGifts,
  } = useMemo(() => {
    const totalSales = sales.length;
    const activeSales = sales.filter((s) => s.status === "active").length;
    const scheduledSales = sales.filter((s) => s.status === "scheduled").length;
    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalSales || 0), 0);
    // NEW: Count sales with gifts
    const salesWithGifts = sales.filter((s) => s.hasGifts).length;

    return {
      totalSales,
      activeSales,
      scheduledSales,
      totalRevenue,
      salesWithGifts,
    };
  }, [sales]);

  // FIXED: fetchSaleProducts with proper state management
  const fetchSaleProducts = useCallback(
    async (saleId: string) => {
      console.log(`🔄 Fetching products for sale ${saleId}`);
      setIsLoadingProducts(true);
      setLocalError(null);

      try {
        // Dispatch Redux action
        const result = await dispatch(getSaleProducts(saleId));
        console.log(`📡 getSaleProducts result:`, result);

        // Products will be automatically available via Redux state
        // We don't need to manually set them here
        console.log(`✅ Products fetching completed for sale ${saleId}`);
      } catch (error) {
        console.error(`❌ Error fetching sale products for ${saleId}:`, error);
        setLocalError(
          `Failed to fetch sale products: ${error.message || "Unknown error"}`
        );
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [dispatch]
  );

  // NEW: Fetch sale gifts
  const fetchSaleGifts = useCallback(
    async (saleId: string) => {
      console.log(`🎁 Fetching gifts for sale ${saleId}`);
      setIsLoadingGifts(true);
      setLocalError(null);

      try {
        const result = await dispatch(getSaleGifts(saleId));
        console.log(`🎁 getSaleGifts result:`, result);
        console.log(`✅ Gifts fetching completed for sale ${saleId}`);
      } catch (error) {
        console.error(`❌ Error fetching sale gifts for ${saleId}:`, error);
        setLocalError(
          `Failed to fetch sale gifts: ${error.message || "Unknown error"}`
        );
      } finally {
        setIsLoadingGifts(false);
      }
    },
    [dispatch]
  );

  // View sale details and fetch their products
  const viewSaleDetails = useCallback(
    (sale: Sale) => {
      console.log(`👁️ Viewing details for sale:`, sale);
      setSelectedSale(sale);
      setShowSaleDetails(true);
      fetchSaleProducts(sale.id);
      // NEW: Also fetch gifts
      fetchSaleGifts(sale.id);
    },
    [fetchSaleProducts, fetchSaleGifts]
  );

  // Create new sale
  const handleCreateSale = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      startDate: "",
      endDate: "",
      status: "draft",
    });
    setSelectedProducts([]);
    // NEW: Reset gifts
    setSaleGifts([]);
    setProductGifts([]);
    setShowCreateModal(true);
  }, []);

  // Edit sale
  const handleEditSale = useCallback(
    async (sale: Sale) => {
      try {
        setFormData({
          ...sale,
          startDate: sale.startDate ? sale.startDate.split("T")[0] : "",
          endDate: sale.endDate ? sale.endDate.split("T")[0] : "",
        });
        setShowCreateModal(true);

        // Fetch products for this sale
        await fetchSaleProducts(sale.id);
        // NEW: Fetch gifts for this sale
        await fetchSaleGifts(sale.id);
      } catch (error) {
        console.error("Error loading sale details:", error);
        setLocalError("Failed to load sale details. Please try again.");
      }
    },
    [fetchSaleProducts, fetchSaleGifts]
  );

  // Delete sale
  const handleDeleteSale = useCallback(
    (saleId: string) => {
      if (window.confirm("Are you sure you want to delete this sale?")) {
        dispatch(deleteSale(saleId));
      }
    },
    [dispatch]
  );

  // Save (create or update) sale
  const handleSaveSale = useCallback(async () => {
    if (!formData.name) {
      setLocalError("Sale name is required");
      return;
    }

    try {
      const formattedSale = {
        ...formData,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
      };

      let saleId: string;

      if (formData.id) {
        // Update existing sale
        await dispatch(updateSale(formData.id, formattedSale));
        saleId = formData.id;
        if (selectedProducts.length > 0) {
          await dispatch(addProductsToSale(formData.id, selectedProducts));
        }
      } else {
        // Create new sale
        const result = await dispatch(
          createSale({
            ...formattedSale,
            productIds: selectedProducts,
          })
        );
        saleId = result?.sale?.id || formData.id;
      }

      // NEW: Save gifts if any are configured
      if (saleId && (saleGifts.length > 0 || productGifts.length > 0)) {
        await handleSaveGifts(saleId);
      }

      // Refresh the list
      await dispatch(getAllSales());
    } catch (error) {
      console.error("Error saving sale:", error);
      setLocalError("Failed to save sale. Please try again.");
    }
  }, [formData, selectedProducts, saleGifts, productGifts, dispatch]);

  // NEW: Save gifts
  const handleSaveGifts = useCallback(
    async (saleId: string) => {
      setIsSavingGifts(true);
      try {
        const giftsData = {
          saleGifts: saleGifts.map((gift) => ({
            productId: gift.giftProductId,
            quantity: gift.giftQuantity,
            minPurchaseAmount: gift.minPurchaseAmount,
            minQuantity: gift.minQuantity,
            maxGiftsPerOrder: gift.maxGiftsPerOrder,
          })),
          productGifts: productGifts.map((gift) => ({
            mainProductId: gift.mainProductId,
            giftProductId: gift.giftProductId,
            giftQuantity: gift.giftQuantity,
            minMainQuantity: gift.minMainQuantity,
            maxGiftsPerOrder: gift.maxGiftsPerOrder,
          })),
        };

        await dispatch(updateSaleGifts(saleId, giftsData));
        console.log("✅ Gifts saved successfully");
      } catch (error) {
        console.error("❌ Error saving gifts:", error);
        setLocalError("Failed to save gifts. Please try again.");
      } finally {
        setIsSavingGifts(false);
      }
    },
    [saleGifts, productGifts, dispatch]
  );

  // Handle form input changes
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Toggle product selection
  const handleToggleProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  // NEW: Add sale gift
  const handleAddSaleGift = useCallback(() => {
    const newGift: SaleGift = {
      giftProductId: "",
      giftQuantity: 1,
      minPurchaseAmount: 0,
      minQuantity: 1,
      maxGiftsPerOrder: 1,
    };
    setSaleGifts((prev) => [...prev, newGift]);
  }, []);

  // NEW: Remove sale gift
  const handleRemoveSaleGift = useCallback((index: number) => {
    setSaleGifts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // NEW: Update sale gift
  const handleUpdateSaleGift = useCallback(
    (index: number, field: keyof SaleGift, value: any) => {
      setSaleGifts((prev) =>
        prev.map((gift, i) =>
          i === index ? { ...gift, [field]: value } : gift
        )
      );
    },
    []
  );

  // NEW: Add product gift
  const handleAddProductGift = useCallback(() => {
    const newGift: ProductGift = {
      mainProductId: "",
      giftProductId: "",
      giftQuantity: 1,
      minMainQuantity: 1,
      maxGiftsPerOrder: 1,
    };
    setProductGifts((prev) => [...prev, newGift]);
  }, []);

  // NEW: Remove product gift
  const handleRemoveProductGift = useCallback((index: number) => {
    setProductGifts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // NEW: Update product gift
  const handleUpdateProductGift = useCallback(
    (index: number, field: keyof ProductGift, value: any) => {
      setProductGifts((prev) =>
        prev.map((gift, i) =>
          i === index ? { ...gift, [field]: value } : gift
        )
      );
    },
    []
  );

  // CSV Export Function
  const exportToCSV = useCallback(() => {
    setIsExporting(true);

    try {
      // Prepare CSV headers
      const headers = [
        "Sale ID",
        "Name",
        "Description",
        "Discount Type",
        "Discount Value",
        "Start Date",
        "End Date",
        "Status",
        "Product Count",
        "Has Gifts",
        "Total Revenue (Rs.)",
      ];

      // Prepare CSV data
      const csvData = filteredSales.map((sale) => [
        sale.id,
        sale.name,
        sale.description || "",
        sale.discountType,
        sale.discountValue,
        sale.startDate ? new Date(sale.startDate).toLocaleDateString() : "",
        sale.endDate ? new Date(sale.endDate).toLocaleDateString() : "",
        sale.status,
        sale.productCount || 0,
        sale.hasGifts ? "Yes" : "No",
        (sale.totalSales || 0).toFixed(2),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          row
            .map((field) =>
              // Escape fields that contain commas or quotes
              typeof field === "string" &&
              (field.includes(",") || field.includes('"'))
                ? `"${field.replace(/"/g, '""')}"`
                : field
            )
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `sales_export_${new Date().toISOString().split("T")[0]}_${new Date()
          .toTimeString()
          .split(" ")[0]
          .replace(/:/g, "-")}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLocalError(null);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setLocalError("Failed to export CSV file");
    } finally {
      setIsExporting(false);
    }
  }, [filteredSales]);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  }, []);

  // Get status class
  const getStatusClass = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "scheduled":
        return <Clock className="w-3 h-3 mr-1" />;
      case "ended":
        return <XCircle className="w-3 h-3 mr-1" />;
      case "draft":
        return <Edit className="w-3 h-3 mr-1" />;
      default:
        return <Activity className="w-3 h-3 mr-1" />;
    }
  }, []);

  // Format price
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    })
      .format(price || 0)
      .replace("NPR", "Rs.");
  }, []);

  // Filter products for selection based on search
  const filteredProducts = useMemo(() => {
    return availableProducts.filter(
      (product) =>
        !productSearchQuery ||
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        product.category
          .toLowerCase()
          .includes(productSearchQuery.toLowerCase())
    );
  }, [availableProducts, productSearchQuery]);

  // NEW: Filter products for gift selection
  const filteredGiftProducts = useMemo(() => {
    return availableProducts.filter(
      (product) =>
        !giftProductSearch ||
        product.name.toLowerCase().includes(giftProductSearch.toLowerCase()) ||
        product.category.toLowerCase().includes(giftProductSearch.toLowerCase())
    );
  }, [availableProducts, giftProductSearch]);

  // Convert a date to YYYY-MM-DD format for input[type="date"]
  const dateToInputValue = useCallback((date: string) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Display error message from Redux or local error
  const errorMessage =
    localError || (typeof reduxError === "string" ? reduxError : null);

  // IMPROVED Loading state - only show spinner on very first load
  if (loading && (!sales || sales.length === 0)) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading Sales...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Debug Info - Development Only */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
          Mount: {mountId.current} | Renders: {renderCount.current} | Sales:{" "}
          {sales?.length || 0} | Products: {availableProducts?.length || 0} |
          Gifts:{" "}
          {(gifts?.saleGifts?.length || 0) + (gifts?.productGifts?.length || 0)}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Tag className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Management
            </h1>
            <p className="text-gray-600">
              Create and manage sales campaigns with gifts for your store
            </p>
          </div>
        </div>

        {/* Create Sale and Export Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={isExporting || filteredSales.length === 0}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </>
            )}
          </button>

          <button
            onClick={handleCreateSale}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Sale
          </button>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              {filteredSales.length} sales ready to export
            </p>
            <p className="text-xs text-gray-400">
              Includes sale details & gift metrics
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setLocalError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Search className="w-4 h-4 mr-2" />
                Search Sales
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, description or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Filter className="w-4 h-4 mr-2" />
                Status Filter
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none h-12 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ended">Ended</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">
                  Total Sales
                </p>
                <p className="text-3xl font-bold text-blue-900">{totalSales}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 mb-1">
                  Active Sales
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {activeSales}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-600 mb-1">
                  Scheduled Sales
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {scheduledSales}
                </p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEW: Sales with Gifts metric */}
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-pink-600 mb-1">
                  Sales with Gifts
                </p>
                <p className="text-3xl font-bold text-pink-900">
                  {salesWithGifts}
                </p>
              </div>
              <div className="p-3 bg-pink-500 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {formatPrice(totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="border-b border-gray-200 p-6">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center text-xl font-bold text-gray-900">
              <Tag className="w-5 h-5 mr-2" />
              Sales ({filteredSales.length})
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export ready data</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sale
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Gifts
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-500">
                        {searchTerm || statusFilter
                          ? "No sales match your filters"
                          : "No sales found"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || statusFilter
                          ? "Try adjusting your search or filters"
                          : "Create your first sale to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {sale.name}
                          </span>
                          {sale.description && (
                            <span className="text-sm text-gray-500">
                              {sale.description}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded mt-1 w-fit">
                            {sale.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {sale.discountType === "percentage" ? (
                            <Percent className="w-4 h-4 mr-2 text-green-600" />
                          ) : (
                            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          )}
                          <span className="font-medium">
                            {sale.discountType === "percentage"
                              ? `${sale.discountValue}%`
                              : formatPrice(sale.discountValue)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(sale.startDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            to {formatDate(sale.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                            sale.status
                          )}`}
                        >
                          {getStatusIcon(sale.status)}
                          {sale.status
                            ? sale.status.charAt(0).toUpperCase() +
                              sale.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          {sale.productCount || 0}
                        </div>
                      </td>
                      {/* NEW: Gifts column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {(() => {
                            // Check multiple sources for gift information
                            const hasGiftsFromAPI =
                              sale.hasGifts || sale.has_gifts;
                            const hasGiftsFromCount =
                              (sale.giftCount && sale.giftCount > 0) ||
                              (sale.gift_count && sale.gift_count > 0);

                            // If viewing this specific sale and we have local gift data
                            const hasLocalGifts =
                              selectedSale?.id === sale.id &&
                              ((saleGifts && saleGifts.length > 0) ||
                                (productGifts && productGifts.length > 0));

                            // If we have Redux gift data for this sale
                            const hasReduxGifts =
                              gifts &&
                              selectedSale?.id === sale.id &&
                              ((gifts.saleGifts &&
                                gifts.saleGifts.length > 0) ||
                                (gifts.productGifts &&
                                  gifts.productGifts.length > 0));

                            const hasAnyGifts =
                              hasGiftsFromAPI ||
                              hasGiftsFromCount ||
                              hasLocalGifts ||
                              hasReduxGifts;

                            if (hasAnyGifts) {
                              // Calculate total gift count if possible
                              let giftCount = 0;
                              if (selectedSale?.id === sale.id) {
                                giftCount =
                                  (saleGifts?.length || 0) +
                                  (productGifts?.length || 0);
                                if (giftCount === 0 && gifts) {
                                  giftCount =
                                    (gifts.saleGifts?.length || 0) +
                                    (gifts.productGifts?.length || 0);
                                }
                              } else if (sale.giftCount || sale.gift_count) {
                                giftCount = sale.giftCount || sale.gift_count;
                              }

                              return (
                                <div className="flex items-center text-sm font-semibold text-pink-600">
                                  <Gift className="w-4 h-4 mr-1" />
                                  <span>Yes</span>
                                  {giftCount > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                                      {giftCount}
                                    </span>
                                  )}
                                </div>
                              );
                            } else {
                              return (
                                <span className="text-sm text-gray-400">
                                  No
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm font-bold text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatPrice(sale.totalSales || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => viewSaleDetails(sale)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                            onClick={() => handleEditSale(sale)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteSale(sale.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">1</span> to{" "}
              <span className="font-semibold">{filteredSales.length}</span> of{" "}
              <span className="font-semibold">{sales.length}</span> sales
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                disabled
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm font-semibold">
                1
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Sale Modal */}
      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
            <DialogHeader className="border-b border-gray-200 pb-6 bg-white -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                  {formData.id ? "Edit Sale" : "Create New Sale"}
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 pt-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {/* Sale Details Form */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-gray-600" />
                  Sale Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter sale name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || "draft"}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="ended">Ended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType || "percentage"}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue || 0}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter discount amount"
                      min="0"
                      step={
                        formData.discountType === "percentage" ? "1" : "0.01"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={dateToInputValue(formData.startDate || "")}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={dateToInputValue(formData.endDate || "")}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter sale description"
                    />
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-gray-600" />
                    Select Products for Sale
                  </h3>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedProducts.length} products selected
                    </span>
                    <div className="relative flex-1 max-w-xs ml-4">
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search products..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {availableProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        No products available
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Add products to your store first
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 w-12">
                            <span className="sr-only">Select</span>
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Product
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Category
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                          <tr
                            key={product.id}
                            className={`${
                              selectedProducts.includes(product.id)
                                ? "bg-blue-50"
                                : ""
                            } hover:bg-gray-50 transition-colors`}
                          >
                            <td className="px-4 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleToggleProduct(product.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <span className="font-medium text-gray-900">
                                {product.name}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-gray-500">
                                {product.category}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="font-medium">
                                {formatPrice(product.finalPrice)}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-gray-600">
                                {product.stock}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* NEW: Gift Management Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-pink-600" />
                      Gift Configuration
                      <span className="ml-3 px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                        Optional
                      </span>
                    </h3>
                    {isLoadingGifts && (
                      <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Configure free gifts that customers can earn with this sale
                  </p>
                </div>

                {/* Gift Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setActiveGiftTab("sale")}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeGiftTab === "sale"
                          ? "border-pink-500 text-pink-600 bg-pink-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Star className="w-4 h-4 mr-2 inline" />
                      Sale-Level Gifts
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGiftTab("product")}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeGiftTab === "product"
                          ? "border-purple-500 text-purple-600 bg-purple-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Target className="w-4 h-4 mr-2 inline" />
                      Product-Specific Gifts
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeGiftTab === "sale" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900">
                            Sale-Level Gifts
                          </h4>
                          <p className="text-sm text-gray-600">
                            Gifts that apply when customers meet purchase
                            requirements
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSaleGift}
                          className="px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium"
                        >
                          <Plus className="w-4 h-4 mr-1 inline" />
                          Add Gift
                        </button>
                      </div>

                      {saleGifts.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">
                            No sale-level gifts configured
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Add gifts that customers can earn by spending a
                            minimum amount
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {saleGifts.map((gift, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-pink-50 to-pink-25 hover:shadow-md transition-all duration-200"
                            >
                              {/* Gift Summary Bar */}
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-pink-200">
                                <div className="flex items-center space-x-2">
                                  <Gift className="w-4 h-4 text-pink-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Sale Gift #{index + 1}
                                  </span>
                                  {gift.giftProductId && (
                                    <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                                      {availableProducts.find(
                                        (p) => p.id === gift.giftProductId
                                      )?.name || "Unknown Product"}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSaleGift(index)}
                                  className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Remove this gift"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Gift Product *
                                  </label>
                                  <select
                                    value={gift.giftProductId}
                                    onChange={(e) =>
                                      handleUpdateSaleGift(
                                        index,
                                        "giftProductId",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                    required
                                  >
                                    <option value="">Select product</option>
                                    {availableProducts.map((product) => (
                                      <option
                                        key={product.id}
                                        value={product.id}
                                      >
                                        {product.name} -{" "}
                                        {formatPrice(product.finalPrice)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Gift Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={gift.giftQuantity}
                                    onChange={(e) =>
                                      handleUpdateSaleGift(
                                        index,
                                        "giftQuantity",
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Min Spend (Rs.)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={gift.minPurchaseAmount}
                                    onChange={(e) =>
                                      handleUpdateSaleGift(
                                        index,
                                        "minPurchaseAmount",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Min Items
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={gift.minQuantity}
                                    onChange={(e) =>
                                      handleUpdateSaleGift(
                                        index,
                                        "minQuantity",
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                  />
                                </div>
                              </div>

                              {/* Gift Preview */}
                              {gift.giftProductId && (
                                <div className="mt-3 p-2 bg-pink-50 border border-pink-200 rounded text-xs text-pink-700">
                                  <strong>Preview:</strong> Get{" "}
                                  {gift.giftQuantity}x{" "}
                                  <em>
                                    {
                                      availableProducts.find(
                                        (p) => p.id === gift.giftProductId
                                      )?.name
                                    }
                                  </em>{" "}
                                  FREE when spending Rs.{" "}
                                  {gift.minPurchaseAmount}+ with{" "}
                                  {gift.minQuantity}+ items
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeGiftTab === "product" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900">
                            Product-Specific Gifts
                          </h4>
                          <p className="text-sm text-gray-600">
                            Gifts that apply when customers buy specific
                            products
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddProductGift}
                          className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          <Plus className="w-4 h-4 mr-1 inline" />
                          Add Gift
                        </button>
                      </div>

                      {productGifts.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">
                            No product-specific gifts configured
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Add gifts that customers can earn by buying specific
                            products
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {productGifts.map((gift, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-25 hover:shadow-md transition-all duration-200"
                            >
                              {/* Gift Summary Bar */}
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-200">
                                <div className="flex items-center space-x-2">
                                  <Target className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Product Gift #{index + 1}
                                  </span>
                                  {gift.mainProductId && gift.giftProductId && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                      Buy-Get Deal
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductGift(index)}
                                  className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Remove this gift"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Main Product *
                                  </label>
                                  <select
                                    value={gift.mainProductId}
                                    onChange={(e) =>
                                      handleUpdateProductGift(
                                        index,
                                        "mainProductId",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                  >
                                    <option value="">Select product</option>
                                    {availableProducts.map((product) => (
                                      <option
                                        key={product.id}
                                        value={product.id}
                                      >
                                        {product.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Gift Product *
                                  </label>
                                  <select
                                    value={gift.giftProductId}
                                    onChange={(e) =>
                                      handleUpdateProductGift(
                                        index,
                                        "giftProductId",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                  >
                                    <option value="">Select gift</option>
                                    {availableProducts
                                      .filter(
                                        (product) =>
                                          product.id !== gift.mainProductId
                                      ) // Prevent self-gifting
                                      .map((product) => (
                                        <option
                                          key={product.id}
                                          value={product.id}
                                        >
                                          {product.name} -{" "}
                                          {formatPrice(product.finalPrice)}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Gift Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={gift.giftQuantity}
                                    onChange={(e) =>
                                      handleUpdateProductGift(
                                        index,
                                        "giftQuantity",
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Min Main Qty
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={gift.minMainQuantity}
                                    onChange={(e) =>
                                      handleUpdateProductGift(
                                        index,
                                        "minMainQuantity",
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  />
                                </div>
                              </div>

                              {/* Gift Preview */}
                              {gift.mainProductId && gift.giftProductId && (
                                <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                                  <strong>Preview:</strong> Buy{" "}
                                  {gift.minMainQuantity}x{" "}
                                  <em>
                                    {
                                      availableProducts.find(
                                        (p) => p.id === gift.mainProductId
                                      )?.name
                                    }
                                  </em>
                                  → Get {gift.giftQuantity}x{" "}
                                  <em>
                                    {
                                      availableProducts.find(
                                        (p) => p.id === gift.giftProductId
                                      )?.name
                                    }
                                  </em>{" "}
                                  FREE
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSale}
                    disabled={!formData.name || isSavingGifts}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSavingGifts ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : formData.id ? (
                      <>
                        <Edit className="w-5 h-5 mr-2" />
                        Update Sale
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Sale
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Sale Details Dialog */}
      {selectedSale && (
        <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
          <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
            <DialogHeader className="border-b border-gray-200 pb-6 bg-white -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                  Sale Details
                  {/* NEW: Gift indicator */}
                  {selectedSale.hasGifts && (
                    <span className="ml-3 px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                      🎁 Has Gifts
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowSaleDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 pt-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {/* Sale Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedSale.name}
                    </h2>
                    {selectedSale.description && (
                      <p className="text-gray-600 mb-4">
                        {selectedSale.description}
                      </p>
                    )}
                    <p className="text-gray-500 font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                      ID: {selectedSale.id}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusClass(
                        selectedSale.status
                      )}`}
                    >
                      {getStatusIcon(selectedSale.status)}
                      {selectedSale.status
                        ? selectedSale.status.charAt(0).toUpperCase() +
                          selectedSale.status.slice(1)
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sale Details Grid */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-gray-600" />
                  Sale Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Percent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-blue-700 mb-1 block">
                          Discount
                        </label>
                        <p className="text-gray-900 font-medium">
                          {selectedSale.discountType === "percentage"
                            ? `${selectedSale.discountValue}%`
                            : formatPrice(selectedSale.discountValue)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-green-700 mb-1 block">
                          Start Date
                        </label>
                        <p className="text-gray-900 font-medium">
                          {formatDate(selectedSale.startDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-purple-700 mb-1 block">
                          Products
                        </label>
                        <p className="text-gray-900 font-medium">
                          {selectedSale.productCount || 0} products
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-orange-700 mb-1 block">
                          End Date
                        </label>
                        <p className="text-gray-900 font-medium">
                          {formatDate(selectedSale.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Gift Details Section */}
              {/* FIXED: Gift Details Section - Use local state instead of raw Redux state */}
              {(selectedSale.hasGifts ||
                (gifts &&
                  ((gifts.saleGifts && gifts.saleGifts.length > 0) ||
                    (gifts.productGifts && gifts.productGifts.length > 0))) ||
                (saleGifts && saleGifts.length > 0) ||
                (productGifts && productGifts.length > 0)) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-pink-600" />
                      Gift Configuration
                      {isLoadingGifts && (
                        <Loader2 className="w-4 h-4 animate-spin text-pink-600 ml-2" />
                      )}
                      <span className="ml-3 px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                        {isLoadingGifts
                          ? "Loading..."
                          : `${
                              (saleGifts?.length || 0) +
                              (productGifts?.length || 0)
                            } gifts`}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isLoadingGifts
                        ? "Loading gift details..."
                        : "Free gifts configured for this sale"}
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    {isLoadingGifts ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-600 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                          Loading gift configuration...
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Please wait while we fetch gift details
                        </p>
                      </div>
                    ) : (saleGifts && saleGifts.length > 0) ||
                      (productGifts && productGifts.length > 0) ? (
                      <>
                        {/* DEBUG: Show what data we have */}
                        {process.env.NODE_ENV === "development" && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                            Debug: Using local state - saleGifts:{" "}
                            {saleGifts?.length || 0}, productGifts:{" "}
                            {productGifts?.length || 0}
                          </div>
                        )}

                        {/* Sale-Level Gifts - Use LOCAL STATE */}
                        {saleGifts && saleGifts.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Star className="w-4 h-4 mr-2 text-pink-600" />
                              Sale-Level Gifts ({saleGifts.length})
                            </h4>
                            <div className="space-y-3">
                              {saleGifts.map((gift, index) => (
                                <div
                                  key={`sale-gift-${gift.id || index}`}
                                  className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Gift className="w-4 h-4 text-pink-600" />
                                        <span className="font-medium text-gray-900">
                                          {/* Use mapped local state fields */}
                                          {gift.giftProductName ||
                                            availableProducts.find(
                                              (p) => p.id === gift.giftProductId
                                            )?.name ||
                                            `Product ID: ${
                                              gift.giftProductId || "Unknown"
                                            }`}
                                        </span>
                                        <span className="px-2 py-1 bg-pink-200 text-pink-800 text-xs rounded-full">
                                          x{gift.giftQuantity || 1}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600 space-y-1">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                          <span className="flex items-center">
                                            💰 Min spend:{" "}
                                            <strong className="ml-1">
                                              Rs.{" "}
                                              {(
                                                gift.minPurchaseAmount || 0
                                              ).toLocaleString()}
                                            </strong>
                                          </span>
                                          <span className="flex items-center">
                                            📦 Min items:{" "}
                                            <strong className="ml-1">
                                              {gift.minQuantity || 1}
                                            </strong>
                                          </span>
                                          <span className="flex items-center">
                                            🎁 Max gifts:{" "}
                                            <strong className="ml-1">
                                              {gift.maxGiftsPerOrder || 1}
                                            </strong>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {gift.isActive !== false && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Product-Specific Gifts - Use LOCAL STATE */}
                        {productGifts && productGifts.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Target className="w-4 h-4 mr-2 text-purple-600" />
                              Product-Specific Gifts ({productGifts.length})
                            </h4>
                            <div className="space-y-3">
                              {productGifts.map((gift, index) => (
                                <div
                                  key={`product-gift-${gift.id || index}`}
                                  className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2 flex-wrap">
                                        <Target className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm text-gray-600">
                                          Buy
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {gift.minMainQuantity || 1}x{" "}
                                          {gift.mainProductName ||
                                            availableProducts.find(
                                              (p) => p.id === gift.mainProductId
                                            )?.name ||
                                            `Product ID: ${gift.mainProductId}`}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          → Get
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {gift.giftQuantity || 1}x{" "}
                                          {gift.giftProductName ||
                                            availableProducts.find(
                                              (p) => p.id === gift.giftProductId
                                            )?.name ||
                                            `Product ID: ${gift.giftProductId}`}
                                        </span>
                                        <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">
                                          FREE
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        🎁 Max {gift.maxGiftsPerOrder || 1}{" "}
                                        gifts per order
                                      </div>
                                    </div>
                                    {gift.isActive !== false && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full ml-4">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : selectedSale.hasGifts ? (
                      // Sale has gifts but data didn't load properly
                      <div className="text-center py-8">
                        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                          Gift data not loaded
                        </p>
                        <p className="text-gray-400 text-sm mt-1 mb-4">
                          This sale has gifts configured but the details
                          couldn't be loaded
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => fetchSaleGifts(selectedSale.id)}
                            disabled={isLoadingGifts}
                            className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {isLoadingGifts ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                                Loading...
                              </>
                            ) : (
                              "Retry Loading Gifts"
                            )}
                          </button>
                          {process.env.NODE_ENV === "development" && (
                            <p className="text-xs text-gray-400">
                              Debug: Redux gifts = {gifts ? "exists" : "null"},
                              Local gifts ={" "}
                              {(saleGifts?.length || 0) +
                                (productGifts?.length || 0)}
                              , hasGifts ={" "}
                              {selectedSale.hasGifts ? "true" : "false"}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      // No gifts configured for this sale
                      <div className="text-center py-8">
                        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                          No gifts configured
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          This sale doesn't have any gift offers
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FIXED: Sale Analytics with local state gift counting */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                  Sale Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="p-3 bg-blue-500 rounded-full mx-auto mb-4 w-fit">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-blue-700 mb-2">
                      Products in Sale
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {selectedSale.productCount || displayProducts.length || 0}
                    </p>
                  </div>

                  {/* FIXED: Use local state for gift counting */}
                  <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                    <div className="p-3 bg-pink-500 rounded-full mx-auto mb-4 w-fit">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-pink-700 mb-2">
                      Total Gifts
                    </p>
                    <div className="text-3xl font-bold text-pink-900">
                      {isLoadingGifts ? (
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      ) : (
                        (saleGifts?.length || 0) + (productGifts?.length || 0)
                      )}
                    </div>
                    {/* Status indicator using local state */}
                    <p className="text-xs mt-1">
                      {isLoadingGifts ? (
                        <span className="text-pink-600">Loading...</span>
                      ) : (saleGifts?.length || 0) +
                          (productGifts?.length || 0) >
                        0 ? (
                        <span className="text-green-600">
                          {saleGifts?.length || 0} sale +{" "}
                          {productGifts?.length || 0} product
                        </span>
                      ) : selectedSale.hasGifts ? (
                        <span className="text-red-600">Data not loaded</span>
                      ) : (
                        <span className="text-gray-500">No gifts</span>
                      )}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="p-3 bg-green-500 rounded-full mx-auto mb-4 w-fit">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-green-700 mb-2">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {formatPrice(selectedSale.totalSales || 0)}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="p-3 bg-purple-500 rounded-full mx-auto mb-4 w-fit">
                      <Percent className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-purple-700 mb-2">
                      Discount Value
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {selectedSale.discountType === "percentage"
                        ? `${selectedSale.discountValue}%`
                        : formatPrice(selectedSale.discountValue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sale Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="flex items-center justify-between text-lg font-semibold text-gray-900">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      Sale Products
                      {displayProducts.length > 0 && (
                        <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {displayProducts.length} products
                        </span>
                      )}
                    </div>
                    {isLoadingProducts && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    )}
                  </h3>
                </div>
                <div className="p-6">
                  {isLoadingProducts ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                      <p className="font-medium">Loading products...</p>
                    </div>
                  ) : saleProducts.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">
                        No Products Added
                      </h4>
                      <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                        This sale doesn't have any products assigned yet. Edit
                        the sale to add products.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {displayProducts.map((product, index) => (
                              <tr
                                key={`product-${product.id}-${index}`}
                                className={`${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-blue-50 transition-colors`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="font-medium text-gray-900">
                                    {product.name}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-gray-500">
                                    {product.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="font-medium">
                                    {formatPrice(product.finalPrice)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-gray-600">
                                    {product.stock}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                  Sale Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="p-3 bg-blue-500 rounded-full mx-auto mb-4 w-fit">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-blue-700 mb-2">
                      Products in Sale
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {selectedSale.productCount || 0}
                    </p>
                  </div>

                  {/* NEW: Gifts metric */}
                  <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                    <div className="p-3 bg-pink-500 rounded-full mx-auto mb-4 w-fit">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-pink-700 mb-2">
                      Total Gifts
                    </p>
                    <p className="text-3xl font-bold text-pink-900">
                      {(gifts?.saleGifts.length || 0) +
                        (gifts?.productGifts.length || 0)}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="p-3 bg-green-500 rounded-full mx-auto mb-4 w-fit">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-green-700 mb-2">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {formatPrice(selectedSale.totalSales || 0)}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="p-3 bg-purple-500 rounded-full mx-auto mb-4 w-fit">
                      <Percent className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-purple-700 mb-2">
                      Discount Value
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {selectedSale.discountType === "percentage"
                        ? `${selectedSale.discountValue}%`
                        : formatPrice(selectedSale.discountValue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowSaleDetails(false)}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Close
                  </button>
                  <button
                    onClick={() => handleEditSale(selectedSale)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Sale
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Sales;
