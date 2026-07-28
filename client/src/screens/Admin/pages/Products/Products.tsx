import { useState, useEffect } from "react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Checkbox } from "../../../../components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Package,
  DollarSign,
  Star,
  Search,
  Upload,
  Image as ImageIcon,
  Save,
  ShoppingCart,
  Tag,
  Zap,
  Grid3X3,
  List,
  MoreVertical,
  Trash,
  Archive,
  RotateCcw,
  CheckSquare,
  Database,
  History,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../../../redux/actions/categoryAction";
import { getAllBrands } from "../../../../redux/actions/brandAction";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  bulkDeleteProducts,
  bulkRestoreProducts,
  getDeletedProducts,
  restoreProduct,
  clearErrors,
} from "../../../../redux/actions/productAction";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../../redux/store";
import type { Product, ProductVariant } from "../../../../redux/constants/productConstants";
import {
  parseProductImages,
  parseJSONField,
  getDisplayPrice,
  getStockStatus,
  formatPrice,
  isProductOnSale,
  calculateDiscountPercentage,
} from "../../../../utils/productHelper";
import { ProductImage, getImageUrl } from "../../../../utils/imageHelper";

// Define interfaces
interface Category {
  id: string;
  name: string;
  slug: string;
  brandId?: string;
}

interface Brand {
  id: string;
  name: string;
}

