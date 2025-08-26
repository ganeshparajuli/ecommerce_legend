// src/utils/productHelpers.ts
import type { Product } from "../redux/constants/productConstants";

/**
 * Parse product images from JSON string to array
 */
export const parseProductImages = (imageData: string | null): string[] => {
  if (!imageData) return [];
  try {
    const parsed = JSON.parse(imageData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing product images:", error);
    return [];
  }
};

/**
 * Parse JSON field with type safety
 */
export const parseJSONField = <T>(
  field: string | T | null | undefined,
  defaultValue: T
): T => {
  if (field === null || field === undefined) return defaultValue;

  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.error("Error parsing JSON field:", error);
      return defaultValue;
    }
  }

  return field;
};

/**
 * Format product for display with parsed JSON fields
 */
export const formatProductForDisplay = (product: Product) => {
  return {
    ...product,
    images: parseProductImages(product.image),
    keyFeatures: parseJSONField(product.keyFeatures, []),
    specifications: parseJSONField(product.specifications, {}),
    tags: parseJSONField(product.tags, []),
  };
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (
  originalPrice: number | null,
  finalPrice: number | null
): number => {
  if (!originalPrice || !finalPrice || originalPrice <= finalPrice) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
};

/**
 * Format price for display
 */
export const formatPrice = (price: number | null): string => {
  if (price === null || price === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

/**
 * Get product price to display (prioritizes finalPrice)
 */
export const getDisplayPrice = (product: Product): number => {
  return product.finalPrice || product.actualPrice || 0;
};

/**
 * Check if product is on sale
 */
export const isProductOnSale = (product: Product): boolean => {
  return !!(
    product.discountPrice &&
    product.discountPrice > 0 &&
    product.actualPrice &&
    product.actualPrice > product.finalPrice
  );
};

/**
 * Get stock status message
 */
export const getStockStatus = (
  quantity: number
): {
  message: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
} => {
  if (quantity === 0) {
    return { message: "Out of Stock", status: "out-of-stock" };
  } else if (quantity <= 5) {
    return { message: `Only ${quantity} left in stock`, status: "low-stock" };
  } else {
    return { message: "In Stock", status: "in-stock" };
  }
};

/**
 * Prepare product data for form submission
 */
export const prepareProductFormData = (
  productData: Partial<Product>,
  imageFiles?: File[]
): FormData => {
  const formData = new FormData();

  // Add basic fields
  Object.entries(productData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== "images") {
      // JSON stringify array/object fields
      if (key === "keyFeatures" || key === "specifications" || key === "tags") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Add image files
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => formData.append("images", file));
  }

  return formData;
};

/**
 * Validate product data before submission
 */
export const validateProductData = (
  productData: Partial<Product>
): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!productData.name || productData.name.trim() === "") {
    errors.name = "Product name is required";
  }

  if (!productData.finalPrice && !productData.actualPrice) {
    errors.price = "Product price is required";
  }

  const price = productData.finalPrice || productData.actualPrice || 0;
  if (price <= 0) {
    errors.price = "Price must be greater than 0";
  }

  if (productData.quantity !== undefined && productData.quantity < 0) {
    errors.quantity = "Quantity cannot be negative";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sort products by different criteria
 */
export const sortProducts = (
  products: Product[],
  sortBy: "price" | "name" | "rating" | "newest",
  order: "asc" | "desc" = "asc"
): Product[] => {
  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price":
        const priceA = getDisplayPrice(a);
        const priceB = getDisplayPrice(b);
        return order === "asc" ? priceA - priceB : priceB - priceA;

      case "name":
        const nameComparison = a.name.localeCompare(b.name);
        return order === "asc" ? nameComparison : -nameComparison;

      case "rating":
        return order === "asc" ? a.rating - b.rating : b.rating - a.rating;

      case "newest":
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;

      default:
        return 0;
    }
  });

  return sorted;
};

/**
 * Filter products by search criteria
 */
export const filterProducts = (
  products: Product[],
  filters: {
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    color?: string;
  }
): Product[] => {
  return products.filter((product) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }

    // Brand filter
    if (filters.brand && product.brand !== filters.brand) {
      return false;
    }

    // Color filter
    if (filters.color && product.color !== filters.color) {
      return false;
    }

    // Price range filter
    const price = getDisplayPrice(product);
    if (filters.minPrice !== undefined && price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && price > filters.maxPrice) {
      return false;
    }

    // Stock filter
    if (filters.inStock && product.quantity === 0) {
      return false;
    }

    return true;
  });
};
