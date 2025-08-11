import React, { useEffect, useState } from "react";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import { motion } from "framer-motion";
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  SendIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  HeadphonesIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  Zap,
  Globe,
  Award,
} from "lucide-react";
import { getAllFaqs } from "../../redux/actions/faqAction";
import {
  createContact,
  clearContactErrors,
} from "../../redux/actions/contactAction";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const CustomerSupport = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<
    Partial<ContactFormData>
  >({});

  // Get contact state from Redux
  const { loading, error, success } = useSelector(
    (state: RootState) => state.contact
  );

  // Fix: Use consistent Redux state path and add proper fallbacks
  const {
    faqs = [],
    loading: faqLoading = false,
    error: faqError = null,
  } = useSelector((state: RootState) => state.faqs || {});

  useEffect(() => {
    if (faqs.length === 0) {
      dispatch(getAllFaqs() as any);
    }
  }, [dispatch, faqs.length]);

  // Watch for Redux state changes to update local status
  useEffect(() => {
    if (success && isSubmitting) {
      setSubmitStatus("success");
      setIsSubmitting(false);
      // Clear form on success
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setValidationErrors({});

      // Clear success status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        dispatch(clearContactErrors());
      }, 5000);
    }

    if (error && isSubmitting) {
      setSubmitStatus("error");
      setIsSubmitting(false);

      // Clear error status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        dispatch(clearContactErrors());
      }, 5000);
    }
  }, [success, error, isSubmitting, dispatch]);

  // Validation function
  const validateForm = (): boolean => {
    const errors: Partial<ContactFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (Nepal phone number format)
    const phoneRegex = /^(?:\+977[-\s]?)?(?:9[0-9]{9}|01[-\s]?[0-9]{7})$/;
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ""))) {
      errors.phone = "Please enter a valid Nepal phone number";
    }

    // Subject validation
    if (!formData.subject) {
      errors.subject = "Please select a subject";
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 1000) {
      errors.message = "Message cannot exceed 1000 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ContactFormData]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous status
    setSubmitStatus(null);
    dispatch(clearContactErrors());

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare contact data matching the expected interface
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      };

      // Dispatch the action
      await dispatch(createContact(contactData) as any);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      setIsSubmitting(false);

      // Clear error status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }
  };

  const supportFeatures = [
    {
      icon: Zap,
      title: "Quick Response",
      description: "Average response time under 2 hours",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: HeadphonesIcon,
      title: "Expert Support",
      description: "Certified technicians ready to help",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Globe,
      title: "Multiple Channels",
      description: "Phone, email, and in-store support",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Award,
      title: "Satisfaction Guaranteed",
      description: "We don't stop until you're happy",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const quickHelp = [
    {
      icon: ShoppingBagIcon,
      title: "Order Status",
      description: "Track your recent orders",
      action: "Check Orders"
    },
    {
      icon: TruckIcon,
      title: "Delivery Info",
      description: "Delivery times and locations",
      action: "View Details"
    },
    {
      icon: CreditCardIcon,
      title: "Payment Help",
      description: "Payment methods and issues",
      action: "Get Help"
    },
    {
      icon: ShieldCheckIcon,
      title: "Warranty Claims",
      description: "Product warranty and repairs",
      action: "Start Claim"
    }
  ];

  if (faqLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <NavbarSection />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading support information...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavbarSection />

      <main className="pt-16 sm:pt-20 md:pt-24 lg:pt-28">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl">
                  <HeadphonesIcon className="h-16 w-16 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Customer Support
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
                We're here to help you with any questions, technical issues, or support needs
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>24/7 Phone Support</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                  <MessageCircleIcon className="w-4 h-4 mr-2" />
                  <span>Live Chat Available</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Email Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Support Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20"
          >
            {supportFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 sm:p-8 border border-white/20 hover:scale-105"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Quick Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 mb-16 sm:mb-20 border border-white/20"
          >
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Quick Help
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Common support topics for immediate assistance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {quickHelp.map((help, index) => (
                <motion.div
                  key={help.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 text-center cursor-pointer hover:scale-105"
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <help.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {help.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {help.description}
                  </p>
                  <button className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                    {help.action} →
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Store Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 sm:mb-20"
          >
            {/* Kathmandu Store */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Kathmandu Store
                  </h3>
                  <p className="text-green-600 font-medium">
                    Apple Authorized Reseller
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">
                      Tamrakar Complex Shop 9
                    </p>
                    <p className="text-gray-600">Newroad, Kathmandu</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <a
                    href="tel:9851343371"
                    className="text-gray-900 font-medium hover:text-green-600 transition-colors"
                  >
                    +977 985-1343371
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <p className="text-gray-600">Mon-Sat: 10:00 AM - 7:00 PM</p>
                </div>
              </div>

              <motion.a
                href="tel:9851343371"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Kathmandu Store
              </motion.a>
            </div>

            {/* Pokhara Store */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Pokhara Store
                  </h3>
                  <p className="text-blue-600 font-medium">
                    Apple Authorized Reseller
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Mahendrapool</p>
                    <p className="text-gray-600">
                      Infront of Sita Bhawan, Pokhara
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <a
                    href="tel:9856060163"
                    className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
                  >
                    +977 985-6060163
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <p className="text-gray-600">Mon-Sat: 10:00 AM - 7:00 PM</p>
                </div>
              </div>

              <motion.a
                href="tel:9856060163"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Pokhara Store
              </motion.a>
            </div>
          </motion.div>

          {/* Email Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-10 mb-16 sm:mb-20 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Email Support
            </h3>
            <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
              Get detailed responses within 24 hours for any technical inquiries or support needs
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                href="mailto:support@joystore.com.np"
                className="text-gray-900 font-bold text-lg hover:text-purple-600 transition-colors"
              >
                support@joystore.com.np
              </a>
              <motion.a
                href="mailto:support@joystore.com.np"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-xl text-white font-bold px-8 py-3 rounded-2xl transition-all duration-300"
              >
                <Mail className="w-5 h-5 mr-2 inline" />
                Send Email
              </motion.a>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-12">
            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-white/20"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-2xl">
                  <HelpCircle className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h2>
              </div>

              {faqs && faqs.length > 0 ? (
                <div className="space-y-6">
                  {faqs
                    .filter((faq) => faq && faq.question && faq.answer)
                    .slice(0, 6)
                    .map((faq, index) => (
                      <motion.div
                        key={faq.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">Loading FAQs...</p>
                </div>
              )}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-white/20"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl">
                  <MessageCircleIcon className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Send us a Message
                </h2>
              </div>

              {/* Submit Status */}
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center ${
                    submitStatus === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {submitStatus === "success" ? (
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircleIcon className="w-5 h-5 mr-2" />
                  )}
                  {submitStatus === "success"
                    ? "Message sent successfully! We'll get back to you soon."
                    : "Failed to send message. Please try again or contact us directly."}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        validationErrors.name
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Your full name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        validationErrors.phone
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="98XXXXXXXX"
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      validationErrors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      validationErrors.subject
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a subject</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="warranty-claim">Warranty Claim</option>
                    <option value="delivery-issue">Delivery Issue</option>
                    <option value="payment-problem">Payment Problem</option>
                    <option value="return-exchange">Return & Exchange</option>
                    <option value="complaint">Complaint</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.subject && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message * ({formData.message.length}/1000)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    maxLength={1000}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all ${
                      validationErrors.message
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Please describe your issue or inquiry in detail..."
                  />
                  {validationErrors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting || loading}
                  whileHover={{
                    scale: isSubmitting || loading ? 1 : 1.02,
                  }}
                  whileTap={{ scale: isSubmitting || loading ? 1 : 0.98 }}
                  className={`w-full flex items-center justify-center px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                    isSubmitting || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl text-white"
                  }`}
                >
                  {isSubmitting || loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-8 sm:p-12 text-center mt-16 sm:mt-20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Need Immediate Assistance?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              For urgent technical issues or immediate support, call us directly. Our support team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="tel:9851343371"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Kathmandu: 9851343371
              </motion.a>
              <motion.a
                href="tel:9856060163"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Pokhara: 9856060163
              </motion.a>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default CustomerSupport;