import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Heart } from 'lucide-react';
import { Product } from '../types';

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Load wishlist items from API or local storage
    const loadWishlistItems = async () => {
      setIsLoading(false);
    };
    loadWishlistItems();
  }, []);

  const handleAddToCart = async (productId: string) => {
    try {
      // TODO: Implement actual add to cart API call
      console.log('Adding to cart from wishlist:', productId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      // TODO: Implement actual remove from wishlist API call
      console.log('Removing from wishlist:', productId);
      setWishlistItems(items => items.filter(item => item.id !== productId));
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-normal text-gray-900 border-b-2 border-yellow-400 inline-block pb-1">
            My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
          </h1>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleRemoveFromWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love to your wishlist.</p>
            <Link to="/">
              <Button variant="gradient" size="lg" className="px-6 py-2 font-medium">
                Start Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
