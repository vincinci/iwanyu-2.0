import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Check,
  Shield
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cardType?: 'visa' | 'mastercard' | 'amex';
  email?: string; // for PayPal
  bankName?: string;
  accountNumber?: string;
  isDefault: boolean;
}

const PaymentMethods: React.FC = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // TODO: Implement payment methods API endpoint
        // const response = await apiService.getPaymentMethods();
        // if (response.success) {
        //   setPaymentMethods(response.data || []);
        // }
        
        // For now, show empty state since this is production-ready
        setPaymentMethods([]);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setPaymentMethods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [user]);

  const handleSetDefault = async (methodId: string) => {
    try {
      // TODO: Implement set default payment method API endpoint
      // const response = await apiService.setDefaultPaymentMethod(methodId);
      // if (response.success) {
      //   setPaymentMethods(prev => 
      //     prev.map(method => ({
      //       ...method,
      //       isDefault: method.id === methodId
      //     }))
      //   );
      // }
      console.log('Set default payment method:', methodId);
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const handleDelete = async (methodId: string) => {
    try {
      // TODO: Implement delete payment method API endpoint
      // const response = await apiService.deletePaymentMethod(methodId);
      // if (response.success) {
      //   setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      // }
      console.log('Delete payment method:', methodId);
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const getCardIcon = (cardType: string) => {
    // In a real app, you'd use actual card brand icons
    return <CreditCard className="w-8 h-8 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment methods and billing information</p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Your payment information is secure</h3>
                <p className="text-sm text-blue-800 mt-1">
                  We use industry-standard encryption to protect your payment details. 
                  Your card information is never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-4 mb-6">
            {paymentMethods.map((method) => (
              <div key={method.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getCardIcon(method.cardType || 'card')}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {method.type === 'card' ? method.cardNumber : method.email}
                        </h3>
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {method.type === 'card' && method.cardHolderName}
                        {method.type === 'card' && method.expiryDate && ` • Expires ${method.expiryDate}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <button
                      onClick={() => setEditingMethod(method)}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      aria-label="Edit payment method"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 text-red-600 hover:text-red-900"
                      aria-label="Delete payment method"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {paymentMethods.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment methods</h3>
                <p className="text-gray-600 mb-6">
                  Add a payment method to make purchases easier and faster.
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  Add Payment Method
                </Button>
              </div>
            )}
          </div>

          {/* Add Payment Method Button */}
          {paymentMethods.length > 0 && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Payment Method
            </Button>
          )}

          {/* Add/Edit Payment Method Modal */}
          {(showAddForm || editingMethod) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                </h2>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Payment type"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      defaultValue={editingMethod?.cardNumber}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      defaultValue={editingMethod?.cardHolderName}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue={editingMethod?.expiryDate}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <Input type="text" placeholder="123" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="setDefault"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="setDefault" className="text-sm text-gray-700">
                      Set as default payment method
                    </label>
                  </div>
                </form>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingMethod(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button>
                    {editingMethod ? 'Update' : 'Add'} Payment Method
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
