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
      timeout: 30000, // Increase timeout to 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
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
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api(config);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'CUSTOMER' | 'VENDOR';
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data: userData,
    });
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

  // Products methods
  async getProducts(params?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/products',
      params,
    });
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: `/products/${id}`,
    });
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

  // Categories methods
  async getCategories(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/categories',
    });
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

  // Cart methods
  async getCart(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/cart',
    });
  }

  async addToCart(data: {
    productId: string;
    quantity: number;
    variantId?: string;
  }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/cart/add',
      data,
    });
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

  // Admin methods
  async getDashboardStats(timeRange: string = '7d'): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/dashboard/stats',
      params: { timeRange },
    });
  }

  async getRecentOrders(limit: number = 10): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/dashboard/recent-orders',
      params: { limit },
    });
  }

  async getTopProducts(limit: number = 10): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/admin/dashboard/top-products',
      params: { limit },
    });
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
