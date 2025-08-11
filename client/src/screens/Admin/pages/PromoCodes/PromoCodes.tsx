import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  createPromoCode,
  deletePromoCode,
  getAllPromoCodes,
  updatePromoCode,
  getPromoCode,
  clearErrors,
} from "../../../../redux/actions/promoAction";
import type { PromoCode } from "../../../../redux/constants/promoConstants";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../../redux/store";
import {
  Edit2,
  Trash2,
  Plus,
  X,
  Tag,
  Calendar,
  DollarSign,
  Percent,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  TrendingUp,
  Gift,
} from "lucide-react";
import {
  UPDATE_PROMOCODE_RESET,
  DELETE_PROMOCODE_RESET,
} from "../../../../redux/constants/promoConstants";

// Types
interface FormData {
  code: string;
  description: string;
  min_purchase: number;
  max_discount_amount: number;
  valid_from: string;
  valid_until: string;
  max_uses: number;
  is_active: boolean;
}

interface ValidationErrors {
  code?: string;
  discountPercent?: string;
  minPurchase?: string;
  maxDiscount?: string;
  validFrom?: string;
  validUntil?: string;
  maxUses?: string;
  description?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Validation functions
const validatePromoCode = (data: FormData): ValidationResult => {
  const errors: ValidationErrors = {};

  // Code validation
  if (!data.code || data.code.trim() === "") {
    errors.code = "Promo code is required";
  }

  // Min purchase validation
  if (data.min_purchase < 0) {
    errors.minPurchase = "Minimum purchase amount cannot be negative";
  }

  // Max discount validation
  if (data.max_discount_amount < 0) {
    errors.maxDiscount = "Maximum discount amount cannot be negative";
  }

  // Date validations
  const validFromDate = new Date(data.valid_from);
  const validUntilDate = new Date(data.valid_until);

  if (!data.valid_from) {
    errors.validFrom = "Start date is required";
  } else if (isNaN(validFromDate.getTime())) {
    errors.validFrom = "Invalid start date";
  }

  if (!data.valid_until) {
    errors.validUntil = "End date is required";
  } else if (isNaN(validUntilDate.getTime())) {
    errors.validUntil = "Invalid end date";
  }

  if (validFromDate && validUntilDate && validFromDate > validUntilDate) {
    errors.validUntil = "End date must be after start date";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const PromoCodes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const {
    promoCodes,
    loading,
    error: promoError,
  } = useSelector((state: RootState) => state.promoCodes);

  const {
    loading: actionLoading,
    isUpdated,
    isDeleted,
    error: actionError,
  } = useSelector((state: RootState) => state.promoCode);

  const {
    loading: detailsLoading,
    promoCode: promoCodeDetail,
    error: detailsError,
  } = useSelector((state: RootState) => state.promoCodeDetails);

  // State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [formData, setFormData] = useState<FormData>({
    code: "",
    description: "",
    min_purchase: 0,
    max_discount_amount: 0,
    valid_from: "",
    valid_until: "",
    max_uses: 0,
    is_active: true,
  });
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Load all promo codes on component mount
  useEffect(() => {
    dispatch(getAllPromoCodes());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (promoError) {
      toast.error(promoError);
      dispatch(clearErrors());
    }
    if (actionError) {
      toast.error(actionError);
      dispatch(clearErrors());
    }
    if (detailsError) {
      toast.error(detailsError);
      dispatch(clearErrors());
    }
  }, [dispatch, promoError, actionError, detailsError]);

  // Handle successful updates/deletes
  useEffect(() => {
    if (isUpdated) {
      toast.success("Promo code updated successfully");
      setIsModalOpen(false);
      dispatch({ type: UPDATE_PROMOCODE_RESET });
      dispatch(getAllPromoCodes());
    }
    if (isDeleted) {
      toast.success("Promo code deleted successfully");
      dispatch({ type: DELETE_PROMOCODE_RESET });
      dispatch(getAllPromoCodes());
    }
  }, [dispatch, isUpdated, isDeleted]);

  // Load promo code details when editing
  useEffect(() => {
    if (selectedPromoId && formMode === "edit") {
      dispatch(getPromoCode(selectedPromoId));
    }
  }, [dispatch, selectedPromoId, formMode]);

