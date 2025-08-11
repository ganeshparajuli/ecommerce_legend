// dashboardUtils.ts - Utility functions to calculate dashboard statistics

// Type definitions
export interface Order {
  _id: string;
  orderId?: string;
  totalAmount?: number;
  total?: number;
  createdAt: string;
  created_at?: string;
  orderStatus?: string;
  status?: string;
  user?: {
    name: string;
  };
  customer?: {
    name: string;
  };
  customerName?: string;
  products?: Array<{
    name: string;
  }>;
  items?: Array<{
    name: string;
  }>;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  created_at?: string;
  role?: string;
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

// Calculate date ranges
export const getDateRanges = (): DateRanges => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Current periods
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
  const last30Days = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  const last7Days = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  // Previous periods for comparison
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const previous7Days = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000));
  
  return {
    currentMonthStart,
    currentWeekStart,
    last30Days,
    last7Days,
    previousMonthStart,
    previousMonthEnd,
    previous7Days,
    today
  };
};

// Calculate total revenue from orders - FIXED to handle string amounts
export const calculateTotalRevenue = (orders: Order[]): number => {
  if (!orders || orders.length === 0) return 0;
  
  return orders.reduce((total: number, order: Order) => {
    if (!order) return total;
    
    // FIXED: Handle string amounts like working orders page
    let amount = 0;
    if (order.total_amount && typeof order.total_amount === 'string') {
      amount = parseFloat(order.total_amount);
    } else if (order.totalAmount && typeof order.totalAmount === 'number') {
      amount = order.totalAmount;
    } else if (order.total && typeof order.total === 'number') {
      amount = order.total;
    } else if (order.amount && typeof order.amount === 'number') {
      amount = order.amount;
    }
    
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
};

// Calculate revenue for a specific date range - FIXED to handle string amounts
export const calculateRevenueByDateRange = (orders: Order[], startDate: Date, endDate?: Date): number => {
  if (!orders || orders.length === 0) return 0;
  
  const end = endDate || new Date();
  
  return orders
    .filter((order: Order) => {
      if (!order) return false;
      const orderDate = new Date(
        order.created_at || 
        order.createdAt || 
        order.orderDate || 
        ''
      );
      return !isNaN(orderDate.getTime()) && orderDate >= startDate && orderDate <= end;
    })
    .reduce((total: number, order: Order) => {
      // FIXED: Handle string amounts like working orders page
      let amount = 0;
      if (order.total_amount && typeof order.total_amount === 'string') {
        amount = parseFloat(order.total_amount);
      } else if (order.totalAmount && typeof order.totalAmount === 'number') {
        amount = order.totalAmount;
      } else if (order.total && typeof order.total === 'number') {
        amount = order.total;
      } else if (order.amount && typeof order.amount === 'number') {
        amount = order.amount;
      }
      
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
};

// Calculate new customers in a date range
export const calculateNewCustomers = (users: User[], startDate: Date, endDate: Date = new Date()): number => {
  if (!users || users.length === 0) return 0;
  
  return users.filter((user: User) => {
    if (!user) return false;
    const userDate = new Date(
      user.createdAt || 
      user.created_at || 
      user.registeredAt || 
      ''
    );
    return !isNaN(userDate.getTime()) && userDate >= startDate && userDate <= endDate;
  }).length;
};

// Calculate total orders in a date range - FIXED to match working orders page date fields
export const calculateOrdersByDateRange = (orders: Order[], startDate: Date, endDate: Date = new Date()): number => {
  if (!orders || orders.length === 0) return 0;
  
  return orders.filter((order: Order) => {
    if (!order) return false;
    // FIXED: Use created_at first like working orders page
    const orderDate = new Date(
      order.created_at || 
      order.createdAt || 
      order.orderDate || 
      ''
    );
    return !isNaN(orderDate.getTime()) && orderDate >= startDate && orderDate <= endDate;
  }).length;
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Calculate dashboard statistics
export const calculateDashboardStats = (orders: Order[] = [], users: User[] = []): DashboardStats => {
  const dateRanges = getDateRanges();
  
  // Current period calculations (last 30 days)
  const currentRevenue = calculateRevenueByDateRange(orders, dateRanges.last30Days);
  const currentNewCustomers = calculateNewCustomers(users, dateRanges.last30Days);
  const currentOrders = calculateOrdersByDateRange(orders, dateRanges.last30Days);
  
  // Previous period calculations (30 days before last 30 days)
  const previousRevenue = calculateRevenueByDateRange(orders, dateRanges.previous7Days, dateRanges.last30Days);
  const previousNewCustomers = calculateNewCustomers(users, dateRanges.previous7Days, dateRanges.last30Days);
  const previousOrders = calculateOrdersByDateRange(orders, dateRanges.previous7Days, dateRanges.last30Days);
  
  // This month vs last month for sales growth
  const thisMonthRevenue = calculateRevenueByDateRange(orders, dateRanges.currentMonthStart);
  const lastMonthRevenue = calculateRevenueByDateRange(orders, dateRanges.previousMonthStart, dateRanges.previousMonthEnd);
  
  return {
    totalRevenue: formatCurrency(calculateTotalRevenue(orders)),
    revenueChange: calculatePercentageChange(currentRevenue, previousRevenue),
    
    newCustomers: formatNumber(currentNewCustomers),
    customersChange: calculatePercentageChange(currentNewCustomers, previousNewCustomers),
    
    totalOrders: formatNumber(orders.length),
    ordersChange: calculatePercentageChange(currentOrders, previousOrders),
    
    salesGrowth: lastMonthRevenue > 0 ? calculatePercentageChange(thisMonthRevenue, lastMonthRevenue) : "+0%",
    salesGrowthChange: calculatePercentageChange(thisMonthRevenue, lastMonthRevenue)
  };
};

// Calculate chart data for sales overview (last 7 days) - FIXED to match working orders page
export const calculateSalesChartData = (orders: Order[] = []): ChartData => {
  const last7Days: Array<{ date: Date; label: string }> = [];
  const today = new Date();
  
  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date,
      label: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  // Calculate revenue for each day - FIXED to use correct date and amount fields
  const salesData = last7Days.map(day => {
    const dayStart = new Date(day.date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day.date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayRevenue = orders
      .filter(order => {
        if (!order) return false;
        // FIXED: Use created_at first like working orders page
        const orderDate = new Date(order.created_at || order.createdAt || '');
        return !isNaN(orderDate.getTime()) && orderDate >= dayStart && orderDate <= dayEnd;
      })
      .reduce((total, order) => {
        // FIXED: Handle string amounts like working orders page
        let amount = 0;
        if (order.total_amount && typeof order.total_amount === 'string') {
          amount = parseFloat(order.total_amount);
        } else if (order.totalAmount && typeof order.totalAmount === 'number') {
          amount = order.totalAmount;
        } else if (order.total && typeof order.total === 'number') {
          amount = order.total;
        } else if (order.amount && typeof order.amount === 'number') {
          amount = order.amount;
        }
        return total + (isNaN(amount) ? 0 : amount);
      }, 0);
    
    return Math.round(dayRevenue / 1000); // Convert to thousands
  });
  
  return {
    categories: last7Days.map(day => day.label),
    series: [{
      name: "Sales",
      data: salesData
    }]
  };
};

// Get recent orders (last 5-10 orders) - FIXED to match working orders page
export const getRecentOrdersFormatted = (orders: Order[] = [], limit: number = 5): FormattedOrder[] => {
  if (!Array.isArray(orders) || orders.length === 0) {
    console.log("⚠️ No orders array provided to getRecentOrdersFormatted");
    return [];
  }

  console.log("📋 Formatting recent orders:", orders.slice(0, 3)); // Debug first 3 orders

  return orders
    .filter((order: Order) => order && typeof order === 'object') // Filter out invalid orders
    .sort((a: Order, b: Order) => {
      // FIXED: Use created_at first like working orders page
      const dateA = new Date(a.created_at || a.createdAt || a.orderDate || '').getTime();
      const dateB = new Date(b.created_at || b.createdAt || b.orderDate || '').getTime();
      return dateB - dateA;
    })
    .slice(0, limit)
    .map((order: Order, index: number) => {
      // Generate a fallback ID to ensure uniqueness
      const fallbackId = `order-${index}-${Date.now()}`;
      
      // FIXED: Match the working orders page data structure exactly
      const customer = order.shipping_address?.name || 'Unknown Customer';
      
      // FIXED: Get product names from items array like working orders page
      let productDisplay = 'No Products';
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        const productNames = order.items
          .map((item: any) => item.product_name || item.name || 'Unknown Product')
          .filter(name => name && name !== 'Unknown Product');
        
        if (productNames.length > 0) {
          productDisplay = productNames.length > 1 
            ? `${productNames[0]} +${productNames.length - 1} more`
            : productNames[0];
        }
      }
      
      // FIXED: Use total_amount and parse it like working orders page
      const totalAmount = order.total_amount || order.totalAmount || order.total || order.amount || 0;
      const formattedAmount = typeof totalAmount === 'string' 
        ? parseFloat(totalAmount).toFixed(2)
        : (typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00');
      
      return {
        id: order.id || order._id || order.orderId || fallbackId,
        orderId: order.id ? `${order.id.slice(0, 8)}...` : `#ORD-${(order._id || order.id || index).toString().slice(-6)}`,
        customer: customer,
        product: productDisplay,
        amount: `${formattedAmount}`,
        status: order.status || order.orderStatus || order.order_status || 'pending'
      };
    });
};