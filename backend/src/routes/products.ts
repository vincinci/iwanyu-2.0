import express from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  upload
} from '../controllers/products';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types/enums';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Protected routes (vendor only)
router.post('/',
  authenticate,
  authorize(UserRole.VENDOR),
  upload.array('images', 10), // Allow up to 10 images
  [
    body('name').notEmpty().trim().withMessage('Product name is required'),
    body('description').notEmpty().trim().withMessage('Product description is required'),
    body('basePrice').isNumeric().withMessage('Base price must be a number'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  validate,
  createProduct
);

router.put('/:id',
  authenticate,
  authorize(UserRole.VENDOR),
  updateProduct
);

router.delete('/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  deleteProduct
);

// Admin-only routes for product management
router.get('/admin/all',
  authenticate,
  authorize(UserRole.ADMIN),
  getProducts
);

router.post('/admin/create',
  authenticate,
  authorize(UserRole.ADMIN),
  upload.array('images', 10),
  [
    body('name').notEmpty().trim().withMessage('Product name is required'),
    body('description').notEmpty().trim().withMessage('Product description is required'),
    body('basePrice').isNumeric().withMessage('Base price must be a number'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  validate,
  createProduct
);

router.put('/admin/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updateProduct
);

router.delete('/admin/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteProduct
);

export default router;
