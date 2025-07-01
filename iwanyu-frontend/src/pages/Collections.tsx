import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductCard from '../components/ui/ProductCard';
import { Product } from '../types';
import apiService from '../services/api';

const Collections: React.FC = () => {
  const { collectionName } = useParams<{ collectionName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // In a real app, you'd filter by collection/category
        const response = await apiService.getProducts({ limit: 20 });
        if (response.success) {
          setProducts(response.data?.data || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [collectionName]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const displayName = collectionName 
    ? collectionName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'All Collections';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-normal text-gray-900 border-b-2 border-yellow-400 inline-block pb-1">
            {displayName}
          </h1>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">No products found in this collection.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Collections;
