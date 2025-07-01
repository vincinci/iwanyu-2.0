import express from 'express';
import { body } from 'express-validator';
import { 
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  uploadIdDocument,
  getVendorProducts,
  getVendorAnalytics,
  requestWithdrawal,
  uploadDocument
} from '../controllers/vendors';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Vendor registration
router.post('/register', 
  authenticate,
  [
    body('businessName').notEmpty().trim(),
    body('businessType').notEmpty().trim(),
    body('description').optional().trim()
  ],
  validate,
  registerVendor
);

// Vendor profile
router.get('/profile', authenticate, authorize('VENDOR'), getVendorProfile);
router.put('/profile', authenticate, authorize('VENDOR'), updateVendorProfile);

// ID Document upload
router.post('/upload-id', 
  authenticate, 
  authorize('VENDOR'), 
  uploadDocument.single('document'),
  uploadIdDocument
);

// Vendor products
router.get('/products', authenticate, authorize('VENDOR'), getVendorProducts);

// Vendor analytics
router.get('/analytics', authenticate, authorize('VENDOR'), getVendorAnalytics);

// Withdrawals
router.post('/withdraw', 
  authenticate, 
  authorize('VENDOR'),
  [
    body('amount').isNumeric().isFloat({ min: 1000 }), // Minimum 1000 RWF
    body('bankDetails').isObject()
  ],
  validate,
  requestWithdrawal
);

export default router;
