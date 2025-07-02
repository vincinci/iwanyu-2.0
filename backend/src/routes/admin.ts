import express from 'express';
// Temporarily comment out controller imports for debugging
/*
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
*/
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/enums';

const router = express.Router();

// Debug route to test admin routes are working
router.get('/test', (req, res) => {
  console.log('🔧 Admin test route called');
  res.json({ 
    message: 'Admin routes are working - v2', 
    timestamp: new Date().toISOString(),
    deployment: 'Latest version'
  });
});

// Temporary simple route for dashboard stats
router.get('/dashboard/stats', (req, res) => {
  res.json({ 
    message: 'Admin dashboard stats endpoint working',
    stats: { totalUsers: 0, totalOrders: 0, totalRevenue: 0 }
  });
});

// Temporary simple route for recent orders
router.get('/dashboard/recent-orders', (req, res) => {
  res.json({ 
    message: 'Admin recent orders endpoint working',
    orders: []
  });
});

// Temporary simple route for top products
router.get('/dashboard/top-products', (req, res) => {
  res.json({ 
    message: 'Admin top products endpoint working',
    products: []
  });
});

/*
// Admin dashboard endpoints - commented out for debugging
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
*/

export default router;
