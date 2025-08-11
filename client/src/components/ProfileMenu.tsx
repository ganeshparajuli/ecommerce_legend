import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { UserIcon, ChevronRightIcon, LogOut, ShoppingBag } from "lucide-react";
import { useUserLogin } from "../redux/useTypedSelectors";
import { logoutUser } from "../redux/actions/userActions";

interface ProfileMenuProps {
  children: React.ReactNode;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ children }) => {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get user info using our custom hook
  const { userInfo } = useUserLogin();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest(".profile-menu-container")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Handle sign out action
  const handleSignOut = () => {
    dispatch(logoutUser() as any);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative profile-menu-container">
      <div onClick={() => setIsMenuOpen(!isMenuOpen)}>{children}</div>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 animate-fadeIn">
          {userInfo ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {userInfo.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userInfo.email || ""}
                </p>
              </div>

              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AD5C10] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
                <ChevronRightIcon className="h-4 w-4 ml-auto" />
              </Link>

              <Link
                to="/profile/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AD5C10] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                My Orders
                <ChevronRightIcon className="h-4 w-4 ml-auto" />
              </Link>

              <Link
                to="/profile/wishlist"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AD5C10] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons-outlined text-base mr-2">
                  Wishlist
                </span>

                <ChevronRightIcon className="h-4 w-4 ml-auto" />
              </Link>

              <Link
                to="/profile/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AD5C10] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons-outlined text-base mr-2">
                  settings
                </span>

                <ChevronRightIcon className="h-4 w-4 ml-auto" />
              </Link>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AD5C10]"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AD5C10]"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
