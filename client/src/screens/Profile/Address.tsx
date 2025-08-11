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
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { loadUser, updateProfile } from "../../redux/actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  Grid,
  List,
  Home,
  Building,
  Phone,
  Mail,
  User,
  Loader2,
  AlertCircle,
  X,
  Save,
  Star,
  Check,
  Navigation,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
} from "lucide-react";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";

// Address interface
interface Address {
  id: string;
  type: "Home" | "Work" | "Other";
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  isDefault: boolean;
  created_at?: string;
  updated_at?: string;
}

// Address form data interface
interface AddressFormData {
  type: "Home" | "Work" | "Other";
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

// View modes
type ViewMode = "card" | "list";

// Address types for filtering
const ADDRESS_TYPES = ["All", "Home", "Work", "Other"] as const;

const Address: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    user,
    loading,
    error: reduxError,
  } = useSelector((state: RootState) => state.user);

  // Local state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<(typeof ADDRESS_TYPES)[number]>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    type: "Home",
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  });

  // Refs for debugging
  const mountId = useRef(Math.random().toString(36).substr(2, 9));
  const renderCount = useRef(0);
  renderCount.current++;

  // Initialize addresses from user data
  useEffect(() => {
    if (user?.address) {
      try {
        // Parse addresses if it's a string, otherwise use as array
        const userAddresses =
          typeof user.address === "string"
            ? JSON.parse(user.address)
            : Array.isArray(user.address)
            ? user.address
            : [];

        // Ensure each address has required fields and an ID
        const processedAddresses = userAddresses.map(
          (addr: any, index: number) => ({
            id: addr.id || `addr_${Date.now()}_${index}`,
            type: addr.type || "Home",
            name: addr.name || "",
            addressLine1: addr.addressLine1 || addr.address || "",
            addressLine2: addr.addressLine2 || "",
            city: addr.city || "",
            state: addr.state || "",
            country: addr.country || "",
            postalCode: addr.postalCode || addr.zipCode || "",
            phone: addr.phone || "",
            isDefault: addr.isDefault || false,
            created_at: addr.created_at || new Date().toISOString(),
            updated_at: addr.updated_at || new Date().toISOString(),
          })
        );

        setAddresses(processedAddresses);
        console.log("📍 Addresses loaded:", processedAddresses);
      } catch (error) {
        console.error("❌ Error parsing user addresses:", error);
        setAddresses([]);
      }
    } else {
      setAddresses([]);
    }
  }, [user]);

  // Load user data on mount
  useEffect(() => {
    console.log(
      `🔍 Address component mount #${mountId.current}, Render: ${renderCount.current}`
    );
    if (!user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  // Filter and sort addresses
  const filteredAddresses = useMemo(() => {
    let filtered = addresses.filter((address) => {
      const matchesSearch =
        address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.addressLine1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "All" || address.type === typeFilter;

      return matchesSearch && matchesType;
    });

    // Sort addresses
    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [addresses, searchTerm, typeFilter, sortOrder]);

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      type: "Home",
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    });
    setEditingAddress(null);
  }, []);

  // Open add address form
  const openAddForm = useCallback(() => {
    resetForm();
    setShowAddressForm(true);
  }, [resetForm]);

  // Open edit address form
  const openEditForm = useCallback((address: Address) => {
    setFormData({
      type: address.type,
      name: address.name,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      phone: address.phone || "",
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowAddressForm(true);
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: keyof AddressFormData, value: string | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Validate form data
  const validateForm = useCallback((): string | null => {
    if (!formData.name.trim()) return "Address name is required";
    if (!formData.addressLine1.trim()) return "Address line 1 is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.country.trim()) return "Country is required";
    if (!formData.postalCode.trim()) return "Postal code is required";

    // Basic postal code validation
    if (!/^[\w\s-]{3,10}$/.test(formData.postalCode)) {
      return "Please enter a valid postal code";
    }

    return null;
  }, [formData]);

  // Save address (add or update)
  const saveAddress = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      let updatedAddresses: Address[];

      if (editingAddress) {
        // Update existing address
        updatedAddresses = addresses.map((addr) =>
          addr.id === editingAddress.id
            ? {
                ...addr,
                ...formData,
                updated_at: new Date().toISOString(),
              }
            : addr
        );
      } else {
        // Add new address
        const newAddress: Address = {
          id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        updatedAddresses = [...addresses, newAddress];
      }

      // If setting as default, remove default from other addresses
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map((addr) => ({
          ...addr,
          isDefault:
            addr.id ===
            (editingAddress?.id ||
              updatedAddresses[updatedAddresses.length - 1].id),
        }));
      }

      // Update user profile with new addresses
      const result = await dispatch(
        updateProfile({
          address: JSON.stringify(updatedAddresses),
        })
      );

      if (result.success) {
        setAddresses(updatedAddresses);
        setShowAddressForm(false);
        resetForm();
        console.log(
          `✅ Address ${editingAddress ? "updated" : "added"} successfully`
        );
      } else {
        throw new Error(result.error || "Failed to save address");
      }
    } catch (error) {
      console.error("❌ Error saving address:", error);
      setLocalError(
        `Failed to save address: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [addresses, editingAddress, formData, validateForm, dispatch, resetForm]);

  // Delete address
  const deleteAddress = useCallback(
    async (addressId: string) => {
      if (!window.confirm("Are you sure you want to delete this address?")) {
        return;
      }

      try {
        const updatedAddresses = addresses.filter(
          (addr) => addr.id !== addressId
        );

        // If deleted address was default and there are other addresses, make the first one default
        if (updatedAddresses.length > 0) {
          const deletedAddress = addresses.find(
            (addr) => addr.id === addressId
          );
          if (deletedAddress?.isDefault) {
            updatedAddresses[0].isDefault = true;
          }
        }

        const result = await dispatch(
          updateProfile({
            address: JSON.stringify(updatedAddresses),
          })
        );

        if (result.success) {
          setAddresses(updatedAddresses);
          console.log("✅ Address deleted successfully");
        } else {
          throw new Error(result.error || "Failed to delete address");
        }
      } catch (error) {
        console.error("❌ Error deleting address:", error);
        setLocalError(
          `Failed to delete address: ${error.message || "Unknown error"}`
        );
      }
    },
    [addresses, dispatch]
  );

  // Set default address
  const setDefaultAddress = useCallback(
    async (addressId: string) => {
      try {
        const updatedAddresses = addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === addressId,
        }));

        const result = await dispatch(
          updateProfile({
            address: JSON.stringify(updatedAddresses),
          })
        );

        if (result.success) {
          setAddresses(updatedAddresses);
          console.log("✅ Default address updated successfully");
        } else {
          throw new Error(result.error || "Failed to update default address");
        }
      } catch (error) {
        console.error("❌ Error setting default address:", error);
        setLocalError(
          `Failed to set default address: ${error.message || "Unknown error"}`
        );
      }
    },
    [addresses, dispatch]
  );

  // Get address type icon
  const getAddressTypeIcon = useCallback((type: string) => {
    switch (type) {
      case "Home":
        return <Home className="w-4 h-4" />;
      case "Work":
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  }, []);

  // Get address type color
  const getAddressTypeColor = useCallback((type: string) => {
    switch (type) {
      case "Home":
        return "bg-green-100 text-green-800 border-green-200";
      case "Work":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  }, []);

  // Render address card
  const renderAddressCard = useCallback(
    (address: Address) => (
      <Card
        key={address.id}
        className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white"
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${getAddressTypeColor(
                  address.type
                )}`}
              >
                {getAddressTypeIcon(address.type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{address.name}</h3>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAddressTypeColor(
                    address.type
                  )}`}
                >
                  {address.type}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {address.isDefault && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </span>
              )}
              <button
                onClick={() => openEditForm(address)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteAddress(address.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-medium">{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="font-medium">{address.country}</p>
            {address.phone && (
              <div className="flex items-center pt-2">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{address.phone}</span>
              </div>
            )}
          </div>

          {!address.isDefault && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setDefaultAddress(address.id)}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <Check className="w-4 h-4 mr-1" />
                Set as default
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    ),
    [
      getAddressTypeColor,
      getAddressTypeIcon,
      openEditForm,
      deleteAddress,
      setDefaultAddress,
    ]
  );

  // Render address list item
  const renderAddressListItem = useCallback(
    (address: Address) => (
      <div
        key={address.id}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div
              className={`p-2 rounded-lg ${getAddressTypeColor(address.type)}`}
            >
              {getAddressTypeIcon(address.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {address.name}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAddressTypeColor(
                    address.type
                  )}`}
                >
                  {address.type}
                </span>
                {address.isDefault && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <span>{address.addressLine1}</span>
                {address.addressLine2 && <span>, {address.addressLine2}</span>}
                <span>
                  , {address.city}, {address.state} {address.postalCode}
                </span>
                <span>, {address.country}</span>
              </div>
              {address.phone && (
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Phone className="w-3 h-3 mr-1" />
                  <span>{address.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {!address.isDefault && (
              <button
                onClick={() => setDefaultAddress(address.id)}
                className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4 mr-1" />
                Set Default
              </button>
            )}
            <button
              onClick={() => openEditForm(address)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteAddress(address.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    ),
    [
      getAddressTypeColor,
      getAddressTypeIcon,
      openEditForm,
      deleteAddress,
      setDefaultAddress,
    ]
  );

  // Display error message
  const errorMessage =
    localError || (typeof reduxError === "string" ? reduxError : null);

  // Loading state
  if (loading && addresses.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading Addresses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mt-16 pt-16 sm:pt-20 sm:mt-20 md:pt-24 md:mt-22 lg:pt-28 lg:mt-24 xl:pt-32 xl:mt-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
              <p className="text-gray-600">
                Manage your delivery and billing addresses
              </p>
            </div>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </button>
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

        {/* Search and Controls */}
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search addresses by name, city, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters and Controls */}
              <div className="flex items-center space-x-4">
                {/* Type Filter */}
                <div className="relative">
                  <select
                    className="appearance-none h-12 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(
                        e.target.value as (typeof ADDRESS_TYPES)[number]
                      )
                    }
                  >
                    {ADDRESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort */}
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="inline-flex items-center px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === "asc" ? "Z-A" : "A-Z"}`}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>

                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "card"
                        ? "bg-blue-500 text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Refresh */}
                <button
                  onClick={() => dispatch(loadUser())}
                  className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh addresses"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 mb-1">
                    Total Addresses
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {addresses.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 mb-1">
                    Home Addresses
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {addresses.filter((addr) => addr.type === "Home").length}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl">
                  <Home className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 mb-1">
                    Work Addresses
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {addresses.filter((addr) => addr.type === "Work").length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Addresses Display */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="border-b border-gray-200 p-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center text-xl font-bold text-gray-900">
                <Navigation className="w-5 h-5 mr-2" />
                Your Addresses ({filteredAddresses.length})
              </div>
              <span className="text-sm text-gray-600 font-normal">
                {viewMode === "card" ? "Card View" : "List View"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredAddresses.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm || typeFilter !== "All"
                    ? "No matching addresses"
                    : "No addresses yet"}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed mb-6">
                  {searchTerm || typeFilter !== "All"
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "Add your first address to make ordering and deliveries easier."}
                </p>
                {!searchTerm && typeFilter === "All" && (
                  <button
                    onClick={openAddForm}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Address
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "card"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAddresses.map((address) =>
                  viewMode === "card"
                    ? renderAddressCard(address)
                    : renderAddressListItem(address)
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Form Dialog */}
        <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
            <DialogHeader className="border-b border-gray-200 pb-6 bg-white -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </div>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Name *
                  </label>
                  <Input
                    placeholder="e.g., Home, Work, Mom's House"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Address Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Type *
                  </label>
                  <select
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.type}
                    onChange={(e) =>
                      handleInputChange(
                        "type",
                        e.target.value as "Home" | "Work" | "Other"
                      )
                    }
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    placeholder="e.g., +1234567890"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Address Line 1 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <Input
                    placeholder="Street address, P.O. box, company name"
                    value={formData.addressLine1}
                    onChange={(e) =>
                      handleInputChange("addressLine1", e.target.value)
                    }
                    className="h-12"
                  />
                </div>

                {/* Address Line 2 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <Input
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    value={formData.addressLine2}
                    onChange={(e) =>
                      handleInputChange("addressLine2", e.target.value)
                    }
                    className="h-12"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <Input
                    placeholder="State or Province"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <Input
                    placeholder="Postal/ZIP code"
                    value={formData.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                    className="h-12"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <Input
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="h-12"
                  />
                </div>

                {/* Default Address Checkbox */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        handleInputChange("isDefault", e.target.checked)
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Set as default address
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    This address will be pre-selected for checkout and
                    deliveries
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={saveAddress}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingAddress ? "Update Address" : "Save Address"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Address;
