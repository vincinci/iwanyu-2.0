import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Phone, FileText, Check, Upload, Shield, Info, Store, AlertCircle, Mail } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { handleApiError } from '../utils/helpers';

const vendorSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(1, 'Please select a business type'),
  businessEmail: z.string().email('Please enter a valid business email'),
  businessPhone: z.string().min(10, 'Please enter a valid phone number'),
  businessAddress: z.string().min(5, 'Please enter a complete business address'),
  businessDescription: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
});

type VendorFormData = z.infer<typeof vendorSchema>;

const BecomeVendor: React.FC = () => {
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>('');

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if user is logged in and is a customer
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const isVendor = isAuthenticated && user?.role === 'VENDOR';
  const isNotLoggedIn = !isAuthenticated;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess('');

      if (!idDocument) {
        setError('Please upload your ID document');
        return;
      }

      // First, register as vendor
      const vendorResponse = await apiService.registerVendor({
        businessName: data.businessName,
        businessType: data.businessType,
        description: data.businessDescription,
      });

      if (!vendorResponse.success) {
        setError(vendorResponse.message || 'Failed to register vendor');
        return;
      }

      // Upload ID document
      const uploadResponse = await apiService.uploadVendorIdDocument(idDocument);
      if (!uploadResponse.success) {
        setError(uploadResponse.message || 'Failed to upload ID document');
        return;
      }

      setSuccess('Vendor application submitted successfully! You will receive an email once your application is reviewed.');
      
      // Reset form
      reset();
      setIdDocument(null);

      // Navigate to vendor dashboard after a delay
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 3000);

    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid ID document (JPEG, PNG, or PDF)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setIdDocument(file);
      setError(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Store className="mx-auto h-12 w-12 text-yellow-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Become a Seller
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join thousands of sellers on Iwanyu marketplace
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Customer Account Required Banner */}
          {(isNotLoggedIn || isVendor) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
              <div className="flex">
                <Info className="h-6 w-6 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Customer Account Required
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    {isNotLoggedIn ? (
                      <p>
                        To become a seller on Iwanyu, you need to have a customer account first. 
                        Please{' '}
                        <Link 
                          to="/register" 
                          className="font-medium underline hover:text-blue-600"
                        >
                          create a customer account
                        </Link>
                        {' '}or{' '}
                        <Link 
                          to="/login" 
                          className="font-medium underline hover:text-blue-600"
                        >
                          sign in
                        </Link>
                        {' '}to continue.
                      </p>
                    ) : (
                      <p>
                        You're already registered as a vendor. If you need to update your vendor information, 
                        please contact our support team.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Shield className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Verified Sellers</h3>
              <p className="text-xs text-gray-600 mt-1">Secure ID verification process</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Store className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Easy Setup</h3>
              <p className="text-xs text-gray-600 mt-1">Get started in minutes</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Check className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Secure Payments</h3>
              <p className="text-xs text-gray-600 mt-1">Flutterwave integration</p>
            </div>
          </div>

          {/* Form */}
          <div className={`bg-white py-8 px-4 sm:px-10 shadow rounded-lg ${!isCustomer ? 'opacity-50 pointer-events-none' : ''}`}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <div className="text-sm text-red-800">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <Check className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <div className="text-sm text-green-800">{success}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Business Name */}
                <Input
                  label="Business Name"
                  type="text"
                  placeholder="Enter your business name"
                  {...register('businessName')}
                  error={errors.businessName?.message}
                />

                {/* Business Type */}
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    {...register('businessType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select business type</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="services">Services</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.businessType && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
                  )}
                </div>

                {/* Business Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business Email"
                    type="email"
                    placeholder="business@example.com"
                    {...register('businessEmail')}
                    error={errors.businessEmail?.message}
                  />
                  
                  <Input
                    label="Business Phone"
                    type="tel"
                    placeholder="+250 788 123 456"
                    {...register('businessPhone')}
                    error={errors.businessPhone?.message}
                  />
                </div>

                {/* Business Address */}
                <Input
                  label="Business Address"
                  type="text"
                  placeholder="Enter your complete business address"
                  {...register('businessAddress')}
                  error={errors.businessAddress?.message}
                />

                {/* Business Description */}
                <div>
                  <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description (Optional)
                  </label>
                  <textarea
                    id="businessDescription"
                    {...register('businessDescription')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Tell us about your business..."
                  />
                </div>

                {/* ID Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Document * <span className="text-gray-500 text-xs">(National ID, Passport, or Driver's License)</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="idDocument"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500"
                        >
                          <span>Upload ID document</span>
                          <input
                            id="idDocument"
                            name="idDocument"
                            type="file"
                            className="sr-only"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 5MB
                      </p>
                      {idDocument && (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ {idDocument.name} selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link to="/terms" className="text-yellow-600 hover:text-yellow-500">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-yellow-600 hover:text-yellow-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading || !isCustomer}
                >
                  {isLoading ? (
                    'Submitting Application...'
                  ) : !isCustomer ? (
                    'Customer Account Required'
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Vendor Application
                    </>
                  )}
                </Button>
              </div>

              {/* Privacy Notice */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
                <p className="text-xs text-gray-600">
                  <strong>Privacy & Security:</strong> Your ID document will be securely stored and used only for verification purposes. 
                  Applications are typically reviewed within 2-3 business days. You'll receive an email notification once reviewed.
                </p>
              </div>
            </form>
          </div>

          {/* Contact Support */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Need help with your application?</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                <span>support@iwanyu.store</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>+250 788 123 456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BecomeVendor;
