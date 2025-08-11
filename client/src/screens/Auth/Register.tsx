import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  LockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  MonitorIcon,
  HomeIcon
} from "lucide-react";
import type { RootState } from "../../redux/store";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
// import FloatingCart from "../../components/FloatingCart";
import { register } from "../../redux/actions/userActions";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  [key: string]: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(1); // 1 for personal info, 2 for account details
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get user login state from Redux store
  const userRegister = useSelector((state: RootState) => state.user);
  const { user } = userRegister;

  // Get admin settings for company logo
  const adminSettings = useSelector((state: RootState) => state.adminSettings || {});
  const { companyLogo, companyName } = adminSettings;

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedOut = localStorage.getItem("loggedOut");

    if (user && token && loggedOut !== "true") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateStep1 = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        password: formData.password,
        role: "customer",
      };

      const response = await dispatch(register(registrationData) as any);

      if (response?.payload?.user) {
        localStorage.removeItem("loggedOut");

        if (response.payload.token) {
          localStorage.setItem("token", response.payload.token);
        }

        toast.success(`Welcome, ${response.payload.user.name || "User"}!`);
        setSuccess(true);

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.response?.status === 409) {
        setErrors({ email: "This email is already registered" });
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else if (err.response?.data?.error) {
        setErrors({ general: err.response.data.error });
      } else {
        setErrors({ general: "Unable to create account. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): string => {
    if (!password) return "";
    if (password.length < 8) return "weak";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return "medium";
    return "strong";
  };

  const renderPasswordStrength = () => {
    const strength = getPasswordStrength(formData.password);
    if (!strength) return null;

    const colors = {
      weak: "bg-red-500",
      medium: "bg-yellow-500",
      strong: "bg-green-500",
    };

    const textColors = {
      weak: "text-red-600",
      medium: "text-yellow-600",
      strong: "text-green-600",
    };

    const widths = {
      weak: "w-1/3",
      medium: "w-2/3",
      strong: "w-full",
    };

    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Password strength</span>
          <span className={`${textColors[strength]} font-medium capitalize`}>
            {strength}
          </span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors[strength]} ${widths[strength]} transition-all duration-300 rounded-full`}
          ></div>
        </div>
      </div>
    );
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <NavbarSection />
        {/* <FloatingCart /> */}

        <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 mb-16 sm:mb-20 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-center max-w-md w-full border border-gray-100"
          >
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">
              Account Created Successfully!
            </h3>
            <p className="text-gray-700 mb-6">
              Welcome to {companyName || "Joy Store"}! Redirecting you to home...
            </p>
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </motion.div>
        </div>

        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar Section */}
      <NavbarSection />

      {/* Floating Cart */}
      {/* <FloatingCart /> */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 mb-16 sm:mb-20 lg:mb-24">
        <div className="max-w-lg w-full space-y-6 sm:space-y-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            {/* Company Logo */}
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              {companyLogo ? (
                <motion.img
                  src={companyLogo}
                  alt={companyName || "Company Logo"}
                  className="h-12 w-auto sm:h-16 max-w-[200px] object-contain"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              ) : (
                <motion.div 
                  className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-3 sm:p-4 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
              )}
            </div>

            <motion.h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Create Your Account
            </motion.h2>
            <motion.p 
              className="text-gray-700 text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Join {companyName || "Joy Store"} and start shopping
            </motion.p>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100"
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-base ${
                  step === 1 ? "bg-green-600" : "bg-green-500"
                }`}>
                  {step === 1 ? "1" : <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <div className="w-12 sm:w-16 h-1 mx-2 sm:mx-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-green-600 transition-all duration-500 ${
                    step === 2 ? "w-full" : "w-0"
                  }`}></div>
                </div>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                  step === 2 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  2
                </div>
              </div>
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-sm text-gray-700 mb-6 sm:mb-8">
              <span className={step === 1 ? "text-green-600 font-semibold" : "font-medium"}>
                Personal Info
              </span>
              <span className={step === 2 ? "text-green-600 font-semibold" : "font-medium"}>
                Account Details
              </span>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-start"
                >
                  <XCircleIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{errors.general}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 sm:space-y-6"
                  >
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                            errors.name 
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" 
                              : "border-gray-200 focus:ring-green-500 focus:border-green-500 hover:border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 flex items-center"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <MailIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                            errors.email 
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" 
                              : "border-gray-200 focus:ring-green-500 focus:border-green-500 hover:border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 flex items-center"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                            errors.phone 
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" 
                              : "border-gray-200 focus:ring-green-500 focus:border-green-500 hover:border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.phone && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 flex items-center"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            {errors.phone}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="123 Main St, City, State"
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                            errors.address 
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" 
                              : "border-gray-200 focus:ring-green-500 focus:border-green-500 hover:border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.address && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 flex items-center"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            {errors.address}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleNext}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      Continue
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </motion.button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 sm:space-y-6"
                  >
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <LockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                            errors.password 
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" 
                              : "border-gray-200 focus:ring-green-500 focus:border-green-500 hover:border-gray-300"
                          }`}
                          required
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </motion.button>
                      </div>
                      {formData.password && renderPasswordStrength()}
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 flex items-center"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <LockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                            errors.confirmPassword 
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50" 
                              : "border-gray-200 focus:ring-green-500 focus:border-green-500 hover:border-gray-300"
                          }`}
                          required
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </motion.button>
                      </div>
                      <AnimatePresence>
                        {errors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 flex items-center"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <motion.button
                        type="button"
                        onClick={handleBack}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-black bg-gray-200 hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
                      >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`flex-1 flex items-center justify-center px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white shadow-lg transition-all duration-300 text-sm sm:text-base ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl"
                        }`}
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            Create Account
                            <CheckCircleIcon className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Login Link */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-sm text-gray-700">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                  Sign in
                </Link>
              </span>
            </motion.div>
          </motion.div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100"
          >
            <div className="flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
              <span className="text-sm sm:text-base font-semibold text-black">Secure Registration</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <motion.div 
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-green-100 rounded-full p-2 sm:p-3 mb-2">
                  <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-black font-medium">SSL Encrypted</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-blue-100 rounded-full p-2 sm:p-3 mb-2">
                  <SmartphoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm text-black font-medium">Mobile Friendly</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-purple-100 rounded-full p-2 sm:p-3 mb-2">
                  <MonitorIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <span className="text-xs sm:text-sm text-black font-medium">Multi-Device</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Support Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-center bg-white rounded-xl p-3 sm:p-4 border border-gray-100"
          >
            <p className="text-sm sm:text-base text-black font-semibold mb-3">Need help?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
              <motion.a 
                href="tel:9851343371" 
                className="text-green-600 hover:text-green-700 transition-colors flex items-center font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <PhoneIcon className="w-4 h-4 mr-1" />
                Kathmandu: 9851343371
              </motion.a>
              <span className="hidden sm:inline text-gray-400">|</span>
              <motion.a 
                href="tel:985-6060163" 
                className="text-green-600 hover:text-green-700 transition-colors flex items-center font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <PhoneIcon className="w-4 h-4 mr-1" />
                Pokhara: 985-6060163
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default Register;