// types/dashboard.ts - TypeScript type definitions for dashboard

export interface Order {
    // IDs
    id?: string;
    _id?: string;
    orderId?: string;
    order_id?: string;
    
    // Amounts
    total_amount?: string; // Note: string in your API, not number
    totalAmount?: number;
    total?: number;
    amount?: number;
    discount_amount?: string;
    
    // Dates
    created_at?: string;
    createdAt?: string;
    updated_at?: string;
    orderDate?: string;
    
    // Status
    status?: string;
    orderStatus?: string;
    order_status?: string;
    
    // Payment
    payment_method?: string;
    paymentMethod?: string;
    
    // User
    user_id?: string;
    
    // Promo
    promo_code?: string | null;
    
    // Shipping Address (FIXED: Match your working orders page structure)
    shipping_address?: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      state?: string;
      country?: string;
    };
    
    // Items (FIXED: Match your working orders page structure)
    items?: Array<{
      id?: string;
      product_id?: string;
      product_name?: string; // This is the key field your orders page uses
      quantity?: number;
      price?: string; // Note: string in your API
      image?: string;
      product_image?: string;
    }>;
    
    // Legacy/Alternative structures for backward compatibility
    user?: {
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
    };
    customer?: {
      name?: string;
      email?: string;
    };
    customerName?: string;
    customer_name?: string;
    userName?: string;
    products?: Array<{
      _id?: string;
      id?: string;
      name?: string;
      price?: number;
      quantity?: number;
    }>;
    orderItems?: Array<{
      _id?: string;
      id?: string;
      name?: string;
      price?: number;
      quantity?: number;
    }>;
    product_name?: string;
    shippingAddress?: {
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    isPaid?: boolean;
    paidAt?: string;
    isDelivered?: boolean;
    deliveredAt?: string;
    // Make it extensible for any additional properties
    [key: string]: any;
  }
  
  export interface User {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    createdAt?: string;
    created_at?: string;
    registeredAt?: string;
    role?: string;
    isActive?: boolean;
    lastLogin?: string;
    avatar?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    } | string;
    // Make it extensible for any additional properties
    [key: string]: any;
  }
  
  export interface DashboardStats {
    totalRevenue: string;
    revenueChange: string;
    newCustomers: string;
    customersChange: string;
    totalOrders: string;
    ordersChange: string;
    salesGrowth: string;
    salesGrowthChange: string;
  }
  
  export interface ChartData {
    categories: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  }
  
  export interface FormattedOrder {
    id: string;
    orderId: string;
    customer: string;
    product: string;
    amount: string;
    status: string;
  }
  
  export interface DateRanges {
    currentMonthStart: Date;
    currentWeekStart: Date;
    last30Days: Date;
    last7Days: Date;
    previousMonthStart: Date;
    previousMonthEnd: Date;
    previous7Days: Date;
    today: Date;
  }
  
  // Redux State Types
  export interface DashboardStatsState {
    loading: boolean;
    stats: DashboardStats | null;
    error: string | null;
  }
  
  export interface RecentOrdersState {
    loading: boolean;
    orders: Order[];
    error: string | null;
  }
  
  export interface SalesChartState {
    loading: boolean;
    chartData: ChartData | null;
    error: string | null;
  }
  
  // API Response Types
  export interface DashboardStatsResponse {
    success: boolean;
    data: DashboardStats;
  }
  
  export interface RecentOrdersResponse {
    success: boolean;
    data: Order[];
    total: number;
  }
  
  export interface SalesChartResponse {
    success: boolean;
    data: ChartData;
  }
  
  // Chart Configuration Types
  export interface ChartOptions {
    chart: {
      type: string;
      toolbar: {
        show: boolean;
      };
    };
    stroke: {
      curve: string;
    };
    xaxis: {
      categories: string[];
    };
    yaxis: {
      labels: {
        formatter: (value: number) => string;
      };
    };
    tooltip: {
      y: {
        formatter: (value: number) => string;
      };
    };
    colors: string[];
    fill: {
      type: string;
      gradient: {
        shadeIntensity: number;
        opacityFrom: number;
        opacityTo: number;
        stops: number[];
      };
    };
  }
  
  export interface ChartSeries {
    name: string;
    data: number[];
  }
  
  // Utility Types
  export type TrendDirection = "up" | "down";
  
  export interface StatCard {
    title: string;
    value: string;
    change: string;
    trend: TrendDirection;
    icon: React.ComponentType<any>;
  }
  
  // Filter Types
  export interface DateFilter {
    startDate: Date;
    endDate: Date;
    period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  }
  
  export interface OrderFilter {
    status?: string[];
    dateRange?: DateFilter;
    minAmount?: number;
    maxAmount?: number;
    customerId?: string;
  }
  
  export interface UserFilter {
    role?: string[];
    isActive?: boolean;
    dateRange?: DateFilter;
    searchTerm?: string;
  }