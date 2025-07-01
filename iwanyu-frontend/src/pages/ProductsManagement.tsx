import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CreateProductModal from '../components/CreateProductModal';
import { useAuth } from '../context/AuthContext';
import { useAdminRefresh } from '../context/AdminRefreshContext';
import apiService from '../services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  status: string;
  isActive: boolean;
  sku: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    businessName: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
  images?: Array<{
    id: string;
    url: string;
    altText: string;
  }>;
  averageRating: number;
  reviewCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ProductsManagement: React.FC = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useAdminRefresh();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProducts = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        limit: 10
      };
      
      if (search) params.search = search;
      if (status) params.status = status;
      
      const response = await apiService.getAdminProducts(params);
      
      if (response.success && response.data) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination);
      } else {
        setProducts([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm, selectedStatus);
  }, [currentPage, searchTerm, selectedStatus]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(productId);
        fetchProducts(currentPage, searchTerm, selectedStatus);
        triggerRefresh(); // Trigger dashboard refresh
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleUpdateProductStatus = async (productId: string, status: string) => {
    try {
      const response = await apiService.updateProductStatus(productId, status);
      if (response.success) {
        fetchProducts(currentPage, searchTerm, selectedStatus);
        triggerRefresh(); // Trigger dashboard refresh
        alert(`Product ${status.toLowerCase()} successfully!`);
      } else {
        alert('Failed to update product status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update product status. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        // Delete products one by one (could be optimized with a bulk delete API)
        for (const productId of selectedProducts) {
          await apiService.deleteProduct(productId);
        }
        setSelectedProducts([]);
        fetchProducts(currentPage, searchTerm, selectedStatus);
        triggerRefresh(); // Trigger dashboard refresh
      } catch (error) {
        console.error('Error deleting products:', error);
        alert('Failed to delete some products. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-600 mt-1">Manage all products in your store</p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/admin"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                  />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={() => fetchProducts(currentPage, searchTerm, selectedStatus)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No products found</p>
                <Link
                  to="/admin/products/new"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add First Product
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-12 px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedProducts.length === products.length && products.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => {
                        const totalStock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0;
                        const imageUrl = product.images?.[0]?.url || '/placeholder-product.jpg';
                        
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleSelectProduct(product.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover mr-4"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                  }}
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    SKU: {product.sku}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {product.category.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatCurrency(product.basePrice)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <span className={`${totalStock <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                                {totalStock}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(product.status, product.isActive)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <div className="flex justify-end items-center gap-2">
                                {/* Status Action Buttons */}
                                {product.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateProductStatus(product.id, 'APPROVED')}
                                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                      title="Approve Product"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateProductStatus(product.id, 'REJECTED')}
                                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                      title="Reject Product"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                                {product.status === 'REJECTED' && (
                                  <button
                                    onClick={() => handleUpdateProductStatus(product.id, 'APPROVED')}
                                    className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                    title="Approve Product"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                )}
                                {product.status === 'APPROVED' && (
                                  <button
                                    onClick={() => handleUpdateProductStatus(product.id, 'REJECTED')}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                    title="Reject Product"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                )}
                                
                                {/* Regular Action Buttons */}
                                <Link
                                  to={`/products/${product.id}`}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="View Product"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  to={`/admin/products/${product.id}/edit`}
                                  className="text-indigo-600 hover:text-indigo-900 p-1"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={pagination.page <= 1}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1 text-sm rounded ${
                                  pagination.page === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                          disabled={pagination.page >= pagination.pages}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProducts(currentPage, searchTerm, selectedStatus);
          setShowCreateModal(false);
          triggerRefresh(); // Trigger dashboard refresh
        }}
      />
    </div>
  );
};

export default ProductsManagement;
