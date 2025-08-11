// Sync authUtils with Redux data
// src/utils/authUtils.ts 

// Import existing code
// (This preserves your existing authUtils functionality)
type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: any;
};

const authUtils = {
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  isUserLoggedIn: (): boolean => {
    const token = localStorage.getItem("token");
    const justLoggedOut = localStorage.getItem("loggedOut");
    return Boolean(token && justLoggedOut !== "true");
  },

  showLoginRequiredToast: () => {
    return "Please log in to add items to your wishlist";
  },

  showLoginRequiredCartToast: () => {
    return "Please log in to add items to your cart";
  },
  
  getUser: (): User | null => {
    try {
      const userString = localStorage.getItem('userInfo');
      if (!userString) return null;
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  
  // Add this method to sync the Redux user with localStorage
  // Call this after successful login
  syncUserWithLocalStorage: (user: User): void => {
    try {
      if (!user) return;
      console.log('Syncing user to localStorage:', user);
      localStorage.setItem('userInfo', JSON.stringify(user));
    } catch (error) {
      console.error('Error syncing user to localStorage:', error);
    }
  },
  
  // Other methods...
};

export default authUtils;