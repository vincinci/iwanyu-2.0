import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import Button from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  className = '',
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onAddToCart) return;
    
    setIsAddingToCart(true);
    try {
      await onAddToCart(product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onAddToWishlist) return;
    
    try {
      await onAddToWishlist(product.id);
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleImageHover = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleImageLeave = () => {
    setCurrentImageIndex(0);
  };

  const mainImage = product.images?.[currentImageIndex] || product.images?.[0];

  return (
    <div className={`group relative ${className}`}>
      <Link to={`/products/${product.id}`}>
        <div className="space-y-3">
          {/* Product Images */}
          <div className="relative">
            <div 
              className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 group-hover:border-yellow-300 transition-colors"
              onMouseEnter={handleImageHover}
              onMouseLeave={handleImageLeave}
            >
              {mainImage ? (
                <img
                  src={getImageUrl(mainImage.url)}
                  alt={mainImage.altText || product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Action Buttons Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg">
              <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                    isInWishlist
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                      : 'bg-gradient-to-r from-white to-gray-50 text-gray-600 hover:from-gray-50 hover:to-gray-100 hover:text-red-500 border border-gray-200'
                  }`}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart 
                    className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} 
                  />
                </button>

                {/* Quick View Button */}
                <Link
                  to={`/products/${product.id}`}
                  className="p-2 bg-gradient-to-r from-white to-gray-50 text-gray-600 rounded-full shadow-lg hover:from-yellow-50 hover:to-yellow-100 hover:text-yellow-600 transition-all duration-200 border border-gray-200"
                  title="Quick view"
                  aria-label="Quick view product"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>

              {/* Add to Cart Button */}
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  variant="primary"
                  className="w-full py-2 px-4 text-sm font-medium shadow-lg"
                  size="sm"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Sale Badge */}
            {product.comparePrice && product.comparePrice > product.basePrice && (
              <div className="absolute top-3 left-3">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  SALE
                </span>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-medium text-gray-900 hover:text-yellow-700 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(product.basePrice)}
              </span>
              {product.comparePrice && product.comparePrice > product.basePrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </div>
            {product.category && (
              <p className="text-xs text-gray-500">
                {product.category.name}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
