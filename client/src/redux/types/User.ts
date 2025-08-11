// Updated src/redux/types/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Updated to use role instead of isAdmin
  phone?: string;
  address?: string;
  profileImage?: string;
  avatar?: string;
  active?: number;
  isProfileComplete?: boolean;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for additional properties
}

export interface UserState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  token: string | null;
  users: User[];
  hasToken?: boolean; // Flag to track if we have a token to verify
  message?: string; // For update success messages
}

// Role-based types for better type safety
export type UserRole = 'admin' | 'sub-admin' | 'sales' | 'finance' | 'user';

export interface RolePermissions {
  canAccessDashboard: boolean;
  canManageProducts: boolean;
  canManageBrands: boolean;
  canManageCategories: boolean;
  canManageOrders: boolean;
  canManagePromoCodes: boolean;
  canManageNewsletters: boolean;
  canManageCustomers: boolean;
  canManageFAQs: boolean;
  canManageEnquiries: boolean;
  canManageSettings: boolean;
}

// Helper function to get role permissions
export const getRolePermissions = (role: string): RolePermissions => {
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case 'admin':
      return {
        canAccessDashboard: true,
        canManageProducts: true,
        canManageBrands: true,
        canManageCategories: true,
        canManageOrders: true,
        canManagePromoCodes: true,
        canManageNewsletters: true,
        canManageCustomers: true,
        canManageFAQs: true,
        canManageEnquiries: true,
        canManageSettings: true,
      };
    
    case 'sub-admin':
      return {
        canAccessDashboard: false,
        canManageProducts: false,
        canManageBrands: false,
        canManageCategories: false,
        canManageOrders: false,
        canManagePromoCodes: false,
        canManageNewsletters: false,
        canManageCustomers: true,
        canManageFAQs: false,
        canManageEnquiries: false,
        canManageSettings: true,
      };
    
    case 'sales':
      return {
        canAccessDashboard: false,
        canManageProducts: false,
        canManageBrands: false,
        canManageCategories: false,
        canManageOrders: false,
        canManagePromoCodes: false,
        canManageNewsletters: false,
        canManageCustomers: true,
        canManageFAQs: true,
        canManageEnquiries: false,
        canManageSettings: true,
      };
    
    case 'finance':
      return {
        canAccessDashboard: false,
        canManageProducts: false,
        canManageBrands: false,
        canManageCategories: false,
        canManageOrders: true,
        canManagePromoCodes: true,
        canManageNewsletters: false,
        canManageCustomers: false,
        canManageFAQs: false,
        canManageEnquiries: false,
        canManageSettings: false,
      };
    
    default:
      return {
        canAccessDashboard: false,
        canManageProducts: false,
        canManageBrands: false,
        canManageCategories: false,
        canManageOrders: false,
        canManagePromoCodes: false,
        canManageNewsletters: false,
        canManageCustomers: false,
        canManageFAQs: false,
        canManageEnquiries: false,
        canManageSettings: false,
      };
  }
};

// Helper function to check if user has specific permission
export const hasPermission = (user: User | null, permission: keyof RolePermissions): boolean => {
  if (!user || !user.role) return false;
  
  const permissions = getRolePermissions(user.role);
  return permissions[permission];
};

// Helper function to get allowed roles for a specific route
export const getAllowedRoles = (route: string): string[] => {
  const routeRoleMap: { [key: string]: string[] } = {
    '/admin': ['admin'],
    '/admin/dashboard': ['admin'],
    '/admin/products': ['admin'],
    '/admin/brands': ['admin'],
    '/admin/categories': ['admin'],
    '/admin/newsletters': ['admin'],
    '/admin/enquiries': ['admin'],
    '/admin/orders': ['admin', 'finance'],
    '/admin/promocodes': ['admin', 'finance'],
    '/admin/customers': ['admin', 'sub-admin', 'sales'],
    '/admin/settings': ['admin', 'sub-admin', 'sales'],
    '/admin/faqs': ['admin', 'sales'],
  };
  
  return routeRoleMap[route] || [];
};