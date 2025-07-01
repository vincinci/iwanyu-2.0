import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ShoppingBag, Phone } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { cartAPI, checkoutAPI, apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartSummary, setCartSummary] = useState<any>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCheckoutData();
  }, [user, navigate]);

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);
      
      // Load cart items
      const cartResponse = await cartAPI.getCart();
      setCartItems(cartResponse.data.items);
      setCartSummary(cartResponse.data.summary);

      // Load user addresses
      const addressResponse = await apiService.getUserAddresses();
      setAddresses(addressResponse.data);
      
      // Select default address if available
      const defaultAddress = addressResponse.data.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a shipping address');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      // Create order
      const orderItems: CheckoutItem[] = cartItems.map(item => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        quantity: item.quantity
      }));

      const orderResponse = await checkoutAPI.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        items: orderItems
      });

      const orderId = orderResponse.data.order.id;

      // Initialize payment
      const paymentResponse = await checkoutAPI.initializePayment(orderId, {
        paymentMethod,
        redirectUrl: `${window.location.origin}/orders/${orderId}/payment/callback`
      });

      // Redirect to payment gateway
      if (paymentResponse.data.payment_url) {
        window.location.href = paymentResponse.data.payment_url;
      } else {
        // For non-card payments, redirect to order success
        navigate(`/orders/${orderId}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add some products to your cart before checking out.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/collections')}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-normal text-gray-900 border-b-2 border-yellow-400 inline-block pb-1">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label key={address.id} className="block">
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                        {address.isDefault && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No addresses found</p>
                  <Button onClick={() => navigate('/profile')}>
                    Add Address
                  </Button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="block">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">Credit/Debit Card</span>
                </label>
                
                <label className="block">
                  <input
                    type="radio"
                    name="payment"
                    value="mobile_money"
                    checked={paymentMethod === 'mobile_money'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Mobile Money (MTN, Airtel)
                  </span>
                </label>
                
                <label className="block">
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">Bank Transfer</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => {
                  const itemPrice = item.variant?.price || item.product.basePrice;
                  const itemTotal = itemPrice * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × {formatCurrency(itemPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
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
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddressId}
                className="w-full mt-6"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                By placing your order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
