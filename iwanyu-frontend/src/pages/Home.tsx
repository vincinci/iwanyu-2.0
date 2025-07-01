import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store,
  Smartphone, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight, 
  BookOpen, 
  Shirt,
  Home as HomeIcon,
  Dumbbell,
  Monitor,
  Package 
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductCard from '../components/ui/ProductCard';
import { Product, Category } from '../types';
import apiService from '../services/api';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get icon for category
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('electronics')) return Monitor;
    if (name.includes('fashion')) return Shirt;
    if (name.includes('home') || name.includes('garden')) return HomeIcon;
    if (name.includes('sports')) return Dumbbell;
    if (name.includes('books')) return BookOpen;
    return Package; // Default icon for General and others
  };

  // Add to cart handler
  const handleAddToCart = async (productId: string) => {
    try {
      // TODO: Implement actual add to cart API call
      console.log('Adding to cart:', productId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Show success message or update cart state
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = async (productId: string) => {
    try {
      // TODO: Implement actual add to wishlist API call
      console.log('Adding to wishlist:', productId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      // Show success message or update wishlist state
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real data from API
        const [productsResponse, categoriesResponse] = await Promise.all([
          apiService.getProducts({ featured: true, limit: 8 }),
          apiService.getCategories(),
        ]);

        if (productsResponse.success && productsResponse.data?.data?.length > 0) {
          setFeaturedProducts(productsResponse.data.data);
        } else {
          setFeaturedProducts([]);
        }

        if (categoriesResponse.success && categoriesResponse.data?.length > 0) {
          setCategories(categoriesResponse.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
        setFeaturedProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      {/* Simple Hero Section - matching iwanyu.store */}
      <section className="bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-full h-64 bg-gradient-to-br from-white to-gray-50 rounded-lg flex items-center justify-center mb-6 border border-gray-200 shadow-sm">
                <div className="text-center">
                  <h1 className="text-4xl font-light text-gray-800 mb-4">iwanyu stores</h1>
                  <p className="text-gray-600 mb-6">Welcome to our store</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Link to="/products">
                <Button variant="primary" size="lg" className="px-8 py-3 font-medium">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Buttons Section */}
      {categories.length > 0 && (
        <section className="py-8 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-normal text-gray-800 mb-6">Shop by Category</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const IconComponent = getCategoryIcon(category.name);
                return (
                  <Link
                    key={category.id}
                    to={`/collections/${category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                    className="group"
                  >
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200 p-6 text-center group-hover:bg-gradient-to-br group-hover:from-yellow-50 group-hover:to-yellow-100">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center group-hover:from-yellow-100 group-hover:to-yellow-200 transition-all duration-200 shadow-sm">
                        <IconComponent className="w-8 h-8 text-yellow-600 group-hover:text-yellow-700 transition-colors" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors leading-tight">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Collections Section - matching iwanyu.store style */}
      {categories.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {categories.slice(0, 6).map((category, index) => (
              <div key={category.id} className="mb-16">
                <div className="mb-8">
                  <h2 className="text-2xl font-normal text-gray-900 mb-2 border-b-2 border-yellow-400 inline-block pb-1">
                    {category.name}
                  </h2>
                </div>
                
                {/* Featured Products Grid for this Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
                  {featuredProducts.filter((_, productIndex) => productIndex < 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  ))}
                </div>
                
                {/* View All Link */}
                <div className="text-center">
                  <Link 
                    to={`/collections/${category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                    className="inline-flex items-center text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                  >
                    View all products in the {category.name}
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* Modern Iwanyu Vendors Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto">
            
            {/* Content Side */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Store className="w-4 h-4 mr-2" />
                  Join Our Marketplace
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Grow Your Business with
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Iwanyu</span>
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join Rwanda's leading online marketplace and connect with thousands of customers across the country. 
                  Start selling today with our easy-to-use platform built for entrepreneurs like you.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mobile-First</h3>
                    <p className="text-gray-600 text-sm">Manage your store from anywhere with our mobile-optimized platform.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Large Audience</h3>
                    <p className="text-gray-600 text-sm">Reach thousands of active shoppers across Rwanda.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Easy Setup</h3>
                    <p className="text-gray-600 text-sm">Get your store online in minutes, not days.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure Payments</h3>
                    <p className="text-gray-600 text-sm">Safe and reliable payment processing for all transactions.</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/become-vendor" className="group">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-0.5 transition-all duration-200">
                    <Store className="w-5 h-5 mr-2" />
                    Start Selling Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                
                <Link to="/vendor-guide" className="group">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
