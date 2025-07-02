import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  Package,
  AlertCircle,
  Activity,
  Download,
  Plus
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useAdminRefresh } from '../context/AdminRefreshContext';
import apiService from '../services/api';
import CSVImportModal from '../components/CSVImportModal';

// Currency formatting utility
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'RWF 0';
  }
  return `RWF ${amount.toLocaleString()}`;
};

// Safe number formatting
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
};

// Date formatting utility
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  averageRating: number;
  pendingOrders: number;
  newUsersThisMonth: number;
  revenueGrowth: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  amount: number;
  date: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { refreshTrigger } = useAdminRefresh();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [adminRoutesAvailable, setAdminRoutesAvailable] = useState<boolean | null>(null);

  // Test if admin routes are available
  const testAdminRoutes = useCallback(async () => {
    try {
      const response = await apiService.testAdminRoutes();
      setAdminRoutesAvailable(response.success);
      return response.success;
    } catch (error) {
      setAdminRoutesAvailable(false);
      return false;
    }
  }, []);

  const fetchDashboardData = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }
    
    try {
      // First test if admin routes are available
      const adminAvailable = await testAdminRoutes();
      
      // If admin routes aren't available, show helpful message with fallback data
      if (!adminAvailable) {
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          averageRating: 0,
          pendingOrders: 0,
          newUsersThisMonth: 0,
          revenueGrowth: 0
        });
        setRecentOrders([]);
        setTopProducts([]);
        setError('🚀 Admin dashboard is temporarily unavailable. The backend is being updated with the latest features. Please try again in a few minutes.');
        return;
      }
      
      // Fetch all dashboard data in parallel - all methods now have fallback handling
      const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
        apiService.getDashboardStats(timeRange),
        apiService.getRecentOrders(4), // Get 4 recent orders
        apiService.getTopProducts(3)   // Get top 3 products
      ]);

      // All API methods now return fallback data instead of throwing errors
      // So we can safely use the data
      if (statsResponse?.success && statsResponse?.data) {
        setStats(statsResponse.data);
      } else {
        // Set default stats if response is invalid
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          averageRating: 0,
          pendingOrders: 0,
          newUsersThisMonth: 0,
          revenueGrowth: 0
        });
      }
      
      // Safely handle orders response
      if (ordersResponse?.success && Array.isArray(ordersResponse?.data)) {
        setRecentOrders(ordersResponse.data);
      } else {
        setRecentOrders([]);
      }
      
      // Safely handle products response
      if (productsResponse?.success && Array.isArray(productsResponse?.data)) {
        setTopProducts(productsResponse.data);
      } else {
        setTopProducts([]);
      }
      
      // Check if we're using fallback data
      const usingFallback = statsResponse?.message?.includes('fallback') || 
                           ordersResponse?.message?.includes('fallback') || 
                           productsResponse?.message?.includes('fallback');
      
      if (usingFallback) {
        setError('⚠️ Admin dashboard is showing limited data. The backend is being updated. Full functionality will be restored soon.');
      } else {
        setError(null);
      }
      
      // Reset retry count on successful fetch
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      // All errors should now be handled gracefully
      // This catch block is a safety net
      setError('🚀 Admin dashboard is temporarily unavailable. The backend is being updated with the latest features. Please try again in a few minutes.');
      
      // Set fallback data
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        averageRating: 0,
        pendingOrders: 0,
        newUsersThisMonth: 0,
        revenueGrowth: 0
      });
      setRecentOrders([]);
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange, retryCount, testAdminRoutes]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData(true); // Silent refresh
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData(true); // Silent refresh when page becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboardData]);

  // Auto-refresh after specific time intervals
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh every 2 minutes
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Respond to external refresh triggers
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchDashboardData(true); // Silent refresh when triggered externally
    }
  }, [refreshTrigger, fetchDashboardData]);

  const handleImportSuccess = () => {
    setShowImportModal(false);
    // Refresh dashboard data after successful import
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !error.includes('temporarily unavailable') && !error.includes('limited data')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard Update in Progress</h2>
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 mb-4">
                {error.includes('🚀') ? error : `🚀 ${error}`}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>What's happening?</strong><br />
                  We're deploying the latest admin features to improve your experience. 
                  The dashboard will be back online shortly.
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => fetchDashboardData()}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Checking...' : 'Check Again'}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage your marketplace</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh dashboard data"
                >
                  <Activity className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg ${
                    autoRefresh 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={autoRefresh ? 'Auto-refresh enabled (30s)' : 'Enable auto-refresh'}
                >
                  <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
                  Auto
                </button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select time range"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          {error && (error.includes('temporarily unavailable') || error.includes('limited data')) && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">
                    {error.includes('limited data') ? 'Limited Data Mode' : 'Update in Progress'}
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    {error}
                  </p>
                  <button 
                    onClick={() => fetchDashboardData()}
                    disabled={loading}
                    className="mt-2 text-yellow-800 underline hover:text-yellow-900 text-sm disabled:opacity-50"
                  >
                    {loading ? 'Checking...' : 'Check for updates'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalRevenue)}</p>
                  <p className="text-sm text-green-600">+{formatNumber(stats?.revenueGrowth)}% from last month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalOrders)}</p>
                  <p className="text-sm text-yellow-600">{formatNumber(stats?.pendingOrders)} pending</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalUsers)}</p>
                  <p className="text-sm text-blue-600">+{formatNumber(stats?.newUsersThisMonth)} this month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalProducts)}</p>
                  <p className="text-sm text-orange-600">★ {formatNumber(stats?.averageRating)} avg rating</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Import CSV</span>
                <span className="text-xs text-gray-500">Bulk import products</span>
              </button>

              <Link
                to="/admin/products"
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <Package className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Manage Products</span>
                <span className="text-xs text-gray-500">View and edit products</span>
              </Link>

              <button
                onClick={() => {
                  // Navigate to users management - we'll implement this
                  window.location.href = '/admin/users';
                }}
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <Users className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
                <span className="text-xs text-gray-500">View all users</span>
              </button>

              <button
                onClick={() => {
                  // Navigate to orders management - we'll implement this
                  window.location.href = '/admin/orders';
                }}
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
              >
                <ShoppingBag className="w-8 h-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">View Orders</span>
                <span className="text-xs text-gray-500">Manage all orders</span>
              </button>

              <button
                onClick={() => {
                  // Navigate to analytics - we'll implement this
                  window.location.href = '/admin/analytics';
                }}
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                <TrendingUp className="w-8 h-8 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Analytics</span>
                <span className="text-xs text-gray-500">View reports</span>
              </button>

              <Link
                to="/admin/products"
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Add Product</span>
                <span className="text-xs text-gray-500">Create new product</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                    <Link
                      to="/admin/orders"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all
                    </Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(order.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.date)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No recent orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                    <Link
                      to="/admin/products"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.sales} sales • {formatCurrency(product.revenue)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No top products data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CSV Import Modal */}
          {showImportModal && (
            <CSVImportModal
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              onSuccess={handleImportSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
