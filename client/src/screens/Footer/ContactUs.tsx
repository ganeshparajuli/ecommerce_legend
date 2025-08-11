import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  SendIcon,
  UserIcon,
  MessageCircleIcon,
  HelpCircleIcon,
  HeadphonesIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "lucide-react";
import {
  PageLayout,
  Breadcrumb,
} from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import {
  createContact,
  clearContactErrors,
} from "../../redux/actions/contactAction";
import { getAllFaqs } from "../../redux/actions/faqAction";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactUs = () => {
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

  const { faqs = [] } = useSelector((state: RootState) => state.faqs || {});

  useEffect(() => {
    // Fetch FAQs on component mount
    dispatch(getAllFaqs() as any);
  }, [dispatch]);

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

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Contact Us", href: "/contact-us", current: true },
  ];

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: "Phone Numbers",
      details: [
        { label: "Kathmandu", value: "9851343371" },
        { label: "Pokhara", value: "985-6060163" },
        { label: "General", value: "Available 10 AM - 8 PM" },
      ],
      color: "text-green-600",
    },
    {
      icon: MailIcon,
      title: "Email Addresses",
      details: [
        { label: "General", value: "info@joystore.com" },
        { label: "Support", value: "support@joystore.com" },
        { label: "Sales", value: "sales@joystore.com" },
      ],
      color: "text-blue-600",
    },
    {
      icon: MapPinIcon,
      title: "Kathmandu Store",
      details: [
        { label: "Address", value: "Tamrakar Complex Shop 9" },
        { label: "Location", value: "Newroad, Kathmandu" },
        { label: "Phone", value: "9851343371" },
      ],
      color: "text-red-600",
    },
    {
      icon: MapPinIcon,
      title: "Pokhara Store",
      details: [
        { label: "Address", value: "Mahendrapool" },
        { label: "Location", value: "Infront of Sita Bhawan" },
        { label: "Phone", value: "985-6060163" },
      ],
      color: "text-purple-600",
    },
  ];

  const storeHours = {
    icon: ClockIcon,
    title: "Store Hours",
    details: [
      { label: "Mon - Sat", value: "10:00 AM - 8:00 PM" },
      { label: "Sunday", value: "11:00 AM - 6:00 PM" },
      { label: "Holidays", value: "Closed" },
    ],
    color: "text-orange-600",
  };

  const socialLinks = [
    {
      icon: FacebookIcon,
      name: "Facebook",
      href: "https://facebook.com/joystorenepal",
      color: "hover:text-blue-600",
    },
    {
      icon: InstagramIcon,
      name: "Instagram",
      href: "https://www.instagram.com/joy_store_nepal?igsh=MW9uMTVxeGJlam9mZw==",
      color: "hover:text-pink-600",
    },
    {
      icon: MessageCircleIcon,
      name: "WhatsApp",
      href: "https://wa.me/9779851343371",
      color: "hover:text-green-600",
    },
  ];

  // const faqData = [
  //   {
  //     icon: ShoppingBagIcon,
  //     question: "How do I place an order?",
  //     answer:
  //       "You can place orders through our website, mobile app, or by visiting our physical stores in Kathmandu or Pokhara. Online orders can be placed 24/7.",
  //   },
  //   {
  //     icon: CreditCardIcon,
  //     question: "What payment methods do you accept?",
  //     answer:
  //       "We accept cash, all major credit/debit cards, mobile banking, and digital wallets like eSewa, Khalti, and IME Pay.",
  //   },
  //   {
  //     icon: TruckIcon,
  //     question: "How long does delivery take?",
  //     answer:
  //       "Delivery within Kathmandu and Pokhara valley takes 1-2 days. Outside valley deliveries take 3-5 days depending on location.",
  //   },
  //   {
  //     icon: ShieldCheckIcon,
  //     question: "Do you provide warranty?",
  //     answer:
  //       "Yes, all our products come with official manufacturer warranty. We also provide additional service warranty for select items.",
  //   },
  // ];

  const quickActions = [
    {
      title: "Track Your Order",
      description: "Check the status of your recent orders",
      icon: TruckIcon,
      action: "Track Now",
    },
    {
      title: "Return & Exchange",
      description: "Process returns or exchanges easily",
      icon: ShieldCheckIcon,
      action: "Start Return",
    },
    {
      title: "Technical Support",
      description: "Get help with product setup and issues",
      icon: HeadphonesIcon,
      action: "Get Support",
    },
    {
      title: "Bulk Orders",
      description: "Special pricing for bulk purchases",
      icon: ShoppingBagIcon,
      action: "Contact Sales",
    },
  ];

  return (
    <div>
      <PageLayout>
        <Breadcrumb items={breadcrumbItems} />

        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-center mb-6">
                  <MessageCircleIcon className="w-12 h-12 text-blue-600 mr-4" />
                  <span className="text-blue-600 font-semibold text-xl">
                    Get In Touch
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  We're Here to
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    {" "}
                    Help You
                  </span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Have questions about our products or services? Need technical
                  support? Want to place a bulk order? Our friendly team is
                  ready to assist you with anything you need.
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center bg-white/80 px-4 py-2 rounded-full">
                    <PhoneIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span>Quick Response</span>
                  </div>
                  <div className="flex items-center bg-white/80 px-4 py-2 rounded-full">
                    <HeadphonesIcon className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Expert Support</span>
                  </div>
                  <div className="flex items-center bg-white/80 px-4 py-2 rounded-full">
                    <ClockIcon className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Available 6 Days a Week</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
          {/* Quick Actions */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <p className="text-gray-600">
                  Need immediate assistance? Try these quick options
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center cursor-pointer"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                      <action.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {action.description}
                    </p>
                    <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                      {action.action} →
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          {/* Contact Information */}
          <section className="py-20 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Multiple ways to reach us. Choose what works best for you.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-8 shadow-lg text-center"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 ${info.color
                        .replace("text-", "bg-")
                        .replace("-600", "-100")} rounded-2xl mb-6`}
                    >
                      <info.icon className={`w-8 h-8 ${info.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      {info.title}
                    </h3>
                    <div className="space-y-3">
                      {info.details.map((detail, idx) => (
                        <div key={idx} className="text-left">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {detail.label}
                          </div>
                          <div className="text-gray-800 font-medium">
                            {detail.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {/* Store Hours Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-8 shadow-lg text-center"
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 ${storeHours.color
                      .replace("text-", "bg-")
                      .replace("-600", "-100")} rounded-2xl mb-6`}
                  >
                    <storeHours.icon
                      className={`w-8 h-8 ${storeHours.color}`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {storeHours.title}
                  </h3>
                  <div className="space-y-3">
                    {storeHours.details.map((detail, idx) => (
                      <div key={idx} className="text-left">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {detail.label}
                        </div>
                        <div className="text-gray-800 font-medium">
                          {detail.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
          {/* Contact Form & Map */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      Send us a Message
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Fill out the form below and we'll get back to you as soon
                      as possible.
                    </p>

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
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors.subject
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="sales">Sales Question</option>
                          <option value="warranty">Warranty Claim</option>
                          <option value="complaint">Complaint</option>
                          <option value="feedback">Feedback</option>
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
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                            validationErrors.message
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Please describe your inquiry in detail..."
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
                            : "bg-gradient-to-r from-blue-600 to-green-600 hover:shadow-xl text-white"
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
                  </div>
                </motion.div>

                {/* Map & Social */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  {/* Map Placeholder */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Find Our Stores
                    </h3>
                    <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-xl h-64 flex items-center justify-center mb-6">
                      <div className="text-center">
                        <MapPinIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-800 font-semibold">
                          Two Convenient Locations
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Kathmandu & Pokhara
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Kathmandu Store
                        </h4>
                        <p className="text-gray-600">Tamrakar Complex Shop 9</p>
                        <p className="text-gray-600">Newroad, Kathmandu</p>
                        <p className="text-green-600 font-medium">
                          📞 9851343371
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Pokhara Store
                        </h4>
                        <p className="text-gray-600">Mahendrapool</p>
                        <p className="text-gray-600">Infront of Sita Bhawan</p>
                        <p className="text-green-600 font-medium">
                          📞 985-6060163
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Follow Us
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Stay connected with us on social media for latest updates,
                      deals, and tech news.
                    </p>
                    <div className="space-y-4">
                      {socialLinks.map((social, index) => (
                        <motion.a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center p-4 border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md ${social.color}`}
                        >
                          <social.icon className="w-6 h-6 mr-3" />
                          <span className="font-medium">{social.name}</span>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
          {/* FAQ Section */}
          <section className="py-20 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Quick answers to common questions. Can't find what you're
                  looking for? Contact us directly.
                </p>
              </motion.div>

              {/* Only render if faqs exist and have valid data */}
              {faqs && faqs.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {faqs
                    .filter((faq) => faq && faq.question && faq.answer)
                    .map((faq, index) => (
                      <motion.div
                        key={faq.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-8 shadow-lg"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                            {/* Fixed: Use HelpCircleIcon instead of faq.icon */}
                            <HelpCircleIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                              {faq.question}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">Loading FAQs...</p>
                </div>
              )}
            </div>
          </section>
          {/* Emergency Contact */}
          <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600">
            <div className="container mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-white mb-6">
                  Need Immediate Assistance?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  For urgent issues or immediate technical support, call us
                  directly. We're here to help when you need us most.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="tel:9851343371"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Kathmandu: 9851343371
                  </motion.a>
                  <motion.a
                    href="tel:985-6060163"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Pokhara: 985-6060163
                  </motion.a>
                  <motion.a
                    href="mailto:support@joystore.com"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-red-600 transition-all duration-300 flex items-center justify-center"
                  >
                    <MailIcon className="w-5 h-5 mr-2" />
                    Email Support
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </PageLayout>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
};

export default ContactUs;
