import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
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
            Shopping Cart ({cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'})
          </h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const itemPrice = item.variant?.price || item.product.basePrice;
                const itemTotal = itemPrice * item.quantity;
                
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <Link to={`/products/${item.product.id}`}>
                          {item.product.images?.[0] ? (
                            <img
                              src={getImageUrl(item.product.images[0].url)}
                              alt={item.product.images[0].altText || item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product.id}`}>
                          <h3 className="text-lg font-medium text-gray-900 hover:text-yellow-600 transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          by {item.product.vendor.businessName}
                        </p>

                        {item.variant && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.variant.name}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isUpdating === item.id || item.quantity <= 1}
                              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            
                            <span className="text-gray-900 font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating === item.id}
                              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-medium text-gray-900">
                                {formatCurrency(itemTotal)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-gray-500">
                                  {formatCurrency(itemPrice)} each
                                </p>
                              )}
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={isUpdating === item.id}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isUpdating === item.id && (
                      <div className="mt-4 flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-gray-500">Updating...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span>{formatCurrency(cartSummary.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-base">
                    <span>Tax (18%)</span>
                    <span>{formatCurrency(cartSummary.tax)}</span>
                  </div>
                  
                  <div className="flex justify-between text-base">
                    <span>Shipping</span>
                    <span>
                      {cartSummary.shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatCurrency(cartSummary.shippingCost)
                      )}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(cartSummary.total)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={proceedToCheckout}
                  className="w-full mt-6"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                {cartSummary.shippingCost > 0 && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Free shipping on orders over {formatCurrency(50000)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">
              Start adding some products to your cart to see them here.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/collections')}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
