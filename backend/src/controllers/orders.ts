import { Request, Response } from 'express';
import { prisma, withTransaction } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { FlutterwaveService } from '../services/flutterwave';

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price?: number;
}

interface CreateOrderRequest {
  addressId: string;
  paymentMethod: 'card' | 'mobile_money' | 'bank_transfer';
  items: OrderItem[];
  notes?: string;
}

// Generate unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Get user's orders
export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { userId };
    if (status && typeof status === 'string') {
      where.status = status.toUpperCase();
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1
                },
                vendor: {
                  select: { businessName: true }
                }
              }
            },
            variant: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit)
    });

    const totalCount = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get specific order
export const getOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1
                },
                vendor: {
                  select: { businessName: true, id: true }
                }
              }
            },
            variant: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Create new order from cart or direct items
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { addressId, paymentMethod, items, notes }: CreateOrderRequest = req.body;

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
    }

    const result = await withTransaction(async (tx) => {
      let orderItems: any[] = [];
      let subtotal = 0;

      // Process each item
      for (const item of items) {
        // Get product details
        const product = await tx.product.findFirst({
          where: {
            id: item.productId,
            isActive: true,
            status: 'APPROVED'
          },
          include: {
            variants: true
          }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found or not available`);
        }

        let price = product.basePrice;
        let variant = null;

        // Check variant if specified
        if (item.variantId) {
          variant = product.variants.find(v => v.id === item.variantId && v.isActive);
          if (!variant) {
            throw new Error(`Product variant ${item.variantId} not found or not available`);
          }

          // Check stock
          if (variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for variant ${variant.name}`);
          }

          price = variant.price;

          // Update variant stock
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: variant.stock - item.quantity }
          });
        }

        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price,
          total: itemTotal
        });
      }

      // Calculate totals
      const tax = subtotal * 0.18; // 18% VAT
      const shippingCost = subtotal > 50000 ? 0 : 5000; // Free shipping over 50,000 RWF
      const total = subtotal + tax + shippingCost;

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          addressId,
          orderNumber: generateOrderNumber(),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          tax,
          shippingCost,
          total,
          notes: notes || null,
          items: {
            create: orderItems
          }
        },
        include: {
          address: true,
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { order: 'asc' },
                    take: 1
                  },
                  vendor: {
                    select: { businessName: true }
                  }
                }
              },
              variant: true
            }
          }
        }
      });

      // Clear cart items that were ordered
      if (items.length > 0) {
        const productIds = items.map(item => item.productId);
        await tx.cartItem.deleteMany({
          where: {
            userId,
            productId: { in: productIds }
          }
        });
      }

      return order;
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: result
    });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
};

// Initialize payment for order
export const initializePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;
    const { paymentMethod, redirectUrl } = req.body;

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        paymentStatus: 'PENDING'
      },
      include: {
        address: true
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found or already paid' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Initialize payment with Flutterwave
    const paymentData = await FlutterwaveService.initializePayment({
      tx_ref: `${order.orderNumber}-${Date.now()}`,
      amount: order.total,
      currency: 'RWF',
      redirect_url: redirectUrl || `${process.env.FRONTEND_URL}/orders/${order.id}/payment/callback`,
      payment_options: paymentMethod,
      customer: {
        email: user.email,
        phonenumber: user.phone || '',
        name: `${user.firstName} ${user.lastName}`
      },
      customizations: {
        title: 'Iwanyu Store',
        description: `Payment for order ${order.orderNumber}`,
        logo: `${process.env.FRONTEND_URL}/logo.png`
      },
      meta: {
        orderId: order.id,
        userId: user.id
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: 'RWF',
        status: 'PENDING',
        paymentMethod,
        transactionRef: paymentData.data.tx_ref,
        flwRef: paymentData.data.flw_ref,
        metadata: paymentData.data
      }
    });

    res.json({
      message: 'Payment initialized successfully',
      payment_url: paymentData.data.link,
      payment_data: paymentData.data
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
};

// Verify payment
export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;
    const { transactionId, status } = req.body;

    // Get order and payment
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        payments: {
          where: { transactionRef: transactionId },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!order || !order.payments.length) {
      res.status(404).json({ error: 'Order or payment not found' });
      return;
    }

    const payment = order.payments[0];

    // Verify with Flutterwave
    const verification = await FlutterwaveService.verifyPayment(transactionId);

    if (verification.status === 'success' && verification.data.status === 'successful') {
      // Update payment and order status
      await withTransaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            metadata: verification.data
          }
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'CONFIRMED',
            paymentRef: transactionId
          }
        });
      });

      res.json({
        message: 'Payment verified successfully',
        status: 'success',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'CONFIRMED',
          paymentStatus: 'COMPLETED'
        }
      });
    } else {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: verification.data
        }
      });

      res.json({
        message: 'Payment verification failed',
        status: 'failed',
        error: verification.message
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

// Update order status (for vendors/admin)
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userRole = req.user!.role;

    // Only vendors and admins can update order status
    if (!['VENDOR', 'ADMIN'].includes(userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
    }

    // If vendor, check if they own any products in the order
    if (userRole === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user!.id }
      });

      if (!vendor) {
        res.status(403).json({ error: 'Vendor profile not found' });
        return;
      }

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const hasVendorProducts = order.items.some(item => 
        item.product.vendor?.id === vendor.id
      );

      if (!hasVendorProducts) {
        res.status(403).json({ error: 'You can only update orders containing your products' });
        return;
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1
                },
                vendor: {
                  select: { businessName: true }
                }
              }
            },
            variant: true
          }
        }
      }
    });

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Cancel order
export const cancelOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: { not: 'DELIVERED' }
      },
      include: {
        items: {
          include: {
            variant: true
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found or cannot be cancelled' });
      return;
    }

    await withTransaction(async (tx) => {
      // Restore stock for variants
      for (const item of order.items) {
        if (item.variant) {
          await tx.productVariant.update({
            where: { id: item.variant.id },
            data: { stock: item.variant.stock + item.quantity }
          });
        }
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });
    });

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};
