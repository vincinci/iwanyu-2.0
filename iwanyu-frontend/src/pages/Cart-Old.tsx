import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    basePrice: number;
    images: Array<{ url: string; altText: string }>;
    category?: {
      id: string;
      name: string;
    };
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

interface CartSummary {
  totalItems: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    shippingCost: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper functions for cart calculations
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.variant?.price || item.product.basePrice;
      return total + (price * item.quantity);
    }, 0);
  };

  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response.data.items);
      setCartSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    setIsUpdating(itemId);
    try {
      await cartAPI.updateCartItem(itemId, newQuantity);
      await loadCartItems(); // Reload cart to get updated data
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsUpdating(itemId);
    try {
      await cartAPI.removeFromCart(itemId);
      await loadCartItems(); // Reload cart to get updated data
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const proceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Please sign in</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to be signed in to view your cart.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-normal text-gray-900 border-b-2 border-yellow-400 inline-block pb-1">
            Shopping Cart ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'})
          </h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <Link to={`/products/${item.product.id}`}>
                        {item.product.images?.[0] ? (
                          <img
                            src={getImageUrl(item.product.images[0].url)}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product.id}`}>
                        <h3 className="text-sm font-medium text-gray-900 hover:text-yellow-700 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      {item.product.category && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.product.category.name}
                        </p>
                      )}
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {formatCurrency(item.product.basePrice)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isUpdating === item.id}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isUpdating === item.id}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isUpdating === item.id}
                      className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(getTotalPrice())}</span>
                    </div>
                  </div>
                </div>

                <Button variant="gradient" size="lg" className="w-full mb-3">
                  Proceed to Checkout
                </Button>
                
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart.</p>
            <Link to="/">
              <Button variant="primary" size="lg">Continue Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
