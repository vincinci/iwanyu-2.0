import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthResponse, ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    console.log('🔧 Environment Variables:', {
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    console.log('🔗 API Service initialized with baseURL:', this.baseURL);
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 180000, // Increase timeout to 3 minutes for Render cold starts
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    
    // Optionally warm up the backend on initialization
    this.warmupBackend();
  }

  // Health check and backend warmup
  async healthCheck(): Promise<boolean> {
    try {
      // Health endpoint is at /health (not /api/health), so use full URL
      const healthUrl = this.baseURL.replace('/api', '') + '/health';
      const response = await axios.get(healthUrl, {
        timeout: 30000, // 30 second timeout for health check
      });
      return response.status === 200;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  // Warm up the backend in the background to reduce cold starts
  private async warmupBackend(): Promise<void> {
    try {
      // Don't block initialization, run in background
      setTimeout(async () => {
        console.log('🔥 Warming up backend...');
        const isHealthy = await this.healthCheck();
        if (isHealthy) {
          console.log('✅ Backend is warm and ready');
        } else {
          console.log('⚠️ Backend warmup failed, may experience cold start delays');
        }
      }, 1000); // Wait 1 second after initialization
    } catch (error) {
      // Silently fail warmup, don't affect user experience
      console.warn('Backend warmup error:', error);
    }
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Don't redirect if we're on login/register pages or during auth requests
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath === '/login' || currentPath === '/register';
          const isAuthRequest = error.config?.url?.includes('/auth/');
          
          if (!isAuthPage && !isAuthRequest) {
            // Token expired or invalid - only redirect if not on auth pages
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method with cold start handling
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api(config);
      return response.data;
    } catch (error: any) {
      // Handle Render cold start timeouts
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn('⚠️ Backend cold start detected. This may take a few minutes on first load.');
        throw new Error('Backend is starting up (cold start). Please wait a moment and try again.');
      }
      
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  }

  // Special request method for critical operations with retry logic
  private async requestWithRetry<T>(config: AxiosRequestConfig, maxRetries = 2): Promise<ApiResponse<T>> {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`🔄 Retry attempt ${attempt - 1}/${maxRetries} for ${config.url}`);
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
        
        const response = await this.api({
          ...config,
          timeout: attempt === 1 ? 180000 : 240000, // Longer timeout for retries (4 minutes)
        });
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on authentication errors or client errors
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
        
        // Retry on network errors or timeouts
        if (attempt <= maxRetries && (
          error.code === 'ECONNABORTED' || 
          error.message?.includes('timeout') ||
          error.message?.includes('Network Error')
        )) {
          console.warn(`⚠️ Request failed (attempt ${attempt}). Retrying...`);
          continue;
        }
        
        break;
      }
    }
    
    // If we get here, all retries failed
    if (lastError?.code === 'ECONNABORTED' || lastError?.message?.includes('timeout')) {
      throw new Error('Backend is taking longer than expected to respond. This might be due to a cold start. Please try again in a few minutes.');
    }
    
    const message = lastError?.response?.data?.message || lastError?.message || 'Request failed after retries';
    throw new Error(message);
  }

  // Auth methods with retry logic
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.api({
        method: 'POST',
        url: '/auth/login',
        data: { email, password },
        timeout: 180000, // 3 minute timeout for authentication
      });
      
      // Backend returns {message, user, token} directly
      // Transform to expected format {success, data: {user, token}}
      return {
        success: true,
        message: response.data.message,
        data: {
          user: response.data.user,
          token: response.data.token
        }
      };
    } catch (error: any) {
      // Provide helpful error messages for authentication
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Login is taking longer than expected. The backend may be starting up (cold start). Please wait a moment and try again.');
      }
      
      // Handle specific authentication errors
      if (error.response?.status === 401) {
        const message = error.response?.data?.error || error.response?.data?.message || 'Invalid email or password';
        throw new Error(message);
      }
      
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
      throw new Error(message);
    }
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'CUSTOMER' | 'VENDOR';
  }): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.api({
        method: 'POST',
        url: '/auth/register',
        data: userData,
        timeout: 180000, // 3 minute timeout for registration
      });
      
      // Backend returns {message, user, token} directly
      // Transform to expected format {success, data: {user, token}}
      return {
        success: true,
        message: response.data.message,
        data: {
          user: response.data.user,
          token: response.data.token
        }
      };
    } catch (error: any) {
      // Provide helpful error messages for registration
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Registration is taking longer than expected. The backend may be starting up (cold start). Please wait a moment and try again.');
      }
      
      // Handle specific registration errors
      if (error.response?.status === 401) {
        const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed - invalid data';
        throw new Error(message);
      }
      
      if (error.response?.status === 409) {
        const message = error.response?.data?.error || error.response?.data?.message || 'An account with this email already exists';
        throw new Error(message);
      }
      
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(message);
    }
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/auth/profile',
    });
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: '/auth/profile',
      data,
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: '/auth/change-password',
      data: { currentPassword, newPassword },
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/auth/forgot-password',
      data: { email },
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/auth/reset-password',
      data: { token, password },
    });
  }

  // User address methods
  async getUserAddresses(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/users/addresses',
    });
  }

  async createUserAddress(data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/users/addresses',
      data,
    });
  }

  async updateUserAddress(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/users/addresses/${id}`,
      data,
    });
  }

  async deleteUserAddress(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/users/addresses/${id}`,
    });
  }

  // Products methods - using retry logic for critical data loading
  async getProducts(params?: any): Promise<ApiResponse<any>> {
    return this.requestWithRetry({
      method: 'GET',
      url: '/products',
      params,
    }, 3); // 3 retries for critical product data
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.requestWithRetry({
      method: 'GET',
      url: `/products/${id}`,
    }, 2); // 2 retries for individual product data
  }

  async createProduct(data: FormData): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/products',
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateProduct(id: string, data: FormData): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/products/${id}`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/products/${id}`,
    });
  }

  // Categories methods - using retry logic for critical data loading
  async getCategories(): Promise<ApiResponse<any>> {
    return this.requestWithRetry({
      method: 'GET',
      url: '/categories',
    }, 3); // 3 retries for critical category data
  }

  // Vendors methods
  async getVendors(params?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/vendors',
      params,
    });
  }

  async getVendor(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: `/vendors/${id}`,
    });
  }

  async createVendorApplication(data: FormData): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/vendors/apply',
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async registerVendor(data: {
    businessName: string;
    businessType: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/vendors/register',
      data,
    });
  }

  async uploadVendorIdDocument(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('document', file);
    
    return this.request({
      method: 'POST',
      url: '/vendors/upload-id',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateVendor(data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: '/vendors/profile',
      data,
    });
  }

  // Orders methods
  async getOrders(params?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/orders',
      params,
    });
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: `/orders/${id}`,
    });
  }

  async createOrder(data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/orders',
      data,
    });
  }

  async updateOrder(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/orders/${id}`,
      data,
    });
  }

  // Cart methods - using retry logic for cart operations
  async getCart(): Promise<ApiResponse<any>> {
    return this.requestWithRetry({
      method: 'GET',
      url: '/cart',
    }, 2); // 2 retries for cart data
  }

  async addToCart(data: {
    productId: string;
    quantity: number;
    variantId?: string;
  }): Promise<ApiResponse<any>> {
    return this.requestWithRetry({
      method: 'POST',
      url: '/cart/add',
      data,
    }, 1); // 1 retry for add to cart
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/cart/update/${itemId}`,
      data: { quantity },
    });
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/cart/remove/${itemId}`,
    });
  }

  async clearCart(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: '/cart/clear',
    });
  }

  // Checkout methods
  async createCheckoutOrder(data: {
    addressId: string;
    paymentMethod: string;
    items: Array<{
      productId: string;
      quantity: number;
      variantId?: string;
    }>;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/checkout/create',
      data,
    });
  }

  async initializeOrderPayment(orderId: string, data: {
    paymentMethod: string;
    redirectUrl?: string;
  }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: `/checkout/${orderId}/payment/initialize`,
      data,
    });
  }

  async verifyOrderPayment(orderId: string, data: {
    transactionId: string;
    status: string;
  }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: `/checkout/${orderId}/payment/verify`,
      data,
    });
  }

  // Payments methods
  async initializePayment(data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/payments/initialize',
      data,
    });
  }

  async verifyPayment(reference: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/payments/verify',
      data: { reference },
    });
  }

  // File upload methods
  async uploadFile(file: File, type: 'product' | 'document'): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request({
      method: 'POST',
      url: '/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async bulkUploadProducts(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request({
      method: 'POST',
      url: '/upload/bulk-products',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Search methods
  async searchProducts(query: string, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
    }

    return this.request({
      method: 'GET',
      url: `/search/products?${params.toString()}`,
    });
  }

  // Admin methods with fallback handling
  async getDashboardStats(timeRange: string = '7d'): Promise<ApiResponse<any>> {
    try {
      return await this.request({
        method: 'GET',
        url: '/admin/dashboard/stats',
        params: { timeRange },
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('Admin dashboard stats endpoint not available, returning fallback data');
        return {
          success: true,
          message: 'Using fallback data - admin endpoint not available',
          data: {
            totalUsers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalProducts: 0,
            averageRating: 0,
            pendingOrders: 0,
            newUsersThisMonth: 0,
            revenueGrowth: 0
          }
        };
      }
      throw error;
    }
  }

  async getRecentOrders(limit: number = 10): Promise<ApiResponse<any>> {
    try {
      return await this.request({
        method: 'GET',
        url: '/admin/dashboard/recent-orders',
        params: { limit },
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('Admin recent orders endpoint not available, returning empty array');
        return {
          success: true,
          message: 'Using fallback data - admin endpoint not available',
          data: []
        };
      }
      throw error;
    }
  }

  async getTopProducts(limit: number = 10): Promise<ApiResponse<any>> {
    try {
      return await this.request({
        method: 'GET',
        url: '/admin/dashboard/top-products',
        params: { limit },
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('Admin top products endpoint not available, returning empty array');
        return {
          success: true,
          message: 'Using fallback data - admin endpoint not available',
          data: []
        };
      }
      throw error;
    }
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/analytics',
    });
  }

  async approveVendor(vendorId: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: `/admin/vendors/${vendorId}/approve`,
    });
  }

  async rejectVendor(vendorId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: `/admin/vendors/${vendorId}/reject`,
      data: { reason },
    });
  }

  async approveProduct(productId: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: `/admin/products/${productId}/approve`,
    });
  }

  async rejectProduct(productId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: `/admin/products/${productId}/reject`,
      data: { reason },
    });
  }

  // Product Management Methods
  async getAllProducts(params?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/products/admin/all',
      params,
    });
  }

  async createProductAdmin(productData: FormData): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/products/admin/create',
      data: productData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateProductAdmin(id: string, productData: FormData): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/products/admin/${id}`,
      data: productData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteProductAdmin(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/products/admin/${id}`,
    });
  }

  // User Management Methods
  async getAllUsers(params?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/users',
      params,
    });
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/admin/users/${userId}/status`,
      data: { isActive },
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/admin/users/${userId}`,
    });
  }

  // Order Management Methods
  async getAllOrders(params?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/orders',
      params,
    });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/admin/orders/${orderId}/status`,
      data: { status },
    });
  }

  // Analytics Methods
  async getAnalyticsReports(params?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/analytics',
      params,
    });
  }

  async getSalesReport(timeRange?: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/analytics/sales',
      params: timeRange ? { timeRange } : undefined,
    });
  }

  async getUserReport(timeRange?: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/analytics/users',
      params: timeRange ? { timeRange } : undefined,
    });
  }

  // Import methods
  async importProductsFromCSV(csvPath: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/import/products/csv',
      data: { csvPath },
    });
  }

  async uploadAndImportCSV(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    return this.request({
      method: 'POST',
      url: '/import/products/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async uploadAndAnalyzeCSV(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    return this.request({
      method: 'POST',
      url: '/import/csv/analyze',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getCSVStats(csvPath: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/import/csv/stats',
      params: { csvPath },
    });
  }

  // Admin Products methods
  async getAdminProducts(params?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/products',
      params,
    });
  }

  async updateProductStatus(productId: string, status: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/admin/products/${productId}/status`,
      data: { status },
    });
  }

  // Admin test endpoint to check if admin routes are deployed
  async testAdminRoutes(): Promise<ApiResponse<any>> {
    try {
      return await this.request({
        method: 'GET',
        url: '/admin/test',
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('Admin routes not yet deployed to production');
        return {
          success: false,
          message: 'Admin routes not available - backend deployment pending',
          data: null
        };
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();

// Specific API exports for better organization
export const cartAPI = {
  getCart: () => apiService.getCart(),
  addToCart: (data: { productId: string; quantity: number; variantId?: string }) => 
    apiService.addToCart(data),
  updateCartItem: (itemId: string, quantity: number) => 
    apiService.updateCartItem(itemId, quantity),
  removeFromCart: (itemId: string) => apiService.removeFromCart(itemId),
  clearCart: () => apiService.clearCart(),
};

export const checkoutAPI = {
  createOrder: (data: any) => apiService.createCheckoutOrder(data),
  initializePayment: (orderId: string, data: any) => 
    apiService.initializeOrderPayment(orderId, data),
  verifyPayment: (orderId: string, data: any) => 
    apiService.verifyOrderPayment(orderId, data),
};

export default apiService;
