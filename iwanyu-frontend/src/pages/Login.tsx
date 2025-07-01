import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Store, ArrowRight, Mail, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { handleApiError } from '../utils/helpers';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await login(data.email, data.password);
      navigate(from, { replace: true });
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
              <Store className="h-16 w-16 text-white mb-6" />
              <h1 className="text-4xl font-bold mb-4 text-white">Welcome back to Iwanyu</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Your gateway to Rwanda's premier marketplace. Connect with thousands of customers and grow your business.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span>Secure and trusted platform</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span>Access to thousands of products</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span>Fast and secure payments</span>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <Logo width={120} height={40} className="mx-auto mb-4" />
            </div>

            {/* Form Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-red-600 text-sm">{error}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Email Input */}
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

                  {/* Password Input */}
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <div className="absolute left-3 top-9 flex items-center pointer-events-none z-10">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 z-20 flex items-center"
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
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>

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
                    'Signing in...'
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Additional Links */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Want to sell on Iwanyu?</p>
                <Link
                  to="/become-vendor"
                  className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Store className="mr-2 h-4 w-4" />
                  Become a vendor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
