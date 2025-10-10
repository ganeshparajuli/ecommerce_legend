import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronDownIcon,
  ShoppingCartIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  SearchIcon,
  Heart,
  Phone,
  Package,
  ChevronRightIcon,
  MapPin,
  Mail,
  Facebook,
  Youtube,
  Instagram,
  Twitter,
} from "lucide-react";
import { SearchDialog } from "../../../../components/SearchDialog";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../../redux/store";
import { getAllCategories } from "../../../../redux/actions/categoryAction";
import { getAllBrands } from "../../../../redux/actions/brandAction";
import { getStoreSettings } from "../../../../redux/actions/settingsAction";
import { StoreImage } from "../../../../utils/imageHelper";
import { logoutUser } from "../../../../redux/actions/userActions";
import { toast } from "react-hot-toast";
import joyStoreLogo from "../../../../assets/logo/lool.png";
interface NavItem {
  name: string;
  hasDropdown: boolean;
  dropdownItems?: { name: string; link: string }[];
  link?: string;
  isDynamic?: boolean;
}

const baseNavItems: readonly NavItem[] = Object.freeze([
  Object.freeze({
    name: "Home",
    hasDropdown: false,
    link: "/",
  }),
  Object.freeze({
    name: "Apple",
    hasDropdown: true,
    dropdownItems: Object.freeze([]),
    isDynamic: true,
  }),
  Object.freeze({
    name: "Categories",
    hasDropdown: true,
    dropdownItems: Object.freeze([]),
    isDynamic: true,
  }),
  Object.freeze({
    name: "Brands",
    hasDropdown: true,
    dropdownItems: Object.freeze([]),
    isDynamic: true,
  }),
  Object.freeze({
    name: "Sales",
    hasDropdown: false,
    link: "/sales",
  }),
  Object.freeze({
    name: "About Us",
    hasDropdown: false,
    link: "/about-us",
  }),
  Object.freeze({
    name: "Contact",
    hasDropdown: false,
    link: "/contact-us",
  }),
]);

