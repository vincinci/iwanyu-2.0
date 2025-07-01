import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, Lock, User, Phone as PhoneIcon, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { handleApiError, validatePassword, formatPhone } from '../utils/helpers';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [] as string[] });
  
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  React.useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    }
  }, [password]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone ? formatPhone(data.phone) : undefined,
        role: 'CUSTOMER', // Always register as CUSTOMER
      };
      
      await registerUser(userData);
      
      // Always navigate to home after successful registration
      navigate('/');
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <Logo width={100} height={32} />
            </Link>
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to store
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
            <div className="mb-8">
              <UserPlus className="h-16 w-16 text-white mb-6" />
              <h1 className="text-4xl font-bold mb-4 text-white">Join Iwanyu today</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Create your account and start shopping or selling on Rwanda's premier marketplace.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span>Shop from thousands of products</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span>Sell your products nationwide</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span>Secure transactions with Flutterwave</span>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Right side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <Logo width={120} height={40} className="mx-auto mb-4" />
            </div>

            {/* Form Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Register Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 text-sm">{error}</div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label="First name"
                        type="text"
                        autoComplete="given-name"
                        className="pl-10"
                        placeholder="First name"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                      />
                      <div className="absolute left-3 top-9 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Input
                        label="Last name"
                        type="text"
                        autoComplete="family-name"
                        className="pl-10"
                        placeholder="Last name"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                      />
                      <div className="absolute left-3 top-9 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="relative">
                    <Input
                      label="Email address"
                      type="email"
                      autoComplete="email"
                      className="pl-10"
                      placeholder="Enter your email"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                    <div className="absolute left-3 top-9 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="relative">
                    <Input
                      label="Phone number (optional)"
                      type="tel"
                      autoComplete="tel"
                      className="pl-10"
                      placeholder="+250 788 123 456"
                      {...register('phone')}
                      error={errors.phone?.message}
                      helpText="We'll use this for order updates"
                    />
                    <div className="absolute left-3 top-9 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Password */}
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pl-10 pr-10"
                      placeholder="Create a password"
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <div className="absolute left-3 top-9 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 z-20"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {password && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
                      <div className="grid grid-cols-1 gap-1">
                        {passwordValidation.errors.map((error, index) => (
                          <p key={index} className="text-xs text-red-600">• {error}</p>
                        ))}
                        {passwordValidation.isValid && (
                          <p className="text-xs text-green-600">• Password meets all requirements</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Confirm Password */}
                  <div className="relative">
                    <Input
                      label="Confirm password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pl-10 pr-10"
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      error={errors.confirmPassword?.message}
                    />
                    <div className="absolute left-3 top-9 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 z-20"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms')}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mt-1"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link to="/terms" className="text-gray-900 hover:text-gray-700 underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-gray-900 hover:text-gray-700 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Creating account...'
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              
              {/* Vendor Information */}
              <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Want to sell on Iwanyu?</strong> After creating your customer account, you can{' '}
                  <Link to="/become-vendor" className="text-yellow-600 hover:text-yellow-500 font-medium">
                    apply to become a vendor
                  </Link>
                  {' '}and start selling your products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
