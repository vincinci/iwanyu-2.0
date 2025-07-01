import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Star, ShoppingCart } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Product } from '../types';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import apiService, { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setIsLoading(true);
        const response = await apiService.getProduct(productId);
        if (response.success) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-normal text-gray-900 mb-4">Product not found</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart({
        productId: product.id,
        quantity,
        variantId: selectedVariantId
      });
      
      // Show success message or redirect
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const getSelectedVariant = () => {
    if (!selectedVariantId || !product?.variants) return null;
    return product.variants.find(v => v.id === selectedVariantId);
  };

  const getCurrentPrice = () => {
    const variant = getSelectedVariant();
    return variant ? variant.price : product?.basePrice || 0;
  };

  const isInStock = () => {
    const variant = getSelectedVariant();
    if (variant) {
      return variant.stockQuantity > 0;
    }
    return true; // Assume in stock if no variants
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getImageUrl(product.images[selectedImageIndex].url)}
                  alt={product.images[selectedImageIndex].altText || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.url)}
                      alt={image.altText || product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-normal text-gray-900 mb-2">
                {product.name}
              </h1>
              
              {product.vendor && (
                <p className="text-sm text-gray-600 mb-4">
                  by {product.vendor.businessName}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">(4.0) • 1 review</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-normal text-gray-900">
                    {formatCurrency(getCurrentPrice())}
                  </span>
                  {product.comparePrice && product.comparePrice > getCurrentPrice() && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(product.comparePrice)}
                    </span>
                  )}
                </div>
                {!isInStock() && (
                  <p className="text-red-600 text-sm mt-1">Out of Stock</p>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Options</h3>
                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <label key={variant.id} className="flex items-center">
                        <input
                          type="radio"
                          name="variant"
                          value={variant.id}
                          checked={selectedVariantId === variant.id}
                          onChange={(e) => setSelectedVariantId(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-sm">
                          {variant.name} - {formatCurrency(variant.price)}
                          {variant.stockQuantity === 0 && (
                            <span className="text-red-600 ml-2">(Out of Stock)</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    aria-label="Increase quantity"
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!isInStock() || isAddingToCart}
                className="w-full bg-black text-white hover:bg-gray-800 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isInStock() ? 'Add to Cart' : 'Out of Stock'}
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-sm text-gray-500 text-center">
                  <Link to="/login" className="text-yellow-600 hover:text-yellow-500">
                    Sign in
                  </Link>{' '}
                  to add items to your cart
                </p>
              )}
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Product Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Category:</span> {product.category?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Active:</span> {product.isActive ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Track Quantity:</span> {product.trackQuantity ? 'Yes' : 'No'}
                </div>
                {product.weight && (
                  <div>
                    <span className="font-medium">Weight:</span> {product.weight}g
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="font-medium">Dimensions:</span> {product.dimensions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