// ProfileMenu Component
interface ProfileMenuProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ children, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.user || {}
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
    }
  }, [isAuthenticated]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={handleToggle}>{children}</div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-black text-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {!isAuthenticated ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600 mb-3">
                Sign in to access your account
              </p>
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={handleMenuClick}
                  className="block w-full px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={handleMenuClick}
                  className="block w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md transition-colors text-center"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <Link
                  to="/profile"
                  onClick={handleMenuClick}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  My Profile
                </Link>

                <Link
                  to="/profile/orders"
                  onClick={handleMenuClick}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  My Orders
                </Link>

                <Link
                  to="/profile/wishlist"
                  onClick={handleMenuClick}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Wishlist
                </Link>

                <Link
                  to="/profile/address"
                  onClick={handleMenuClick}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Address
                </Link>

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      handleMenuClick();
                      onLogout?.();
                    }}
                    disabled={loading}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {loading ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const NavbarSection: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showTopBar, setShowTopBar] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const [navbarHeight, setNavbarHeight] = useState<number>(0);
  const navbarRef = useRef<HTMLElement>(null);

  // User state
  const {
    user,
    isAuthenticated,
    loading: userLoading,
  } = useSelector((state: RootState) => state.user || {});

  // Redux state
  const {
    products = [],
    loading: productLoading,
    error: reduxError,
  } = useSelector((state: RootState) => state.products);

  const userInfo = useMemo(() => {
    return user
      ? {
          id: user.id,
          name: user.name || user.username || user.email,
          email: user.email,
          avatar: user.avatar || user.profilePicture,
          role: user.role,
        }
      : null;
  }, [user]);

  // Cart state
  const cartCount = useSelector(
    (state: RootState) =>
      state.cart?.cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0
  );

  // Settings state
  const { storeSettings } = useSelector(
    (state: RootState) => state.settings || {}
  );

  // Categories and brands state
  const categoryState = useSelector((state: RootState) => state.category || {});

  const brandState = useSelector((state: RootState) => state.brand || {});

  const categories = useMemo(() => {
    if (!categoryState.categories || !Array.isArray(categoryState.categories)) {
      return [];
    }
    return JSON.parse(JSON.stringify(categoryState.categories));
  }, [categoryState.categories]);

  const brands = useMemo(() => {
    if (!brandState.brands || !Array.isArray(brandState.brands)) {
      return [];
    }
    return JSON.parse(JSON.stringify(brandState.brands));
  }, [brandState.brands]);

  const categoriesLoading = categoryState.loading || false;
  const brandsLoading = brandState.loading || false;

  // Effects
  useEffect(() => {
    dispatch(getStoreSettings());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getAllBrands() as any);
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      console.log("🔄 NAVBAR: Starting logout process");

      // Remove this line to eliminate the center top toast:
      // const loadingToast = toast.loading("Signing out...");

      const result = await dispatch(logoutUser() as any);

      // Remove this line too:
      // toast.dismiss(loadingToast);

      if (
        result?.success === true ||
        result === "success" ||
        !result ||
        result?.type?.includes("SUCCESS")
      ) {
        toast.success("Signed out successfully!", {
          duration: 3000,
          style: {
            background: "#10B981",
            color: "#fff",
          },
          // Add position to move it away from center top
          position: "bottom-right",
        });
        console.log("✅ NAVBAR: Logout successful");

        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        console.error("❌ NAVBAR: Logout failed:", result);
        toast.error("Sign out failed. Please try again.", {
          duration: 4000,
          style: {
            background: "#EF4444",
            color: "#fff",
          },
          // Add position to move it away from center top
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("❌ NAVBAR: Logout error:", error);
      toast.error("An error occurred during sign out", {
        duration: 4000,
        style: {
          background: "#EF4444",
          color: "#fff",
        },
        // Add position to move it away from center top
        position: "bottom-right",
      });
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 NAVBAR: User state changed", {
        isAuthenticated,
        hasUser: !!user,
        userId: user?.id,
        userName: user?.name,
        userLoading,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isAuthenticated, user, userLoading]);

  const getBrandByName = useCallback(
    (brandName: string) => {
      if (!Array.isArray(brands) || brands.length === 0) return null;

      const foundBrand = brands.find(
        (brand: any) => brand?.name?.toLowerCase() === brandName.toLowerCase()
      );

      return foundBrand ? JSON.parse(JSON.stringify(foundBrand)) : null;
    },
    [brands]
  );

  const getCategoriesForBrand = useCallback(
    (brandName: string) => {
      const brand = getBrandByName(brandName);
      if (!brand || !Array.isArray(categories) || categories.length === 0) {
        return [];
      }

      return categories
        .filter((category: any) => category?.brandId === brand.id)
        .map((category: any) => ({
          name: category.name,
          link: `/products?brand=${brandName.toLowerCase()}&category=${
            category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
          }`,
        }));
    },
    [categories, getBrandByName]
  );

  const navItems = useMemo(() => {
    return baseNavItems.map((item) => {
      const newItem: NavItem = {
        name: item.name,
        hasDropdown: item.hasDropdown,
        link: item.link,
        isDynamic: item.isDynamic,
        dropdownItems: [],
      };

      if (item.name === "Apple" && item.isDynamic) {
        const appleCategories = getCategoriesForBrand("Apple");
        console.log("APPLE CATEGORIES", appleCategories);
        newItem.dropdownItems = [
          ...appleCategories,
          ...(appleCategories.length > 0
            ? [{ name: "All Apple Products", link: "/products?brand=apple" }]
            : [{ name: "View Apple Products", link: "/products" }]),
        ];
      } else if (item.name === "Samsung" && item.isDynamic) {
        const samsungCategories = getCategoriesForBrand("Samsung");
        newItem.dropdownItems = [
          ...samsungCategories,
          ...(samsungCategories.length > 0
            ? [
                {
                  name: "All Samsung Products",
                  link: "/products?brand=samsung",
                },
              ]
            : [{ name: "View Samsung Products", link: "/products" }]),
        ];
      } else if (item.name === "Categories" && item.isDynamic) {
        newItem.dropdownItems = [
          ...categories.map((category: any) => ({
            name: category.name,
            link: `/products?category=${
              category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
            }`,
          })),
          { name: "All Categories", link: "/products" },
        ];
      } else if (item.name === "Brands" && item.isDynamic) {
        newItem.dropdownItems = [
          ...brands.map((brand: any) => ({
            name: brand.name,
            link: `/products?brand=${
              brand.slug || brand.name.toLowerCase().replace(/\s+/g, "-")
            }`,
          })),
          { name: "View All Brands", link: "/products" },
        ];
      } else if (item.dropdownItems) {
        newItem.dropdownItems = [...item.dropdownItems];
      }

      return newItem;
    });
  }, [categories, brands, getCategoriesForBrand]);

  useEffect(() => {
    const calculateNavbarHeight = () => {
      if (navbarRef.current) {
        const height = navbarRef.current.offsetHeight;
        setNavbarHeight(height);

        document.documentElement.style.setProperty(
          "--navbar-height",
          `${height}px`
        );
        document.documentElement.style.setProperty(
          "--navbar-height-with-gap",
          `${height + 4}px`
        );
      }
    };

    calculateNavbarHeight();
    const timer = setTimeout(calculateNavbarHeight, 100);

    window.addEventListener("resize", calculateNavbarHeight);

    return () => {
      window.removeEventListener("resize", calculateNavbarHeight);
      clearTimeout(timer);
      document.documentElement.style.removeProperty("--navbar-height");
      document.documentElement.style.removeProperty("--navbar-height-with-gap");
    };
  }, [showTopBar, mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 5) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 38) {
        setShowTopBar(false);
      } else if (currentScrollY < 38) {
        setShowTopBar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleDropdown = useCallback((index: number) => {
    setActiveDropdown((current) => (current === index ? null : index));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        mobileMenuOpen &&
        !target.closest(".mobile-menu-container") &&
        !target.closest(".mobile-menu-toggle")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      setActiveDropdown(null);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  const searchCategoryOptions = useMemo(
    () => [
      "All Categories",
      "Apple Products",
      ...categories.map((cat: any) => cat.name),
    ],
    [categories]
  );

  const displayStoreSettings = useMemo(() => {
    if (!storeSettings) {
      return { store_name: "", logo: "" };
    }

    return {
      storeName: storeSettings.store_name || "",
      logo: storeSettings.logo || "",
    };
  }, [storeSettings]);

  const isBrandLoading = useCallback(
    (brandName: string) => {
      return categoriesLoading || brandsLoading || !getBrandByName(brandName);
    },
    [categoriesLoading, brandsLoading, getBrandByName]
  );

  const filterByBrandAndCategory = useCallback(
    (brand: string, category: string) => {
      return products.filter(
        (item) =>
          item.brand?.toLowerCase() === brand.toLowerCase() &&
          item.category?.toLowerCase() === category.toLowerCase()
      );
    },
    [products]
  );

  return (
    <header
      ref={navbarRef}
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? "shadow-sm border-b border-gray-100" : "shadow-sm"
      }`}
    >
      {/* Top Bar */}
      <div
        className={`bg-gray-600 text-white transition-all duration-300 ${
          showTopBar
            ? "max-h-40 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-1 md:h-10">
            <div className="flex items-center justify-center md:justify-start w-full md:w-auto mb-2 md:mb-0">
              <div className="flex items-center space-x-4 text-xs sm:text-xs">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="text-white hover:text-gray-300 transition-colors duration-200 font-normal"
                    >
                      Sign In
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      to="/register"
                      className="text-white hover:text-gray-300 transition-colors duration-200 font-normal"
                    >
                      Create an Account
                    </Link>
                    <span className="text-gray-300">|</span>
                  </>
                ) : (
                  <span className="text-gray-100 font-normal">
                    Welcome, {user?.name}!
                  </span>
                )}
                <Link
                  to="/contact-us"
                  className="text-white hover:text-gray-300 transition-colors duration-200 font-normal"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs sm:text-xs">
              <Link
                to="/location"
                className="text-red-400 hover:text-red-300 transition-colors duration-200 font-normal"
              >
                Our Locations
              </Link>

              <div className="hidden lg:flex items-center space-x-4">
                <Link
                  to="/emi"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-normal"
                >
                  EMI
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                {[
                  {
                    icon: Facebook,
                    href: "https://www.facebook.com/share/1936QwaPGq/?mibextid=wwXIfr",
                    color: "hover:text-blue-400",
                  },
                  {
                    icon: Instagram,
                    href: "https://www.instagram.com/joy_store_nepal?igsh=MW9uMTVxeGJlam9mZw==",
                    color: "hover:text-pink-400",
                  },
                  {
                    icon: Youtube,
                    href: "https://www.youtube.com/@Apple",
                    color: "hover:text-red-400",
                  },
                  {
                    icon: Twitter,
                    href: "https://x.com/Apple",
                    color: "hover:text-blue-300",
                  },
                ].map((social, i) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-400 ${social.color} transition-all duration-200 transform hover:scale-110`}
                      aria-label={`Visit our ${social.icon.name}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-black border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <button
                className="lg:hidden mr-3 mobile-menu-toggle text-gray-700 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>

              <Link
                to="/"
                className="flex items-center gap-x-4 justify-between group flex-1 max-w-md"
              >
                {/* Apple Logo and Authorised Reseller */}
                <div className="flex items-center">
                  <div className="flex flex-col justify-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-white tracking-tight leading-tight">
                      {displayStoreSettings.storeName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center mr-4">
                  <StoreImage
                    src={displayStoreSettings.logo}
                    alt="Apple Logo"
                    className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-14 w-auto object-contain transition-all duration-200 group-hover:scale-105"
                  />
                </div>
                {/* <div className="flex items-center">
                  <img
                    src={joyStoreLogo}
                    alt={displayStoreSettings.storeName || "Joy Store"}
                    className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-auto object-contain transition-all duration-200 group-hover:scale-105"
                  />
                </div> */}
              </Link>
            </div>

            <div className="hidden md:flex md:justify-center flex-1 max-w-xl mx-8">
              <div className="relative w-auto md:w-[380px]">
                <div className="flex rounded-full border border-gray-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="flex-1 px-4 py-2 text-sm border-0 focus:outline-none focus:ring-0 bg-white text-gray-800 placeholder-gray-500 rounded-l-full"
                    onClick={() => {
                      setIsSearchOpen(true);
                      navigate("/products");
                    }}
                  />
                  {/* <select className="px-4 py-3 text-sm border-l border-gray-300 bg-gray-50 text-gray-700 focus:outline-none cursor-pointer min-w-[140px] font-medium">
                    {searchCategoryOptions.map((option, index) => (
                      <option
                        key={index}
                        value={option.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {option}
                      </option>
                    ))}
                  </select> */}
                  <button
                    className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 flex items-center justify-center font-medium rounded-r-full"
                    onClick={() => {
                      setIsSearchOpen(true);
                      navigate("/products");
                    }}
                    aria-label="Search"
                  >
                    <SearchIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex flex-col items-end mr-6">
                {/* <div className="text-xs text-white font-medium">CALL US</div> */}
                <div className="text-xs font-bold text-white">
                  <a
                    href="tel:9861060000"
                    className="hover:text-red-600 transition-colors"
                  >
                    9851343371
                  </a>
                  <span className="text-white mx-1">/</span>
                  <a
                    href="tel:9810050001"
                    className="hover:text-red-600 transition-colors"
                  >
                    9856060163
                  </a>
                </div>
                <div className="text-xs text-white">
                  <span>FOR SUPPORT</span>:{" "}
                  <span className="font-semibold">9840051673</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    navigate("/categories");
                  }}
                  className="md:hidden p-2 text-white hover:text-red-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="Search"
                >
                  <SearchIcon className="h-5 w-5" />
                </button>

                <ProfileMenu onLogout={handleLogout}>
                  <button
                    className="p-2 text-white hover:text-red-600 hover:bg-grey rounded-lg transition-all duration-200 relative"
                    aria-label="User profile"
                  >
                    <UserIcon className="h-5 w-5" />
                    {isAuthenticated && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                    {userLoading && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                </ProfileMenu>

                <Link
                  to="/profile/wishlist"
                  className="p-2 text-white hover:text-red-600  rounded-lg transition-all duration-200"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                <Link
                  to="/cart"
                  className="relative p-2 text-white  hover:text-red-600  rounded-lg transition-all duration-200"
                  aria-label="Shopping cart"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <nav className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center h-14">
            {navItems.map((item, index) => (
              <li key={index} className="relative group">
                {item.hasDropdown ? (
                  <div>
                    <button
                      className={`h-full flex items-center space-x-2 text-gray-900 hover:text-red-600 px-4 xl:px-6 transition-all duration-200 font-semibold text-sm xl:text-base tracking-wide ${
                        item.isDynamic &&
                        ((item.name === "Categories" && categoriesLoading) ||
                          (item.name === "Brands" && brandsLoading) ||
                          ((item.name === "Apple" || item.name === "Samsung") &&
                            isBrandLoading(item.name)))
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => toggleDropdown(index)}
                      aria-expanded={activeDropdown === index}
                      aria-haspopup="true"
                      disabled={
                        item.isDynamic &&
                        ((item.name === "Categories" && categoriesLoading) ||
                          (item.name === "Brands" && brandsLoading) ||
                          ((item.name === "Apple" || item.name === "Samsung") &&
                            isBrandLoading(item.name)))
                      }
                    >
                      <span>{item.name}</span>
                      {item.isDynamic &&
                      ((item.name === "Categories" && categoriesLoading) ||
                        (item.name === "Brands" && brandsLoading) ||
                        ((item.name === "Apple" || item.name === "Samsung") &&
                          isBrandLoading(item.name))) ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform duration-200 ${
                            activeDropdown === index
                              ? "rotate-180 text-red-600"
                              : ""
                          }`}
                        />
                      )}
                    </button>
                  </div>
                ) : (
                  <Link
                    to={item.link || "#"}
                    className="h-full flex items-center text-gray-900 hover:text-red-600 px-4 xl:px-6 transition-all duration-200 font-semibold text-sm xl:text-base tracking-wide"
                  >
                    <span>{item.name}</span>
                  </Link>
                )}
                {item.hasDropdown &&
                  activeDropdown === index &&
                  item.dropdownItems &&
                  item.dropdownItems.length > 0 && (
                    <div className="absolute left-0 mt-0 bg-white border border-gray-200 rounded-[8px] shadow-2xl py-2 z-50 animate-fadeIn min-w-64">
                      {item.name === "Apple" ? (
                        <div className="flex gap-3 flex-wrap w-[300px] sm:w-[700px]">
                          {item?.dropdownItems?.map((dropdownItem, idx) => (
                            <div key={idx} className="w-auto py-2 px-2">
                              <Link
                                key={idx}
                                to={dropdownItem.link}
                                className="block px-4 text-sm xl:text-base text-gray-900 hover:text-red-600 transition-colors duration-150 font-medium"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {dropdownItem.name}
                              </Link>
                              {/* <h5 className="font-semibold text-sm xl:text-base block px-4 py-0"></h5> */}
                              {filterByBrandAndCategory(
                                item.name,
                                dropdownItem.name
                              ).map((productItem, idx) => (
                                <Link
                                  key={idx}
                                  to={`/product/${productItem.id}`}
                                  className="block px-4 text-sm text-gray-700 hover:text-red-600 transition-colors duration-150 font-normal my-2"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {productItem.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {item?.dropdownItems?.map((dropdownItem, idx) => (
                            <Link
                              key={idx}
                              to={dropdownItem.link}
                              className="block px-4 text-sm text-gray-700  hover:text-red-600 transition-colors duration-150 font-medium   mb-2"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu - Updated to 25% width */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="lg:hidden bg-white border-t border-gray-200 fixed left-0 top-0 h-full w-full sm:w-3/4 md:w-1/2 lg:w-1/4 shadow-2xl mobile-menu-container animate-slideInLeft z-50 overflow-hidden">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-600 text-white">
              <h2 className="text-lg font-bold">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-red-700 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {/* Search Section */}
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="relative w-full">
                  <div className="flex rounded-full border border-gray-300 overflow-hidden shadow-sm">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="flex-1 px-4 py-3 text-sm border-0 focus:outline-none focus:ring-0 bg-white rounded-l-full"
                      onClick={() => {
                        setIsSearchOpen(true);
                        navigate("/products");
                        setMobileMenuOpen(false);
                      }}
                    />
                    <button
                      className="px-4 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 rounded-r-full"
                      onClick={() => {
                        setIsSearchOpen(true);
                        navigate("/categories");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <SearchIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="px-4 py-2 divide-y divide-gray-100">
                {navItems.map((item, index) => (
                  <div key={index} className="py-3">
                    {item.hasDropdown ? (
                      <>
                        <button
                          className={`w-full flex items-center justify-between py-3 text-gray-700 hover:text-red-600 transition-colors font-semibold text-base ${
                            item.isDynamic &&
                            ((item.name === "Categories" &&
                              categoriesLoading) ||
                              (item.name === "Brands" && brandsLoading) ||
                              ((item.name === "Apple" ||
                                item.name === "Samsung") &&
                                isBrandLoading(item.name)))
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => toggleDropdown(index)}
                          aria-expanded={activeDropdown === index}
                          disabled={
                            item.isDynamic &&
                            ((item.name === "Categories" &&
                              categoriesLoading) ||
                              (item.name === "Brands" && brandsLoading) ||
                              ((item.name === "Apple" ||
                                item.name === "Samsung") &&
                                isBrandLoading(item.name)))
                          }
                        >
                          <span className="tracking-wide">{item.name}</span>
                          {item.isDynamic &&
                          ((item.name === "Categories" && categoriesLoading) ||
                            (item.name === "Brands" && brandsLoading) ||
                            ((item.name === "Apple" ||
                              item.name === "Samsung") &&
                              isBrandLoading(item.name))) ? (
                            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ChevronRightIcon
                              className={`h-5 w-5 transition-transform duration-200 ${
                                activeDropdown === index
                                  ? "rotate-90 text-red-600"
                                  : ""
                              }`}
                            />
                          )}
                        </button>
                        {activeDropdown === index &&
                          item.dropdownItems &&
                          item.dropdownItems.length > 0 && (
                            <div className="pl-4 py-2 space-y-1 bg-red-50 rounded-lg mt-2 animate-fadeIn">
                              {item.dropdownItems.map((dropdownItem, idx) => (
                                <Link
                                  key={idx}
                                  to={dropdownItem.link}
                                  className="block py-2 px-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-colors font-medium"
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    setActiveDropdown(null);
                                  }}
                                >
                                  {dropdownItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                      </>
                    ) : (
                      <Link
                        to={item.link || "#"}
                        className="block w-full py-3 text-gray-700 hover:text-red-600 transition-colors font-semibold text-base tracking-wide"
                        onClick={() => {
                          setMobileMenuOpen(false);
                        }}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Section */}
              <div className="p-4 bg-gray-50 text-sm border-t border-gray-100">
                <h3 className="font-bold mb-3 text-gray-800 tracking-wide">
                  Contact Us
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-red-600 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-700 text-sm">
                        Call Us Now:
                      </span>
                      <div className="text-gray-800 font-bold">
                        <a
                          href="tel:9861060000"
                          className="hover:text-red-600 transition-colors"
                        >
                          9851343371
                        </a>
                        <span className="text-gray-400 mx-1">/</span>
                        <a
                          href="tel:9810050001"
                          className="hover:text-red-600 transition-colors"
                        >
                          9856060163
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-red-600 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-700 text-sm">
                        Support:
                      </span>
                      <span className="text-gray-800 font-medium ml-1">
                        98513413371
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <SearchDialog isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
    </header>
  );
};

export const Breadcrumb: React.FC<{
  items: { name: string; href: string; current?: boolean }[];
  className?: string;
  bgColor?: "white" | "black" | "gray";
}> = ({ items, className = "", bgColor = "white" }) => {
  const backgroundColorClasses = {
    white: "bg-black border-b border-white",
    black: "bg-black text-white",
    gray: "bg-black border-b border-white",
  };

  return (
    <nav
      className={`w-full ${backgroundColorClasses[bgColor]} py-4 ${className} shadow-sm`}
      style={{
        marginTop: "var(--navbar-height, 0)",
        paddingTop: "calc(1rem + 4px)",
      }}
      aria-label="Breadcrumb"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={item.name} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon
                  className="flex-shrink-0 h-4 w-4 text-white mx-2"
                  aria-hidden="true"
                />
              )}
              {item.current ? (
                <span
                  className={`font-semibold ${
                    bgColor === "black" ? "text-white" : "text-red-600"
                  }`}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className={`font-medium transition-colors duration-200 hover:underline ${
                    bgColor === "black"
                      ? "text-gray-100 hover:text-white"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export const PageLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <NavbarSection />
      <div
        className="w-full"
        style={{ marginTop: "var(--navbar-height-with-gap, 0)" }}
      >
        {children}
      </div>
    </>
  );
};

export default NavbarSection;
