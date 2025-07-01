import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  initializePayment,
  verifyPayment
} from '../controllers/orders';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Get user's orders
router.get('/', getOrders);

// Get specific order
router.get('/:orderId', getOrder);

// Create new order (checkout)
router.post('/create',
  [
    body('addressId').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').isIn(['card', 'mobile_money', 'bank_transfer']).withMessage('Invalid payment method'),
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.variantId').optional().isString()
  ],
  validate,
  createOrder
);

// Initialize payment for order
router.post('/:orderId/payment/initialize',
  [
    body('paymentMethod').isIn(['card', 'mobile_money', 'bank_transfer']).withMessage('Invalid payment method'),
    body('redirectUrl').optional().isURL().withMessage('Invalid redirect URL')
  ],
  validate,
  initializePayment
);

// Verify payment
router.post('/:orderId/payment/verify',
  [
    body('transactionId').notEmpty().withMessage('Transaction ID is required'),
    body('status').isIn(['successful', 'failed', 'cancelled']).withMessage('Invalid payment status')
  ],
  validate,
  verifyPayment
);

// Update order status (for vendors/admin)
router.put('/:orderId/status',
  [
    body('status').isIn(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status')
  ],
  validate,
  updateOrderStatus
);

// Cancel order
router.put('/:orderId/cancel', cancelOrder);

export default router;
