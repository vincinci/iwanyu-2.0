import { Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { FlutterwaveService } from '../services/flutterwave';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for ID document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG) and PDF files are allowed'));
    }
  }
});

export const registerVendor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { businessName, businessType, description } = req.body;

    // Check if user already has a vendor profile
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.id }
    });

    if (existingVendor) {
      res.status(400).json({
        success: false,
        message: 'You already have a vendor profile'
      });
      return;
    }

    // Update user role to VENDOR
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { role: 'VENDOR' }
    });

    // Create vendor profile
    const vendor = await prisma.vendor.create({
      data: {
        userId: req.user!.id,
        businessName,
        businessType,
        description,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Vendor profile created successfully',
      data: { vendor }
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { vendor }
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendorProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { businessName, businessType, description } = req.body;

    const vendor = await prisma.vendor.update({
      where: { userId: req.user!.id },
      data: {
        businessName,
        businessType,
        description,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: { vendor }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadIdDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const vendor = await prisma.vendor.update({
      where: { userId: req.user!.id },
      data: {
        idDocument: req.file.path,
        documentStatus: 'PENDING'
      }
    });

    res.json({
      success: true,
      message: 'ID document uploaded successfully',
      data: { vendor }
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.id }
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
      return;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      vendorId: vendor.id,
    };

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1
          },
          category: true,
          variants: {
            where: { isActive: true }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.id }
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
      return;
    }

    // Get product statistics
    const productStats = await prisma.product.groupBy({
      by: ['status'],
      where: { vendorId: vendor.id },
      _count: true
    });

    // Get recent orders
    const recentOrders = await prisma.orderItem.findMany({
      where: {
        product: {
          vendorId: vendor.id
        }
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        product: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate total earnings
    const totalEarnings = await prisma.orderItem.aggregate({
      where: {
        product: {
          vendorId: vendor.id
        },
        order: {
          paymentStatus: 'COMPLETED'
        }
      },
      _sum: {
        total: true
      }
    });

    // Calculate commission (5% default)
    const grossEarnings = totalEarnings._sum.total || 0;
    const commission = grossEarnings * vendor.commission;
    const netEarnings = grossEarnings - commission;

    res.json({
      success: true,
      data: {
        analytics: {
          productStats,
          recentOrders,
          earnings: {
            gross: grossEarnings,
            commission,
            net: netEarnings,
            available: vendor.availableBalance
          },
          vendor: {
            planType: vendor.planType,
            isVerified: vendor.isVerified,
            documentStatus: vendor.documentStatus
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const requestWithdrawal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, bankDetails } = req.body;

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.id }
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
      return;
    }

    if (!vendor.isVerified) {
      res.status(403).json({
        success: false,
        message: 'Your vendor account must be verified before making withdrawals'
      });
      return;
    }

    if (vendor.availableBalance < amount) {
      res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
      return;
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        vendorId: vendor.id,
        amount,
        bankDetails,
        status: 'PENDING'
      }
    });

    // Update vendor balance (deduct the amount)
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        availableBalance: vendor.availableBalance - amount
      }
    });

    // In a real application, you would integrate with Flutterwave for actual payouts
    // For now, we just create the withdrawal request

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: { withdrawal }
    });
  } catch (error) {
    next(error);
  }
};
