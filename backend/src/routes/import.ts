import express from 'express';
import { 
  importProductsFromCSV, 
  importProductsFromUploadedCSV,
  analyzeUploadedCSV,
  getCSVStats,
  csvUpload 
} from '../controllers/import';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/enums';

const router = express.Router();

// Admin import endpoints
router.post('/products/csv', authenticate, authorize(UserRole.ADMIN), importProductsFromCSV);
router.post('/products/upload', authenticate, authorize(UserRole.ADMIN), csvUpload.single('csvFile'), importProductsFromUploadedCSV);
router.post('/csv/analyze', authenticate, authorize(UserRole.ADMIN), csvUpload.single('csvFile'), analyzeUploadedCSV);
router.get('/csv/stats', authenticate, authorize(UserRole.ADMIN), getCSVStats);

export default router;
