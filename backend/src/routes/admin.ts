import express from 'express';
import { 
  getDashboardStats, 
  getRecentOrders, 
  getTopProducts,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAnalyticsReports,
  getSalesReport,
  getUserReport,
  getAllVendors,
  getAllProducts,
  updateProductStatus
} from '../controllers/admin';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/enums';

const router = express.Router();

// Debug route to test admin routes are working
router.get('/test', (req, res) => {
  console.log('🔧 Admin test route called - v4');
  res.json({ 
    message: 'Admin routes are working - v4', 
    timestamp: new Date().toISOString(),
    deployment: 'Latest version - v4',
    routes: [
      '/api/admin/test',
      '/api/admin/dashboard/stats',
      '/api/admin/dashboard/recent-orders',
      '/api/admin/dashboard/top-products',
      '/api/admin/users',
      '/api/admin/orders',
      '/api/admin/vendors',
      '/api/admin/products'
    ]
  });
});

// Admin dashboard endpoints
router.get('/dashboard/stats', authenticate, authorize(UserRole.ADMIN), getDashboardStats);
router.get('/dashboard/recent-orders', authenticate, authorize(UserRole.ADMIN), getRecentOrders);
router.get('/dashboard/top-products', authenticate, authorize(UserRole.ADMIN), getTopProducts);

// User management endpoints
router.get('/users', authenticate, authorize(UserRole.ADMIN), getAllUsers);
router.put('/users/:id/status', authenticate, authorize(UserRole.ADMIN), updateUserStatus);
router.delete('/users/:id', authenticate, authorize(UserRole.ADMIN), deleteUser);

// Vendor management endpoints
router.get('/vendors', authenticate, authorize(UserRole.ADMIN), getAllVendors);

// Product management endpoints
router.get('/products', authenticate, authorize(UserRole.ADMIN), getAllProducts);
router.put('/products/:id/status', authenticate, authorize(UserRole.ADMIN), updateProductStatus);

// Order management endpoints
router.get('/orders', authenticate, authorize(UserRole.ADMIN), getAllOrders);
router.put('/orders/:id/status', authenticate, authorize(UserRole.ADMIN), updateOrderStatus);

// Analytics endpoints
router.get('/analytics', authenticate, authorize(UserRole.ADMIN), getAnalyticsReports);
router.get('/analytics/sales', authenticate, authorize(UserRole.ADMIN), getSalesReport);
router.get('/analytics/users', authenticate, authorize(UserRole.ADMIN), getUserReport);

export default router;
