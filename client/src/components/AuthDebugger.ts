// AuthDebugger.tsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const AuthDebugger = () => {
  const { isAuthenticated, user } = useSelector((state:RootState) => state.user);
  
  useEffect(() => {
    console.log("=== AUTH DEBUG ===");
    console.log("Token:", localStorage.getItem("token"));
    console.log("LoggedOut:", localStorage.getItem("loggedOut"));
    console.log("User in Redux:", user);
    console.log("Role in Redux:", user?.role);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("==================");
  }, [isAuthenticated, user]);
  
  // No visible UI
  return null;
};

export default AuthDebugger;