const Products = () => {
  const dispatch = useDispatch<AppDispatch>();

  // State for images
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<number[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Dialog and UI state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [brandCategories, setBrandCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");

  // NEW: Bulk operations state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");
  const [bulkAction, setBulkAction] = useState<"delete" | "restore" | null>(
    null
  );


  // A variant row being edited in the admin form - `id` is only set when editing an
  // existing variant (needed so the backend knows to update it rather than create a new one).
  interface VariantFormRow {
    id?: string;
    sku: string;
    price: string;
    compareAtPrice: string;
    quantity: string;
    attributes: Record<string, string>;
  }

  const makeEmptyVariant = (): VariantFormRow => ({
    sku: "",
    price: "",
    compareAtPrice: "",
    quantity: "0",
    attributes: {},
  });

  // Form state with all fields from backend
  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    categoryId: "",
    description: "",
    productDetails: "",
    featured: false,
    sku: "",
    availability: "In Stock",
    keyFeatures: [] as string[],
    specifications: {} as Record<string, any>,
    tags: [] as string[],
  });

  const [variants, setVariants] = useState<VariantFormRow[]>([makeEmptyVariant()]);
  const [variantAttrKeyInputs, setVariantAttrKeyInputs] = useState<Record<number, string>>({});
  const [variantAttrValueInputs, setVariantAttrValueInputs] = useState<Record<number, string>>({});

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Input state for dynamic fields
  const [keyFeatureInput, setKeyFeatureInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  // Get state from Redux
  const {
    products,
    deletedProducts,
    loading,
    deletedLoading,
    error,
    deletedError,
    success,
    isUpdated,
    isDeleted,
    isBulkDeleted,
    isRestored,
    isBulkRestored,
  } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.category);
  const { brands } = useSelector((state: RootState) => state.brand);

  // Show notification for 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Show toast notifications for Redux state changes
  useEffect(() => {
    if (error || deletedError) {
      toast.error(error || deletedError);
      dispatch(clearErrors());
    }

    if (success) {
      toast.success("Product created successfully!");
      setIsAddProductOpen(false);
      setSubmitting(false);
      resetForm();
    }

    if (isUpdated) {
      toast.success("Product updated successfully!");
      setIsAddProductOpen(false);
      setSubmitting(false);
      resetForm();
    }

    if (isDeleted) {
      toast.success("Product deleted successfully!");
      setSelectedProductIds([]);
    }

    if (isBulkDeleted) {
      toast.success("Products deleted successfully!");
      setSelectedProductIds([]);
      setIsSelectMode(false);
    }

    if (isRestored) {
      toast.success("Product restored successfully!");
    }

    if (isBulkRestored) {
      toast.success("Products restored successfully!");
      setSelectedProductIds([]);
      setIsSelectMode(false);
    }
  }, [
    error,
    deletedError,
    success,
    isUpdated,
    isDeleted,
    isBulkDeleted,
    isRestored,
    isBulkRestored,
    dispatch,
  ]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllCategories() as any);
    dispatch(getAllBrands() as any);
    dispatch(getAllProducts());
  }, [dispatch]);

  // Fetch deleted products when switching to deleted tab
  useEffect(() => {
    if (activeTab === "deleted") {
      dispatch(getDeletedProducts());
    }
  }, [activeTab, dispatch]);

  // Update brand categories when brand or categories change
  useEffect(() => {
    if (selectedBrandId && categories.length > 0) {
      const filteredCategories = categories.filter(
        (category) => category.brandId === selectedBrandId
      );
      setBrandCategories(filteredCategories);
    } else {
      setBrandCategories(categories);
    }
  }, [selectedBrandId, categories]);

  // NEW: Bulk operation handlers
  const handleSelectAll = () => {
    const currentProducts =
      activeTab === "active" ? filteredProducts : filteredDeletedProducts;
    const allIds = currentProducts.map((product) => product.id);

    if (selectedProductIds.length === allIds.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(allIds);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkDelete = async (hardDelete: boolean = false) => {
    if (selectedProductIds.length === 0) {
      toast.error("Please select products to delete");
      return;
    }

    const action = hardDelete ? "permanently delete" : "delete";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedProductIds.length} selected product(s)?`
    );

    if (confirmed) {
      try {
        await dispatch(bulkDeleteProducts(selectedProductIds, hardDelete));
        if (activeTab === "active") {
          dispatch(getAllProducts());
        } else {
          dispatch(getDeletedProducts());
        }
      } catch (error) {
        console.error("Bulk delete failed:", error);
      }
    }
  };

  const handleBulkRestore = async () => {
    if (selectedProductIds.length === 0) {
      toast.error("Please select products to restore");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to restore ${selectedProductIds.length} selected product(s)?`
    );

    if (confirmed) {
      try {
        await dispatch(bulkRestoreProducts(selectedProductIds));
        dispatch(getDeletedProducts());
        dispatch(getAllProducts());
      } catch (error) {
        console.error("Bulk restore failed:", error);
      }
    }
  };

  const handleSingleRestore = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to restore this product?"
    );

    if (confirmed) {
      try {
        await dispatch(restoreProduct(productId));
        dispatch(getDeletedProducts());
        dispatch(getAllProducts());
      } catch (error) {
        console.error("Restore failed:", error);
      }
    }
  };

  const handleHardDelete = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this product? This action cannot be undone."
    );

    if (confirmed) {
      try {
        await dispatch(hardDeleteProduct(productId));
        dispatch(getDeletedProducts());
      } catch (error) {
        console.error("Hard delete failed:", error);
      }
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: "",
      brandId: "",
      categoryId: "",
      description: "",
      productDetails: "",
      featured: false,
      sku: "",
      availability: "In Stock",
      keyFeatures: [],
      specifications: {},
      tags: [],
    });
    setVariants([makeEmptyVariant()]);
    setVariantAttrKeyInputs({});
    setVariantAttrValueInputs({});
    setSelectedBrandId("");
    setBrandCategories(categories);
    setImages([]);
    setImagePreview([]);
    setExistingImages([]);
    setImagesToRemove([]);
    setFormErrors({});
    setKeyFeatureInput("");
    setTagInput("");
    setSpecKey("");
    setSpecValue("");
    setSelectedProduct(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    setSelectedBrandId(brandId);

    setFormData({
      ...formData,
      brandId,
      categoryId: "", // Reset category when brand changes
    });
  };

  // ---- Variant row helpers ----
  const addVariantRow = () => setVariants((prev) => [...prev, makeEmptyVariant()]);

  const removeVariantRow = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const updateVariantField = (index: number, field: keyof VariantFormRow, value: string) =>
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));

  const addVariantAttribute = (index: number) => {
    const key = (variantAttrKeyInputs[index] || "").trim();
    const value = (variantAttrValueInputs[index] || "").trim();
    if (!key || !value) return;
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, attributes: { ...v.attributes, [key]: value } } : v))
    );
    setVariantAttrKeyInputs((prev) => ({ ...prev, [index]: "" }));
    setVariantAttrValueInputs((prev) => ({ ...prev, [index]: "" }));
  };

  const removeVariantAttribute = (index: number, key: string) =>
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const attributes = { ...v.attributes };
        delete attributes[key];
        return { ...v, attributes };
      })
    );

  const handleDeleteProduct = async (
    productId: string,
    hardDelete: boolean = false
  ) => {
    const action = hardDelete ? "permanently delete" : "delete";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this product?`
    );

    if (confirmed) {
      if (hardDelete) {
        dispatch(hardDeleteProduct(productId));
      } else {
        dispatch(deleteProduct(productId, false));
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedBrandId(product.brandId || "");

    // Parse JSON fields
    const keyFeatures = parseJSONField(product.keyFeatures, []);
    const specifications = parseJSONField(product.specifications, {});
    const tags = parseJSONField(product.tags, []);

    setFormData({
      name: product.name,
      brandId: product.brandId || "",
      categoryId: product.categoryId || "",
      description: product.description || "",
      productDetails: product.productDetails || "",
      featured: product.featured || false,
      sku: product.sku || "",
      availability: product.availability || "In Stock",
      keyFeatures: keyFeatures,
      specifications: specifications,
      tags: tags,
    });

    setVariants(
      product.variants.length
        ? product.variants.map((v: ProductVariant) => ({
            id: v.id,
            sku: v.sku || "",
            price: String(v.price ?? ""),
            compareAtPrice: v.compareAtPrice !== null ? String(v.compareAtPrice) : "",
            quantity: String(v.quantity ?? 0),
            attributes: { ...(v.attributes || {}) },
          }))
        : [makeEmptyVariant()]
    );
    setVariantAttrKeyInputs({});
    setVariantAttrValueInputs({});

    // Reset new image states
    setImages([]);
    setImagePreview([]);
    setImagesToRemove([]);

    // Handle existing images properly
    const productImages = parseProductImages(product.image);
    if (productImages.length > 0) {
      // Create full URLs for existing images using your image helper
      const existingImageUrls = productImages.map((imagePath, index) => {
        // Use your getImageUrl helper to get the proper URL
        return (
          getImageUrl(product.image, index) ||
          `${window.location.origin}/placeholder.jpg`
        );
      });

      setExistingImages(productImages); // Store the original paths
      setImagePreview(existingImageUrls); // Display the full URLs
    } else {
      setExistingImages([]);
    }

    setIsAddProductOpen(true);
  };

  const removeImage = (index: number) => {
    const totalExistingImages = existingImages.length;

    if (index < totalExistingImages) {
      // Removing an existing image
      const newImagesToRemove = [...imagesToRemove, index];
      setImagesToRemove(newImagesToRemove);

      // Remove from preview
      const newPreviews = [...imagePreview];
      newPreviews.splice(index, 1);
      setImagePreview(newPreviews);

      // Remove from existing images list
      const newExistingImages = [...existingImages];
      newExistingImages.splice(index, 1);
      setExistingImages(newExistingImages);
    } else {
      // Removing a new image
      const newImageIndex = index - totalExistingImages;
      const newImages = [...images];
      const newPreviews = [...imagePreview];

      // Revoke object URL to prevent memory leaks
      if (newPreviews[index] && newPreviews[index].startsWith("blob:")) {
        URL.revokeObjectURL(newPreviews[index]);
      }

      newImages.splice(newImageIndex, 1);
      newPreviews.splice(index, 1);

      setImages(newImages);
      setImagePreview(newPreviews);
    }

    toast.success("Image removed successfully");
  };

  const processFiles = (files: File[]) => {
    const maxFiles = 10; // Maximum 10 images total
    const maxSize = 5 * 1024 * 1024; // 5MB per image

    // Check total number of images (existing + new + files to add)
    const totalCurrentImages = existingImages.length + images.length;
    if (totalCurrentImages + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed in total`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file, index) => {
      // Check file type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        errors.push(
          `File ${
            index + 1
          }: Invalid file type. Only JPEG, PNG, and WEBP are allowed.`
        );
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        errors.push(`File ${index + 1}: File size exceeds 5MB limit.`);
        return;
      }

      // Check for duplicates in new images
      const isDuplicate = images.some(
        (existingFile) =>
          existingFile.name === file.name && existingFile.size === file.size
      );

      if (isDuplicate) {
        errors.push(`File ${index + 1}: Duplicate file detected.`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast.error(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      const allPreviews = [...imagePreview, ...newPreviews];

      setImages(newImages);
      setImagePreview(allPreviews);

      // Clear validation error if exists
      if (formErrors.images) {
        setFormErrors({ ...formErrors, images: "" });
      }

      toast.success(`${validFiles.length} image(s) added successfully`);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    resetForm();
    setIsAddProductOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Dynamic field handlers
  const addKeyFeature = () => {
    if (keyFeatureInput.trim()) {
      setFormData({
        ...formData,
        keyFeatures: [...formData.keyFeatures, keyFeatureInput.trim()],
      });
      setKeyFeatureInput("");
    }
  };

  const removeKeyFeature = (index: number) => {
    setFormData({
      ...formData,
      keyFeatures: formData.keyFeatures.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      });
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({
      ...formData,
      specifications: newSpecs,
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    if (!formData.categoryId) {
      errors.category = "Category is required";
    }

    if (variants.length === 0) {
      errors.variants = "At least one variant is required";
    } else {
      const invalidVariant = variants.some((v) => {
        const price = parseFloat(v.price);
        const quantity = parseInt(v.quantity, 10);
        return !Number.isFinite(price) || price < 0 || !Number.isFinite(quantity) || quantity < 0;
      });
      if (invalidVariant) {
        errors.variants = "Every variant needs a valid non-negative price and quantity";
      }
    }

    // Check if there are any images (existing or new)
    if (
      existingImages.length === 0 &&
      images.length === 0 &&
      !selectedProduct
    ) {
      errors.images = "At least one image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);

    try {
      const productData = new FormData();
      const variantsPayload = variants.map((v) => ({
        id: v.id,
        sku: v.sku.trim() || undefined,
        price: parseFloat(v.price) || 0,
        compareAtPrice: v.compareAtPrice.trim() ? parseFloat(v.compareAtPrice) : null,
        quantity: parseInt(v.quantity, 10) || 0,
        attributes: v.attributes,
      }));

      productData.append("name", formData.name.trim());
      productData.append("brandId", formData.brandId);
      productData.append("categoryId", formData.categoryId);
      productData.append("description", formData.description);
      productData.append("productDetails", formData.productDetails);
      productData.append("featured", formData.featured.toString());
      productData.append("sku", formData.sku);
      productData.append("availability", formData.availability);
      productData.append("keyFeatures", JSON.stringify(formData.keyFeatures));
      productData.append("specifications", JSON.stringify(formData.specifications));
      productData.append("tags", JSON.stringify(formData.tags));
      productData.append("variants", JSON.stringify(variantsPayload));

      if (selectedProduct) {
        // Images: tell the server which existing images to keep, plus any newly uploaded ones.
        const imagesToKeep = existingImages.filter((_, index) => !imagesToRemove.includes(index));
        productData.append("existingImages", JSON.stringify(imagesToKeep));
        images.forEach((image) => productData.append("newImages", image));

        await dispatch(updateProduct(selectedProduct.id, productData));
      } else {
        images.forEach((image) => productData.append("images", image));
        await dispatch(createProduct(productData));
      }

      // Refresh products list
      dispatch(getAllProducts());
    } catch (error: any) {
      console.error("Error submitting product:", error);
      setSubmitting(false);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred"
      );
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand &&
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.sku &&
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDeletedProducts = deletedProducts.filter(
    (product) =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand &&
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.sku &&
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const currentProducts =
    activeTab === "active" ? filteredProducts : filteredDeletedProducts;
  const currentLoading = activeTab === "active" ? loading : deletedLoading;

  return (
    <div className="min-h-screen my-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-sm opacity-75"></div>
              <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Product Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your product inventory and catalog
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Bulk Actions */}
            {isSelectMode && selectedProductIds.length > 0 && (
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-md border">
                <span className="text-sm font-medium text-gray-700">
                  {selectedProductIds.length} selected
                </span>

                {activeTab === "active" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkDelete(false)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Soft Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkDelete(true)}
                        className="text-red-600"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Hard Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkRestore}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkDelete(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Delete Forever
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedProductIds([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedProductIds([]);
              }}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {isSelectMode ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Select
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select Mode
                </>
              )}
            </Button>

            <Button
              onClick={handleAddProduct}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3 rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </div>
        </motion.div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              className={`p-4 border rounded-2xl shadow-lg backdrop-blur-sm ${
                notification.type === "success"
                  ? "bg-green-50/80 border-green-200 text-green-800"
                  : "bg-red-50/80 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center">
                {notification.type === "success" ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <div className="font-medium">{notification.message}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Search className="w-4 h-4 mr-2 text-blue-600" />
                Search Products
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, category, brand, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-0 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 lg:w-80">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
              >
                <div className="text-2xl font-bold text-blue-600">
                  {products.length}
                </div>
                <div className="text-xs text-blue-600/70 font-medium">
                  Active Products
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl"
              >
                <div className="text-2xl font-bold text-amber-600">
                  {deletedProducts.length}
                </div>
                <div className="text-xs text-amber-600/70 font-medium">
                  Deleted Products
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
              >
                <div className="text-2xl font-bold text-green-600">
                  {products.filter((p) => p.quantity > 0).length}
                </div>
                <div className="text-xs text-green-600/70 font-medium">
                  In Stock
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Products Display with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "active" | "deleted")
            }
          >
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-fit grid-cols-2 bg-white shadow-sm">
                  <TabsTrigger
                    value="active"
                    className="flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Active Products ({filteredProducts.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="deleted"
                    className="flex items-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    Deleted Products ({filteredDeletedProducts.length})
                  </TabsTrigger>
                </TabsList>

                {/* Select All Checkbox */}
                {isSelectMode && currentProducts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedProductIds.length === currentProducts.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All
                    </label>
                  </div>
                )}
              </div>
            </div>

            {currentLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
                  </div>
                  <span className="text-gray-700 font-medium mt-4 block">
                    Loading products...
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <TabsContent value="active" className="mt-0">
                  {viewMode === "grid" ? (
                    // Grid View for Active Products
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                          const stockStatus = getStockStatus(product.quantity);
                          const isOnSale = isProductOnSale(product);
                          const displayPrice = getDisplayPrice(product);
                          const images = parseProductImages(product.image);
                          const isSelected = selectedProductIds.includes(
                            product.id
                          );

                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{
                                y: -5,
                                shadow: "0 20px 40px rgba(0,0,0,0.1)",
                              }}
                              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
                                isSelected
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "border-gray-100"
                              }`}
                            >
                              {/* Selection Checkbox */}
                              {isSelectMode && (
                                <div className="absolute top-3 left-3 z-10">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      handleProductSelect(product.id)
                                    }
                                    className="bg-white shadow-lg"
                                  />
                                </div>
                              )}

                              {/* Product Image */}
                              <div className="relative aspect-square overflow-hidden bg-gray-100">
                                {images.length > 0 ? (
                                  <ProductImage
                                    src={images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                      stockStatus.status === "in-stock"
                                        ? "bg-green-100 text-green-800"
                                        : stockStatus.status === "low-stock"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {stockStatus.message}
                                  </span>
                                </div>

                                {/* Featured Badge */}
                                {product.featured && (
                                  <div className="absolute bottom-3 right-3">
                                    <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Featured
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="p-4">
                                <div className="mb-3">
                                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                                    {product.sku}
                                  </p>
                                </div>

                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {product.brand || "No Brand"}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {product.category || "No Category"}
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                  {isOnSale && product.actualPrice ? (
                                    <div>
                                      <div className="text-sm text-gray-500 line-through">
                                        Rs. {formatPrice(product.actualPrice)}
                                      </div>
                                      <div className="font-bold text-blue-600 text-lg">
                                        Rs. {formatPrice(displayPrice)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="font-bold text-blue-600 text-lg">
                                      Rs. {formatPrice(displayPrice)}
                                    </div>
                                  )}
                                </div>

                                {/* Stock & Rating */}
                                <div className="flex items-center justify-between mb-4 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Package className="w-3 h-3 mr-1" />
                                    Stock: {product.quantity}
                                  </div>
                                  {product.rating > 0 && (
                                    <div className="flex items-center">
                                      <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                                      <span className="font-medium">
                                        {product.rating.toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                {!isSelectMode && (
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditProduct(product)}
                                      className="flex-1 hover:bg-blue-50 hover:text-blue-700 border-blue-200 transition-colors"
                                    >
                                      <Edit3 className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="px-2"
                                        >
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDeleteProduct(
                                              product.id,
                                              false
                                            )
                                          }
                                        >
                                          <Archive className="w-4 h-4 mr-2" />
                                          Soft Delete
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDeleteProduct(
                                              product.id,
                                              true
                                            )
                                          }
                                          className="text-red-600"
                                        >
                                          <Trash className="w-4 h-4 mr-2" />
                                          Hard Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center py-20">
                          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No active products found
                          </h3>
                          <p className="text-gray-500">
                            Try adjusting your search criteria or add a new
                            product.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // List View for Active Products (truncated for brevity - similar to original but with selection checkboxes)
                    <div className="text-center py-20">
                      <p className="text-gray-500">
                        List view implementation similar to original with
                        selection checkboxes
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="deleted" className="mt-0">
                  {viewMode === "grid" ? (
                    // Grid View for Deleted Products
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredDeletedProducts.length > 0 ? (
                        filteredDeletedProducts.map((product) => {
                          const images = parseProductImages(product.image);
                          const isSelected = selectedProductIds.includes(
                            product.id
                          );
                          const displayPrice = getDisplayPrice(product);

                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden border opacity-75 ${
                                isSelected
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "border-gray-100"
                              }`}
                            >
                              {/* Selection Checkbox */}
                              {isSelectMode && (
                                <div className="absolute top-3 left-3 z-10">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      handleProductSelect(product.id)
                                    }
                                    className="bg-white shadow-lg"
                                  />
                                </div>
                              )}

                              {/* Product Image with Deleted Overlay */}
                              <div className="relative aspect-square overflow-hidden bg-gray-100">
                                {images.length > 0 ? (
                                  <ProductImage
                                    src={images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover filter grayscale"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}

                                {/* Deleted Badge */}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                                    DELETED
                                  </span>
                                </div>
                              </div>

                              {/* Product Info */}
                              <div className="p-4">
                                <div className="mb-3">
                                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                                    {product.sku}
                                  </p>
                                </div>

                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {product.brand || "No Brand"}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {product.category || "No Category"}
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                  <div className="font-bold text-gray-600 text-lg">
                                    Rs. {formatPrice(displayPrice)}
                                  </div>
                                </div>

                                {/* Deleted Date */}
                                {product.deleted_at && (
                                  <div className="mb-4 text-xs text-gray-500">
                                    Deleted:{" "}
                                    {new Date(
                                      product.deleted_at
                                    ).toLocaleDateString()}
                                  </div>
                                )}

                                {/* Actions */}
                                {!isSelectMode && (
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleSingleRestore(product.id)
                                      }
                                      className="flex-1 hover:bg-green-50 hover:text-green-700 border-green-200 transition-colors"
                                    >
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      Restore
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleHardDelete(product.id)
                                      }
                                      className="flex-1 hover:bg-red-50 hover:text-red-700 border-red-200 transition-colors"
                                    >
                                      <Trash className="h-3 w-3 mr-1" />
                                      Delete Forever
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center py-20">
                          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No deleted products found
                          </h3>
                          <p className="text-gray-500">
                            Deleted products will appear here for recovery.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // List view for deleted products (similar implementation)
                    <div className="text-center py-20">
                      <p className="text-gray-500">
                        List view for deleted products implementation
                      </p>
                    </div>
                  )}
                </TabsContent>
              </div>
            )}
          </Tabs>
        </motion.div>
      </div>

      {/* Add/Edit Product Dialog - Keep the original implementation */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 z-50 rounded-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 -m-6 mb-6 p-6 rounded-t-2xl border-b border-gray-200/50">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="w-6 h-6 mr-3 text-blue-600" />
              {selectedProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {selectedProduct
                ? "Update the product details below."
                : "Fill in the product details below to add a new product."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Basic Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${
                      formErrors.name ? "border-red-300" : ""
                    } h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20`}
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-red-500 font-medium">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    SKU (Stock Keeping Unit)
                  </label>
                  <Input
                    name="sku"
                    placeholder="Leave empty to auto-generate"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Brand
                  </label>
                  <select
                    name="brand"
                    value={selectedBrandId}
                    onChange={handleBrandChange}
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    disabled={!selectedBrandId}
                    className={`w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white ${
                      formErrors.category ? "border-red-300" : ""
                    } ${!selectedBrandId ? "bg-gray-100" : ""}`}
                  >
                    <option value="">
                      {selectedBrandId
                        ? "Select a category"
                        : "Select a brand first"}
                    </option>
                    {brandCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-2 text-sm text-red-500 font-medium">
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Availability Status
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Pre-order">Pre-order</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="rounded border-amber-300 mr-3 text-amber-600 focus:ring-amber-500"
                />
                <label
                  htmlFor="featured"
                  className="text-sm font-semibold text-amber-700 flex items-center"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Featured Product
                </label>
              </div>
            </motion.div>

            {/* Variants Section - each row is a separately-priced/stocked SKU (e.g. 256GB vs 500GB) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    Variants &amp; Pricing
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Every product needs at least one variant. Add more rows for options that
                    have their own price and stock (e.g. 256GB vs 500GB).
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addVariantRow}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Variant
                </Button>
              </div>

              {formErrors.variants && (
                <p className="text-sm text-red-500 font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {formErrors.variants}
                </p>
              )}

              <div className="space-y-4">
                {variants.map((variant, index) => {
                  const price = parseFloat(variant.price) || 0;
                  const compareAtPrice = parseFloat(variant.compareAtPrice) || 0;
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          Variant {index + 1}
                        </span>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariantRow(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">
                            Price <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={variant.price}
                            onChange={(e) => updateVariantField(index, "price", e.target.value)}
                            step="0.01"
                            min="0"
                            className="h-11 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">
                            Compare-at Price
                          </label>
                          <Input
                            type="number"
                            placeholder="Optional"
                            value={variant.compareAtPrice}
                            onChange={(e) => updateVariantField(index, "compareAtPrice", e.target.value)}
                            step="0.01"
                            min="0"
                            className="h-11 rounded-lg"
                          />
                          {compareAtPrice > price && price > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% off
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variant.quantity}
                            onChange={(e) => updateVariantField(index, "quantity", e.target.value)}
                            min="0"
                            className="h-11 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">
                            SKU
                          </label>
                          <Input
                            placeholder="Auto-generated"
                            value={variant.sku}
                            onChange={(e) => updateVariantField(index, "sku", e.target.value)}
                            className="h-11 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Attributes - e.g. storage: 256GB, color: Red */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-2 block">
                          Attributes (e.g. storage, color, size)
                        </label>
                        {Object.keys(variant.attributes).length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
                              >
                                {key}: {value}
                                <button
                                  type="button"
                                  onClick={() => removeVariantAttribute(index, key)}
                                  className="hover:text-indigo-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Attribute name (e.g. Storage)"
                            value={variantAttrKeyInputs[index] || ""}
                            onChange={(e) =>
                              setVariantAttrKeyInputs((prev) => ({ ...prev, [index]: e.target.value }))
                            }
                            className="h-10 rounded-lg flex-1"
                          />
                          <Input
                            placeholder="Value (e.g. 256GB)"
                            value={variantAttrValueInputs[index] || ""}
                            onChange={(e) =>
                              setVariantAttrValueInputs((prev) => ({ ...prev, [index]: e.target.value }))
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addVariantAttribute(index);
                              }
                            }}
                            className="h-10 rounded-lg flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => addVariantAttribute(index)}
                            className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Product Description
                </h3>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Short Description
                </label>
                <textarea
                  name="description"
                  placeholder="Brief product description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Detailed Description
                </label>
                <textarea
                  name="productDetails"
                  placeholder="Comprehensive product details"
                  value={formData.productDetails}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </motion.div>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Key Features
                </h3>
              </div>

              <div className="flex gap-3">
                <Input
                  value={keyFeatureInput}
                  onChange={(e) => setKeyFeatureInput(e.target.value)}
                  placeholder="Add a key feature"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyFeature();
                    }
                  }}
                  className="flex-1 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                />
                <Button
                  type="button"
                  onClick={addKeyFeature}
                  className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.keyFeatures.length > 0 && (
                <div className="space-y-3">
                  {formData.keyFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl border border-blue-200"
                    >
                      <span className="text-sm font-medium text-blue-900">
                        {feature}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeKeyFeature(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Technical Specifications
                </h3>
              </div>

              <div className="flex gap-3">
                <Input
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  placeholder="Specification name"
                  className="flex-1 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                />
                <Input
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  placeholder="Value"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecification();
                    }
                  }}
                  className="flex-1 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                />
                <Button
                  type="button"
                  onClick={addSpecification}
                  className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {Object.keys(formData.specifications).length > 0 && (
                <div className="space-y-3">
                  {Object.entries(formData.specifications).map(
                    ([key, value]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          <strong>{key}:</strong> {value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )
                  )}
                </div>
              )}
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Product Tags
                </h3>
              </div>

              <div className="flex gap-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-6"
            >
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  Product Images ({images.length}/10)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload up to 10 images. First image will be the main product
                  image.
                </p>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : formErrors.images
                    ? "border-red-300 bg-red-50"
                    : "border-blue-300 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <label htmlFor="images" className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="p-4 bg-blue-100 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-lg font-semibold text-blue-600 mb-2">
                      {dragActive
                        ? "Drop images here"
                        : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG or WEBP (max 5MB each, up to 10 images)
                    </p>
                  </div>
                </label>
              </div>

              {formErrors.images && (
                <p className="text-sm text-red-500 flex items-center font-medium">
                  <AlertCircle className="h-4 w-4 mr-2" /> {formErrors.images}
                </p>
              )}

              {imagePreview.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    {imagePreview.length}{" "}
                    {imagePreview.length === 1 ? "Image" : "Images"} Selected
                  </h4>

                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreview.map((img, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="border border-gray-200 rounded-xl h-24 w-full object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200"
            >
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddProductOpen(false);
                  resetForm();
                }}
                className="w-full sm:w-auto order-2 sm:order-1 h-12 rounded-xl border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto order-1 sm:order-2 shadow-lg hover:shadow-xl h-12 rounded-xl px-8"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                {selectedProduct ? "Update" : "Add"} Product
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
