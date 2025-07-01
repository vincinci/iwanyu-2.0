import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminRefreshProvider } from './context/AdminRefreshContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import BecomeVendor from './pages/BecomeVendor';
import VendorGuide from './pages/VendorGuide';
import VendorDashboard from './pages/VendorDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import ProductsManagement from './pages/ProductsManagement';
import UsersManagement from './pages/UsersManagement';
import OrdersManagement from './pages/OrdersManagement';
import Analytics from './pages/Analytics';
import PaymentMethods from './pages/PaymentMethods';
import Security from './pages/Security';
import AddProduct from './pages/AddProduct';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AdminRefreshProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:collectionName" element={<Collections />} />
              <Route path="/products" element={<Collections />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/become-vendor" element={<BecomeVendor />} />
              <Route path="/vendor-guide" element={<VendorGuide />} />
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/vendor/add-product" element={<AddProduct />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route path="/security" element={<Security />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductsManagement />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/orders" element={<OrdersManagement />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/add-product" element={<AddProduct />} />
              {/* Add more routes as needed */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AdminRefreshProvider>
    </AuthProvider>
  );
}

export default App;
