import { Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      description,
      basePrice,
      categoryId,
      weight,
      dimensions,
      tags,
      variants,
      images,
      vendorId // Admin can specify vendorId
    } = req.body;

    let vendor;
    
    // If user is admin and vendorId is provided, use that vendor
    if (req.user!.role === 'ADMIN' && vendorId) {
      vendor = await prisma.vendor.findUnique({
        where: { id: vendorId }
      });
      
      if (!vendor) {
        res.status(400).json({
          success: false,
          message: 'Invalid vendor ID provided'
        });
        return;
      }
    } else {
      // Check if user is a vendor
      vendor = await prisma.vendor.findUnique({
        where: { userId: req.user!.id }
      });

      if (!vendor) {
        res.status(403).json({
          success: false,
          message: 'Only vendors can create products'
        });
        return;
      }
    }

    // Check product limit for free plan
    if (vendor.planType === 'FREE') {
      const productCount = await prisma.product.count({
        where: { vendorId: vendor.id }
      });

      if (productCount >= 10) {
        res.status(403).json({
          success: false,
          message: 'Free plan allows maximum 10 products. Upgrade to premium for unlimited products.'
        });
        return;
      }
    }

    // Generate unique SKU
    const sku = `${vendor.businessName.slice(0, 3).toUpperCase()}-${Date.now()}`;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        basePrice: parseFloat(basePrice),
        categoryId,
        vendorId: vendor.id,
        sku,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        tags: tags || null,
      },
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });

    // Create product images if provided
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: images[i].url,
            altText: images[i].altText || name,
            order: i,
          }
        });
      }
    }

    // Create product variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: variant.name,
            attributes: variant.attributes,
            price: parseFloat(variant.price),
            stock: parseInt(variant.stock),
            sku: `${sku}-${variant.name.replace(/\s+/g, '-').toUpperCase()}`,
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      status: 'APPROVED',
      isActive: true,
    };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } },
      ];
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
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
          vendor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                }
              }
            }
          },
          variants: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            take: 1
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { [sortBy as string]: order as 'asc' | 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average ratings
    const productsWithRatings = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length,
      reviews: undefined // Remove reviews from response
    }));

    res.json({
      success: true,
      data: {
        products: productsWithRatings,
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

export const getProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        variants: {
          where: { isActive: true }
        },
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        product: {
          ...product,
          averageRating,
          reviewCount: product.reviews.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user owns this product
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.id }
    });

    if (!vendor) {
      res.status(403).json({
        success: false,
        message: 'Only vendors can update products'
      });
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: vendor.id
      }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to update it'
      });
      return;
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        basePrice: updateData.basePrice ? parseFloat(updateData.basePrice) : undefined,
        weight: updateData.weight ? parseFloat(updateData.weight) : undefined,
        dimensions: updateData.dimensions ? JSON.parse(updateData.dimensions) : undefined,
        tags: updateData.tags ? JSON.parse(updateData.tags) : undefined,
        status: 'PENDING' // Reset to pending after update
      },
      include: {
        images: true,
        variants: true,
        category: true
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is admin or vendor
    if (req.user!.role === 'ADMIN') {
      // Admin can delete any product
      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      // Soft delete by setting isActive to false
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
      return;
    }

    // Check if user owns this product (for vendors)
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.id }
    });

    if (!vendor) {
      res.status(403).json({
        success: false,
        message: 'Only vendors can delete products'
      });
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: vendor.id
      }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to delete it'
      });
      return;
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};
