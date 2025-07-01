import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Store,
  Home,
  Tag,
  Phone,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Category } from '../../types';
import apiService from '../../services/api';
import Logo from '../ui/Logo';
import './ModernHeader.css';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        if (response.success && response.data) {
          setCategories(response.data.slice(0, 6)); // Limit to 6 categories for header
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-menu')) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="modern-header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="top-bar-left">
              <span className="welcome-text">Welcome to Iwanyu - Premium Marketplace</span>
            </div>
            <div className="top-bar-right">
              <Link to="/contact" className="top-link">
                <Phone className="w-3 h-3" />
                Contact
              </Link>
              <Link to="/become-vendor" className="top-link">
                <Store className="w-3 h-3" />
                Sell on Iwanyu
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="main-header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo-section">
              <Link to="/" className="logo-link">
                <Logo width={120} height={38} />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="main-nav">
              <Link to="/" className="nav-link">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <div className="dropdown">
                <button className="nav-link dropdown-trigger">
                  <Tag className="w-4 h-4" />
                  Categories
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="dropdown-menu">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/collections/${category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                      className="dropdown-item"
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link to="/collections" className="dropdown-item view-all">
                    View All Categories
                  </Link>
                </div>
              </div>
              <Link to="/collections" className="nav-link">
                Shop
              </Link>
              <Link to="/about" className="nav-link">
                About
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button" aria-label="Search">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {/* Wishlist */}
              <Link to="/wishlist" className="action-btn wishlist-btn">
                <Heart className="w-5 h-5" />
                <span className="action-text">Wishlist</span>
                <span className="badge">0</span>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="action-btn cart-btn">
                <ShoppingCart className="w-5 h-5" />
                <span className="action-text">Cart</span>
                <span className="badge">0</span>
              </Link>

              {/* User Menu */}
              <div className="user-menu">
                {isAuthenticated ? (
                  <div className="dropdown">
                    <button 
                      className="action-btn user-btn"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <User className="w-5 h-5" />
                      <span className="action-text">
                        {user?.firstName || 'Account'}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className={`dropdown-menu user-dropdown ${isUserMenuOpen ? 'show' : ''}`}>
                        <Link to="/profile" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link to="/orders" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          <ShoppingCart className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link to="/wishlist" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          <Heart className="w-4 h-4" />
                          My Wishlist
                        </Link>
                        {user?.role === 'VENDOR' && (
                          <Link to="/vendor/dashboard" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                            <Store className="w-4 h-4" />
                            Vendor Dashboard
                          </Link>
                        )}
                        {user?.role === 'ADMIN' && (
                          <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                            <Settings className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <hr className="dropdown-divider" />
                        <button onClick={handleLogout} className="dropdown-item logout-btn">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                  </div>
                ) : (
                  <div className="dropdown">
                    <button 
                      className="action-btn user-btn"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <User className="w-5 h-5" />
                      <span className="action-text">Account</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className={`dropdown-menu user-dropdown ${isUserMenuOpen ? 'show' : ''}`}>
                      <Link to="/login" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                        <User className="w-4 h-4" />
                        Sign In
                      </Link>
                      <Link to="/register" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                        <User className="w-4 h-4" />
                        Sign Up
                      </Link>
                      <hr className="dropdown-divider" />
                      <Link to="/wishlist" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="container">
            <div className="mobile-menu-content">
              {/* Mobile Search */}
              <div className="mobile-search">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mobile-search-input"
                  />
                  <button type="submit" className="mobile-search-btn" aria-label="Search">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Mobile Navigation */}
              <nav className="mobile-nav">
                <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link to="/collections" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <Tag className="w-4 h-4" />
                  Shop
                </Link>
                <Link to="/wishlist" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <Heart className="w-4 h-4" />
                  Wishlist
                </Link>
                <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="mobile-nav-link logout-mobile">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/register" className="mobile-nav-link register-mobile" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>

              {/* Mobile Categories */}
              <div className="mobile-categories">
                <h3 className="mobile-categories-title">Categories</h3>
                <div className="mobile-categories-grid">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/collections/${category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                      className="mobile-category-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
