import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ShoppingCart, 
  User, 
  Heart,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ModernMenu.css';

interface ModernNavProps {
  className?: string;
}

const ModernNav: React.FC<ModernNavProps> = ({ className = '' }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`menu ${className}`}>
      <Link 
        to="/" 
        className={`link ${isActive('/') ? 'active' : ''}`}
        title="Home"
      >
        <span className="link-icon">
          <Home />
        </span>
        <span className="link-title">Home</span>
      </Link>

      <Link 
        to="/search" 
        className={`link ${isActive('/search') ? 'active' : ''}`}
        title="Search"
      >
        <span className="link-icon">
          <Search />
        </span>
        <span className="link-title">Search</span>
      </Link>

      <Link 
        to="/wishlist" 
        className={`link ${isActive('/wishlist') ? 'active' : ''}`}
        title="Wishlist"
      >
        <span className="link-icon">
          <Heart />
        </span>
        <span className="link-title">Wishlist</span>
      </Link>

      <Link 
        to="/cart" 
        className={`link ${isActive('/cart') ? 'active' : ''}`}
        title="Shopping Cart"
      >
        <span className="link-icon">
          <ShoppingCart />
        </span>
        <span className="link-title">Cart</span>
      </Link>

      <Link 
        to="/become-vendor" 
        className={`link ${isActive('/become-vendor') ? 'active' : ''}`}
        title="Become a Seller"
      >
        <span className="link-icon">
          <Store />
        </span>
        <span className="link-title">Sell</span>
      </Link>

      <Link 
        to={isAuthenticated ? "/profile" : "/login"}
        className={`link ${location.pathname.includes('/login') || location.pathname.includes('/register') || location.pathname.includes('/profile') ? 'active' : ''}`}
        title={isAuthenticated ? "Profile" : "Account"}
      >
        <span className="link-icon">
          <User />
        </span>
        <span className="link-title">{isAuthenticated ? 'Profile' : 'Account'}</span>
      </Link>
    </div>
  );
};

export default ModernNav;
