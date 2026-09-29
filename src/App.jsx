import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/Layout.css';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Storefront pages
import Home from './pages/Home';
import Listing from './pages/Listing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import OrderConfirmation from './pages/OrderConfirmation';
import SearchResults from './pages/SearchResults';
import AboutContact from './pages/AboutContact';

// Admin pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductForm from './pages/AdminProductForm';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Storefront */}
          <Route path="/" element={<Home />} />
          <Route path="/listing" element={<Listing />} />
          <Route path="/listing/:category" element={<Listing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<AboutContact />} />

          {/* Admin — login stays open, everything else requires a signed-in admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <ProtectedRoute>
                <AdminProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedRoute>
                <AdminProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute>
                <AdminCustomers />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

// Simple inline 404 — replace with a styled page later if you want one to match the site design.
function NotFound() {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>404 — Page Not Found</h1>
      <p style={{ color: '#6E6A5F' }}>
        The page you're looking for doesn't exist. <a href="/">Go back home</a>.
      </p>
    </div>
  );
}
