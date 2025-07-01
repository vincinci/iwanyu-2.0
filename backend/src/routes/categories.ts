import express from 'express';
import { getCategories, getCategoryById, createCategory } from '../controllers/categories';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/enums';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authenticate, authorize(UserRole.ADMIN), createCategory);

export default router;
