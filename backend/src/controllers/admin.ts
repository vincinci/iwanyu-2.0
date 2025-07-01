import { Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get date filter from query
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get new users in time range
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    // Get total orders
    const totalOrders = await prisma.order.count();
    
    // Get pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        status: 'PENDING'
      }
    });

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        paymentStatus: 'COMPLETED'
      }
    });
    
    const totalRevenue = revenueResult._sum.total || 0;

    // Get revenue in time range for growth calculation
    const revenueInRange = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      }
    });

    // Calculate revenue growth (simplified)
    const revenueThisPeriod = revenueInRange._sum.total || 0;
    const revenueGrowth = totalRevenue > 0 ? ((revenueThisPeriod / totalRevenue) * 100) : 0;

    // Get total products
    const totalProducts = await prisma.product.count({
      where: {
        status: 'APPROVED'
      }
    });

    // Get average rating
    const avgRatingResult = await prisma.review.aggregate({
      _avg: {
        rating: true
      }
    });
    
    const averageRating = avgRatingResult._avg.rating || 0;

    const stats = {
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      pendingOrders,
      newUsersThisMonth,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10 // Round to 1 decimal
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    next(error);
  }
};

export const getRecentOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const orders = await prisma.order.findMany({
      take: parseInt(limit as string),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const recentOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      status: order.status.toLowerCase(),
      amount: order.total,
      date: order.createdAt.toISOString()
    }));

    res.json({
      success: true,
      data: recentOrders
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    next(error);
  }
};

export const getTopProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    // Get products with their order count and total revenue
    const topProducts = await prisma.product.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        images: {
          take: 1,
          orderBy: {
            order: 'asc'
          }
        },
        orderItems: {
          where: {
            order: {
              paymentStatus: 'COMPLETED'
            }
          },
          include: {
            order: true
          }
        }
      }
    });

    // Calculate sales and revenue for each product
    const productsWithStats = topProducts.map(product => {
      const sales = product.orderItems.reduce((total: number, item: any) => {
        return total + item.quantity;
      }, 0);
      
      const revenue = product.orderItems.reduce((total: number, item: any) => {
        return total + item.total;
      }, 0);

      return {
        id: product.id,
        name: product.name,
        sales,
        revenue,
        image: product.images[0]?.url || '/placeholder-product.jpg'
      };
    });

    // Sort by revenue and take top products
    const sortedProducts = productsWithStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: sortedProducts
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    next(error);
  }
};

// User Management Controllers
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          vendor: {
            select: {
              businessName: true,
              isVerified: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    next(error);
  }
};

export const updateUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    next(error);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Don't allow deleting admin users
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.role === 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
      return;
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    next(error);
  }
};

// Order Management Controllers
export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { id: { contains: search as string, mode: 'insensitive' } },
        { user: { 
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  basePrice: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    next(error);
  }
};

// Analytics Controllers
export const getAnalyticsReports = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      newUsers,
      recentOrders,
      topProducts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'DELIVERED' }
      }),
      prisma.product.count(),
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.order.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.product.count({
        where: { createdAt: { gte: startDate } }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalRevenue: totalRevenue._sum?.total || 0,
          totalProducts
        },
        timeRange: {
          newUsers,
          recentOrders,
          newProducts: topProducts
        },
        period: timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    next(error);
  }
};

export const getSalesReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const salesData = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED'
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    next(error);
  }
};

export const getUserReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const userData = await prisma.user.groupBy({
      by: ['createdAt', 'role'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user report:', error);
    next(error);
  }
};

// Vendor Management Controllers
export const getAllVendors = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { businessType: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (status !== 'all') {
      where.isVerified = status === 'verified';
    }
    
    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.vendor.count({ where });
    
    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['PENDING', 'APPROVED', 'REJECTED', 'DISABLED'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be PENDING, APPROVED, REJECTED, or DISABLED'
      });
      return;
    }
    
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
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    res.json({
      success: true,
      message: `Product status updated to ${status}`,
      data: { product: updatedProduct }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all', category = 'all' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { vendor: { businessName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category !== 'all') {
      where.categoryId = category;
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.product.count({ where });
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
