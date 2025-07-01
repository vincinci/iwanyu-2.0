import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('variantId').optional().isString()
  ],
  validate,
  addToCart
);

// Update cart item quantity
router.put('/update/:itemId',
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  updateCartItem
);

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

export default router;
