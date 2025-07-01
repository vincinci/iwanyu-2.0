import { Request, Response } from 'express';
import { prisma } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    basePrice: number;
    images: Array<{ url: string; altText: string }>;
    vendor: {
      businessName: string;
    };
  };
  variant?: {
    id: string;
    name: string;
    price: number;
    attributes: any;
  };
  quantity: number;
}

// Get user's cart
export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.variant?.price || item.product.basePrice;
      return total + (price * item.quantity);
    }, 0);

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    res.json({
      items: cartItems,
      summary: {
        totalItems,
        subtotal,
        tax: subtotal * 0.18, // 18% VAT in Rwanda
        shippingCost: subtotal > 50000 ? 0 : 5000, // Free shipping over 50,000 RWF
        total: subtotal + (subtotal * 0.18) + (subtotal > 50000 ? 0 : 5000)
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

// Add item to cart
export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId, quantity, variantId } = req.body;

    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
        status: 'APPROVED'
      },
      include: {
        variants: true
      }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found or not available' });
      return;
    }

    // If variant is specified, check if it exists and is active
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId && v.isActive);
      if (!variant) {
        res.status(404).json({ error: 'Product variant not found or not available' });
        return;
      }

      // Check stock
      if (variant.stock < quantity) {
        res.status(400).json({ error: 'Insufficient stock for this variant' });
        return;
      }
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: variantId || null
        }
      }
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
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
      });

      res.json({ message: 'Cart updated successfully', item: updatedItem });
    } else {
      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          variantId,
          quantity
        },
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
      });

      res.status(201).json({ message: 'Item added to cart successfully', item: cartItem });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId
      },
      include: {
        variant: true
      }
    });

    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    // Check stock if variant exists
    if (cartItem.variant && cartItem.variant.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock for this variant' });
      return;
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
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
    });

    res.json({ message: 'Cart item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId
      }
    });

    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// Clear entire cart
export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
