import express from 'express';
import { 
  importProductsFromCSV, 
  importProductsFromUploadedCSV,
  analyzeUploadedCSV,
  getCSVStats,
  csvUpload 
} from '../controllers/import';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Admin import endpoints
router.post('/products/csv', authenticate, authorize('ADMIN'), importProductsFromCSV);
router.post('/products/upload', authenticate, authorize('ADMIN'), csvUpload.single('csvFile'), importProductsFromUploadedCSV);
router.post('/csv/analyze', authenticate, authorize('ADMIN'), csvUpload.single('csvFile'), analyzeUploadedCSV);
router.get('/csv/stats', authenticate, authorize('ADMIN'), getCSVStats);

export default router;
