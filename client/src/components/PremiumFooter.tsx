import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  ArrowUp,
  ChevronRight,
  Store,
} from "lucide-react";
import type { RootState, AppDispatch } from "../redux/store";
import { getStoreSettings } from "../redux/actions/settingsAction";
import { getAllCategories } from "../redux/actions/categoryAction";
import { getImageUrl, StoreImage } from "../utils/imageHelper";

const CompactFooter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Get store settings from Redux
  const { storeSettings } = useSelector((state: RootState) => state.settings);

  // Get categories from Redux
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const categoriesLoading = useSelector(
    (state: RootState) => state.category.loading
  );
  const categoriesError = useSelector(
    (state: RootState) => state.category.error
  );

  // Load store settings and categories on component mount
  useEffect(() => {
    dispatch(getStoreSettings());

    // Only fetch categories if we don't have them and aren't already loading
    if (!categories?.length && !categoriesLoading) {
      dispatch(getAllCategories());
    }
  }, [dispatch, categories?.length, categoriesLoading]);

  // Observer for entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  // Scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleMobileMenu = (menu: string) => {
    if (mobileMenuOpen === menu) {
      setMobileMenuOpen(null);
    } else {
      setMobileMenuOpen(menu);
    }
  };

  // ✅ Normalize store settings - handle both camelCase and snake_case
  const normalizeStoreSettings = (settings: any) => {
    if (!settings) return null;

    return {
      storeName: settings.storeName || settings.store_name || "Joy Electronics",
      storeEmail:
        settings.storeEmail ||
        settings.store_email ||
        "contact@joyelectronics.com",
      storePhone:
        settings.storePhone || settings.store_phone || "+977-01-4123456",
      storeAddress:
        settings.storeAddress || settings.store_address || "Kathmandu, Nepal",
      logo: settings.logo,
      footerLogo: settings.footerLogo || settings.footer_logo || settings.logo, // ✅ Use footer logo or fallback to main logo
    };
  };

  // Use normalized store settings with fallbacks
  const displayStoreSettings = normalizeStoreSettings(storeSettings) || {
    storeName: "Joy Electronics",
    storeEmail: "contact@joyelectronics.com",
    storePhone: "+977-01-4123456",
    storeAddress: "Kathmandu, Nepal",
    logo: "/joy-finalogo-1-1-1.png",
    footerLogo: "/joy-finalogo-1-1-1.png",
  };

  // Parse phone numbers for display
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return "";
    // Remove +977- prefix for display
    return phone.replace("+977-", "");
  };

  // ✅ Fixed parseAddress with proper null checking
  const parseAddress = (address: string) => {
    if (!address || typeof address !== "string") {
      return {
        line1: "Kathmandu, Nepal",
        line2: "",
      };
    }

    const parts = address
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    return {
      line1: parts.length > 1 ? parts.slice(0, -1).join(", ") : address,
      line2: parts.length > 1 ? parts[parts.length - 1] : "",
    };
  };

  const addressParts = parseAddress(displayStoreSettings.storeAddress);

  // ✅ Get footer logo URL with proper fallback
  const getFooterLogoUrl = () => {
    const footerLogoPath = displayStoreSettings.footerLogo;
    if (footerLogoPath) {
      return getImageUrl(footerLogoPath);
    }
    return getImageUrl(displayStoreSettings.logo);
  };

  // ✅ Process categories from Redux with proper fallbacks
  const processedCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories.slice(0, 8).map((category: any) => ({
          name: category.name,
          path:
            category.link ||
            `/products/category/${
              category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
            }`,
        }))
      : [
          // Fallback categories if backend categories fail to load
          { name: "SmartPhones", path: "/products/smartphones" },
          { name: "iPads", path: "/products/ipads" },
          { name: "SmartWatches", path: "/products/smartwatches" },
          { name: "Apple Accessories", path: "/products/apple-accessories" },
          { name: "HeadPhones", path: "/products/headphones" },
          { name: "Cover & Cases", path: "/products/covers-cases" },
          { name: "Chargers", path: "/products/chargers" },
          { name: "Cables", path: "/products/cables" },
        ];

  return (
    <footer ref={footerRef} className="bg-black text-white">
      {/* Logo Section - Using Footer Logo ✅ - Made Broader */}
      {/* <div className="bg-white  py-6">
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div
            className={`w-full max-w-[400px] h-[80px] mx-auto flex items-center justify-center transition-all duration-1000 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
       
          </div>
        </div>
      </div> */}

      {/* Main Footer Content - Broader and More Spacious */}
      <div className="max-w-full px-6 sm:px-8 lg:px-12 py-12">
        {/* Main grid - desktop - 4 columns with more spacing */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-12">
          {/* Column 1: Store Info & Contact - Expanded */}
          <div
            className={`col-span-1 transition-all duration-700 delay-100 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-white text-xl font-semibold mb-6">
              <StoreImage
                src={getImageUrl(displayStoreSettings.footerLogo)}
                alt={`${displayStoreSettings.storeName} Logo`}
                className="inline-block border-b-2 h-14 border-white/30 pb-2"
              />
            </h3>

            <div className="space-y-4 text-white/80 text-base">
              <p className="text-lg font-medium text-white">
                Apple Authorized Reseller
              </p>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-white/60 mt-1 flex-shrink-0" />
                <div className="leading-relaxed">
                  {addressParts.line1 && (
                    <p className="mb-1">{addressParts.line1}</p>
                  )}
                  {addressParts.line2 && <p>{addressParts.line2}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-white/60 flex-shrink-0" />
                <p>
                  <span className="text-white/60">Tel: </span>
                  <a
                    href={`tel:${displayStoreSettings.storePhone}`}
                    className="hover:text-white transition-colors font-medium"
                  >
                    {formatPhoneForDisplay(displayStoreSettings.storePhone)}
                  </a>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-white/60 flex-shrink-0" />
                <p>
                  <a
                    href={`mailto:${displayStoreSettings.storeEmail}`}
                    className="hover:text-white transition-colors font-medium"
                  >
                    {displayStoreSettings.storeEmail}
                  </a>
                </p>
              </div>
            </div>

            {/* Social Media - Expanded */}
            <div className="mt-8">
              <h4 className="text-white text-lg font-semibold mb-4">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/joy_store_nepal?igsh=MW9uMTVxeGJlam9mZw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://x.com/Apple"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="w-6 h-6" />
                </a>
                <a
                  href="https://www.facebook.com/share/1936QwaPGq/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Service - Expanded */}
          <div
            className={`transition-all duration-700 delay-200 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-white text-xl font-semibold mb-6">
              <span className="inline-block border-b-2 border-white/30 pb-2">
                Customer Service
              </span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "About Us", path: "/about-us" },
                { name: "Contact Us", path: "/contact-us" },
                { name: "Customer Support", path: "/customer-support" },
                { name: "Delivery Details", path: "/delivery-details" },
                { name: "EMI Options", path: "/emi" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-white/70 hover:text-white transition-colors duration-300 text-base block py-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Account & Legal - Expanded */}
          <div
            className={`transition-all duration-700 delay-300 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-white text-xl font-semibold mb-6">
              <span className="inline-block border-b-2 border-white/30 pb-2">
                Account & Legal
              </span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "My Account", path: "/account" },
                { name: "Order History", path: "/orders" },
                { name: "Shopping Cart", path: "/cart" },
                { name: "Wishlist", path: "/wishlist" },
                { name: "Terms & Conditions", path: "/terms-conditions" },
                { name: "Privacy Policy", path: "/privacy-policy" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-white/70 hover:text-white transition-colors duration-300 text-base block py-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Categories - Now Dynamic and Expanded ✅ */}
          <div
            className={`transition-all duration-700 delay-400 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-white text-xl font-semibold mb-6">
              <span className="inline-block border-b-2 border-white/30 pb-2">
                Product Categories
              </span>
            </h3>
            <ul className="space-y-3">
              {processedCategories.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-white/70 hover:text-white transition-colors duration-300 text-base block py-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            {categoriesLoading && (
              <p className="text-white/50 text-sm mt-3">
                Loading categories...
              </p>
            )}
            {categoriesError && (
              <p className="text-red-400 text-sm mt-3">
                Error loading categories
              </p>
            )}
          </div>
        </div>

        {/* Mobile version - Expanded accordions */}
        <div className="md:hidden space-y-6">
          {/* Store Info - Always visible on mobile - Expanded */}
          <div className="text-center pb-6 border-b border-white/10">
            <h2 className="text-white text-lg font-semibold mb-3">
              {displayStoreSettings.storeName}
            </h2>
            <p className="text-white/70 text-base mb-4">
              Apple Authorized Reseller
            </p>
            <div className="space-y-3 text-white/80 text-base">
              <p className="leading-relaxed">
                {displayStoreSettings.storeAddress}
              </p>
              <p className="flex items-center justify-center">
                <Phone className="h-4 w-4 mr-2" />
                {formatPhoneForDisplay(displayStoreSettings.storePhone)}
              </p>
              <p className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                {displayStoreSettings.storeEmail}
              </p>
            </div>
          </div>

          {/* Customer Service Accordion - Expanded */}
          <div className="border-b border-white/10 pb-4">
            <button
              className="flex items-center justify-between w-full py-3"
              onClick={() => toggleMobileMenu("service")}
            >
              <h3 className="text-white text-lg font-semibold">
                Customer Service
              </h3>
              <ChevronRight
                className={`h-5 w-5 transition-transform duration-300 ${
                  mobileMenuOpen === "service" ? "rotate-90" : ""
                }`}
              />
            </button>
            {mobileMenuOpen === "service" && (
              <div className="grid grid-cols-1 gap-y-3 mt-4">
                {[
                  { name: "About Us", path: "/about-us" },
                  { name: "Contact Us", path: "/contact-us" },
                  { name: "Customer Support", path: "/customer-support" },
                  { name: "Delivery Details", path: "/delivery-details" },
                  { name: "EMI Options", path: "/emi" },
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="text-white/70 text-base py-2"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Account & Legal Accordion - Expanded */}
          <div className="border-b border-white/10 pb-4">
            <button
              className="flex items-center justify-between w-full py-3"
              onClick={() => toggleMobileMenu("account")}
            >
              <h3 className="text-white text-lg font-semibold">
                Account & Legal
              </h3>
              <ChevronRight
                className={`h-5 w-5 transition-transform duration-300 ${
                  mobileMenuOpen === "account" ? "rotate-90" : ""
                }`}
              />
            </button>
            {mobileMenuOpen === "account" && (
              <div className="grid grid-cols-1 gap-y-3 mt-4">
                {[
                  { name: "My Account", path: "/account" },
                  { name: "Order History", path: "/orders" },
                  { name: "Shopping Cart", path: "/cart" },
                  { name: "Terms & Conditions", path: "/terms-conditions" },
                  { name: "Privacy Policy", path: "/privacy-policy" },
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="text-white/70 text-base py-2"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Categories Accordion - Now Dynamic and Expanded ✅ */}
          <div className="border-b border-white/10 pb-4">
            <button
              className="flex items-center justify-between w-full py-3"
              onClick={() => toggleMobileMenu("categories")}
            >
              <h3 className="text-white text-lg font-semibold">
                Product Categories
              </h3>
              <ChevronRight
                className={`h-5 w-5 transition-transform duration-300 ${
                  mobileMenuOpen === "categories" ? "rotate-90" : ""
                }`}
              />
            </button>
            {mobileMenuOpen === "categories" && (
              <div className="grid grid-cols-1 gap-y-3 mt-4">
                {processedCategories.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="text-white/70 text-base py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                {categoriesLoading && (
                  <p className="text-white/50 text-sm">Loading categories...</p>
                )}
                {categoriesError && (
                  <p className="text-red-400 text-sm">
                    Error loading categories
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Social Media - Mobile - Expanded */}
          <div className="text-center pb-6">
            <h3 className="text-white text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-6 justify-center">
              <a
                href="https://www.instagram.com/joy_store_nepal?igsh=MW9uMTVxeGJlam9mZw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://x.com/Apple"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/share/1936QwaPGq/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright - Expanded */}
        <div
          className={`mt-12 pt-8 border-t border-white/10 transition-all duration-700 delay-500 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center text-white/50 text-base space-y-3">
            <p className="text-lg">
              © {new Date().getFullYear()} {displayStoreSettings.storeName} |
              All Rights Reserved
            </p>
            <p>
              Powered By{" "}
              <Link
                to="https://nyxis.tech"
                className="text-white/70 font-semibold hover:text-white transition-colors"
              >
                Nyxis Tech
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to top button - Enhanced */}
      <button
        onClick={scrollToTop}
        className={`fixed right-6 bottom-6 bg-black border-2 border-white/20 hover:border-white p-3 rounded-full shadow-xl transition-all duration-300 transform ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </button>
    </footer>
  );
};

export default CompactFooter;
