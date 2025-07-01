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

const router = express.Router();

// Admin dashboard endpoints
router.get('/dashboard/stats', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/dashboard/recent-orders', authenticate, authorize('ADMIN'), getRecentOrders);
router.get('/dashboard/top-products', authenticate, authorize('ADMIN'), getTopProducts);

// User management endpoints
router.get('/users', authenticate, authorize('ADMIN'), getAllUsers);
router.put('/users/:id/status', authenticate, authorize('ADMIN'), updateUserStatus);
router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);

// Vendor management endpoints
router.get('/vendors', authenticate, authorize('ADMIN'), getAllVendors);

// Product management endpoints
router.get('/products', authenticate, authorize('ADMIN'), getAllProducts);
router.put('/products/:id/status', authenticate, authorize('ADMIN'), updateProductStatus);

// Order management endpoints
router.get('/orders', authenticate, authorize('ADMIN'), getAllOrders);
router.put('/orders/:id/status', authenticate, authorize('ADMIN'), updateOrderStatus);

// Analytics endpoints
router.get('/analytics', authenticate, authorize('ADMIN'), getAnalyticsReports);
router.get('/analytics/sales', authenticate, authorize('ADMIN'), getSalesReport);
router.get('/analytics/users', authenticate, authorize('ADMIN'), getUserReport);

export default router;
