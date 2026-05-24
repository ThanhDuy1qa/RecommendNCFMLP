import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CustomerInsight from './pages/CustomerInsight'; 
import Stats from './pages/Stats';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingNav from './components/FloatingNav'; 
import AddProduct from './pages/AddProduct';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MyProducts from './pages/MyProducts';
import EditProduct from './pages/EditProduct';
import ProtectedRoute from './components/ProtectedRoute';
import ManageAllProducts from './pages/ManageAllProducts';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import Checkout from './pages/Checkout';
import { AuthProvider } from './context/AuthContext'; 
import { CartProvider } from './context/CartContext';
import SellerOrders from './pages/SellerOrders';
import ManageCategories from './pages/ManageCategories';
import UserProfile from './pages/UserProfile';
import UserReviews from './pages/UserReviews';
import AdminOrders from './pages/AdminOrders';
import InventoryAdvisor from './pages/InventoryAdvisor';
import AdminAiAnalytics from './pages/AdminAiAnalytics';
import SmartCatalog from './pages/SmartCatalog';
import SellerDashboard from './pages/SellerDashboard';
const App = () => {
  return (
    // 1. ROUTER PHẢI NẰM NGOÀI CÙNG NHẤT
    <Router>
      {/* 2. CÁC PROVIDER NẰM BÊN TRONG ĐỂ ĐƯỢC XÀI LỆNH NAVIGATE */}
      <AuthProvider>
        <CartProvider>
          <div className="bg-slate-900 min-h-screen flex flex-col relative">
            <Header /> 
            
            <main className="flex-grow">
              <Routes>
                {/* Các trang công khai */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/product/:asin" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/discover" element={<SmartCatalog />} />
                
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={[0, 1, 2]}>
                    <UserProfile />
                  </ProtectedRoute>
                } />

                <Route path="/interaction-history" element={
                  <ProtectedRoute allowedRoles={[0, 1, 2]}>
                    <UserReviews />
                  </ProtectedRoute>
                } />
                {/* KHU VỰC DÀNH RIÊNG CHO SELLER (Role 1) VÀ ADMIN (Role 2) */}
                <Route path="/seller/my-products" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <MyProducts />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/add-product" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <AddProduct />
                  </ProtectedRoute>
                } />

                <Route path="/seller/edit-product/:id" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <EditProduct />
                  </ProtectedRoute>
                } />

                <Route path="/seller/orders" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <SellerOrders />
                  </ProtectedRoute>
                } />

                <Route path="/seller/import-advisor" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <InventoryAdvisor />
                  </ProtectedRoute>
                } />


                <Route path="/seller/dashboard" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <SellerDashboard />
                  </ProtectedRoute>
                } />
                {/* ====================================================
                    KHU VỰC TỐI CAO CHỈ DÀNH CHO ADMIN (Role 2) 
                    ==================================================== */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin/customer-insight" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <CustomerInsight />
                  </ProtectedRoute>
                } />

                <Route path="/admin/manage-products" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <ManageAllProducts />
                  </ProtectedRoute>
                } />

                <Route path="/stats" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <Stats /> 
                  </ProtectedRoute>
                } />

                <Route path="/admin/categories" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <ManageCategories />
                  </ProtectedRoute>
                } />

                <Route path="/admin/orders" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <AdminOrders />
                  </ProtectedRoute>
                } />

                <Route path="/admin/ai-analytics" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <AdminAiAnalytics />
                  </ProtectedRoute>
                } />
  
              </Routes>
            </main>

            <Footer />
            <FloatingNav />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;