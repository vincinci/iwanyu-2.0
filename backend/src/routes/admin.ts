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