  // Populate form data when promo code details are loaded
  useEffect(() => {
    if (promoCodeDetail && formMode === "edit") {
      setFormData({
        code: promoCodeDetail.code || "",
        description: promoCodeDetail.description || "",
        min_purchase: promoCodeDetail.min_purchase || 0,
        max_discount_amount: promoCodeDetail.max_discount_amount || 0,
        valid_from: formatDateForInput(promoCodeDetail.valid_from) || "",
        valid_until: formatDateForInput(promoCodeDetail.valid_until) || "",
        max_uses: promoCodeDetail.max_uses || 0,
        is_active:
          promoCodeDetail.is_active !== undefined
            ? promoCodeDetail.is_active
            : true,
      });
    }
  }, [promoCodeDetail, formMode]);

  // Format date string for input field
  const formatDateForInput = (dateString: string | Date | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Format date for display
  const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if promo code is expired
  const isExpired = (validUntil: string | Date): boolean => {
    const today = new Date();
    const expireDate = new Date(validUntil);
    return expireDate < today;
  };

  // Filter promo codes based on search and status
  const filteredPromoCodes = promoCodes.filter((promo: PromoCode) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && promo.is_active) ||
      (statusFilter === "inactive" && !promo.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Clear error for the field being changed
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = (): void => {
    setFormData({
      code: "",
      description: "",
      min_purchase: 0,
      max_discount_amount: 0,
      valid_from: "",
      valid_until: "",
      max_uses: 0,
      is_active: true,
    });
    setErrors({});
  };

  const openCreateModal = (): void => {
    setFormMode("create");
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (promoId: string): void => {
    setFormMode("edit");
    setSelectedPromoId(promoId);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    resetForm();
    setSelectedPromoId(null);
  };

  const handleDelete = (promoId: string): void => {
    if (window.confirm("Are you sure you want to delete this promo code?")) {
      dispatch(deletePromoCode(promoId));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Parse numeric values
    const submissionData: FormData = {
      ...formData,
      min_purchase: Number(formData.min_purchase),
      max_discount_amount: Number(formData.max_discount_amount),
      max_uses: Number(formData.max_uses),
      code: formData.code.trim().toUpperCase(),
    };

    // Validate form
    const { isValid, errors } = validatePromoCode(submissionData);

    if (!isValid) {
      setErrors(errors);
      // Show first error message
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    try {
      const toastId = toast.loading(
        formMode === "create"
          ? "Creating promo code..."
          : "Updating promo code..."
      );

      if (formMode === "create") {
        await dispatch(createPromoCode(submissionData));
      } else if (selectedPromoId) {
        await dispatch(updatePromoCode(selectedPromoId, submissionData));
      }

      toast.dismiss(toastId);
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    }
  };

  // Get promo code statistics
  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter((p) => p.is_active).length,
    expired: promoCodes.filter((p) => isExpired(p.valid_until)).length,
    unlimited: promoCodes.filter((p) => p.max_uses === 0).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br my-10 from-slate-50 via-green-50 to-emerald-50">
      <div className="container mx-auto py-8 px-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur-sm opacity-75"></div>
              <div className="relative p-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl">
                <Tag className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Promo Code Management
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage discount codes for your store
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="mr-2 w-5 h-5" /> Create New Promo Code
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Codes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Active Codes
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Expired</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.expired}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Unlimited Use
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.unlimited}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search promo codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-0 bg-white/80 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "active" | "inactive"
                    )
                  }
                  className="border-0 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <button className="p-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Promo Code List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-emerald-50/30">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-emerald-600" />
              Promo Codes ({filteredPromoCodes.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600 mx-auto"></div>
                </div>
                <span className="text-gray-700 font-medium mt-4 block">
                  Loading promo codes...
                </span>
              </div>
            </div>
          ) : !promoCodes || promoCodes.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No promo codes found
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first promo code to get started.
              </p>
              <button
                onClick={openCreateModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Create Promo Code
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop View */}
              <div className="hidden lg:block">
                <table className="min-w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Code
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Min. Purchase
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Max. Discount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Validity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Uses
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPromoCodes.map((promo: PromoCode) => (
                      <motion.tr
                        key={promo.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {promo.code}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {promo.description}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            {promo.min_purchase > 0
                              ? `Rs. ${promo.min_purchase}`
                              : "None"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            {promo.max_discount_amount > 0
                              ? `Rs. ${promo.max_discount_amount}`
                              : "None"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(promo.valid_from)} -{" "}
                              {formatDate(promo.valid_until)}
                            </div>
                            {isExpired(promo.valid_until) && (
                              <span className="text-xs text-red-600 font-medium">
                                Expired
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <Users className="w-4 h-4 text-gray-400 mr-1" />
                            {promo.max_uses === 0
                              ? "Unlimited"
                              : promo.max_uses}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              promo.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {promo.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(promo.id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(promo.id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredPromoCodes.map((promo: PromoCode) => (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">
                          {promo.code}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {promo.description}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          promo.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {promo.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <div className="flex items-center text-gray-600 mb-1">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Min. Purchase
                        </div>
                        <div className="font-medium">
                          {promo.min_purchase > 0
                            ? `Rs. ${promo.min_purchase}`
                            : "None"}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-600 mb-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Valid Until
                        </div>
                        <div className="font-medium">
                          {formatDate(promo.valid_until)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-600 mb-1">
                          <Users className="w-3 h-3 mr-1" />
                          Max Uses
                        </div>
                        <div className="font-medium">
                          {promo.max_uses === 0 ? "Unlimited" : promo.max_uses}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => openEditModal(promo.id)}
                        className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="flex-1 bg-red-50 text-red-600 py-2 px-4 rounded-xl font-medium hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center px-8 py-6 bg-gradient-to-r from-emerald-50/80 to-green-50/80 border-b border-gray-200/50">
                <h3 className="text-2xl font-bold text-gray-900">
                  {formMode === "create"
                    ? "Create New Promo Code"
                    : "Edit Promo Code"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]"
              >
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Basic Information
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Promo Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                            errors.code ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="Enter promo code"
                          required
                          disabled={formMode === "edit" && detailsLoading}
                        />
                        {errors.code && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.code}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        placeholder="Enter promo code description"
                        disabled={formMode === "edit" && detailsLoading}
                      />
                    </div>
                  </div>

                  {/* Purchase Limits */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Purchase Limits
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Minimum Purchase Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="min_purchase"
                            value={formData.min_purchase}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className={`w-full border rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                              errors.minPurchase
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                            placeholder="0.00"
                            disabled={formMode === "edit" && detailsLoading}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            Rs.
                          </div>
                        </div>
                        {errors.minPurchase && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.minPurchase}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Maximum Discount Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="max_discount_amount"
                            value={formData.max_discount_amount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className={`w-full border rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                              errors.maxDiscount
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                            placeholder="0.00"
                            disabled={formMode === "edit" && detailsLoading}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            Rs.
                          </div>
                        </div>
                        {errors.maxDiscount && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.maxDiscount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Validity Period */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Validity Period
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Valid From <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="valid_from"
                            value={formData.valid_from}
                            onChange={handleInputChange}
                            className={`w-full border rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                              errors.validFrom
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                            required
                            disabled={formMode === "edit" && detailsLoading}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                        </div>
                        {errors.validFrom && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.validFrom}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Valid Until <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="valid_until"
                            value={formData.valid_until}
                            onChange={handleInputChange}
                            className={`w-full border rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                              errors.validUntil
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                            required
                            disabled={formMode === "edit" && detailsLoading}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                        </div>
                        {errors.validUntil && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.validUntil}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Usage Limits & Status */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Usage Limits & Status
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Maximum Uses (0 for unlimited)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="max_uses"
                            value={formData.max_uses}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            placeholder="0"
                            disabled={formMode === "edit" && detailsLoading}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Users className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status
                        </label>
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            disabled={formMode === "edit" && detailsLoading}
                          />
                          <label
                            htmlFor="is_active"
                            className="ml-3 block text-sm font-medium text-gray-700"
                          >
                            Active
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`px-8 py-3 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                      actionLoading
                        ? "bg-emerald-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {actionLoading
                      ? "Saving..."
                      : formMode === "create"
                      ? "Create Promo Code"
                      : "Update Promo Code"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromoCodes;
