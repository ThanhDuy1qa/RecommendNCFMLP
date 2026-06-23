import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout components
import Header from './components/Header';
import Footer from './components/Footer';

// Route guards
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import UserReviews from './pages/UserReviews';
import SmartCatalog from './pages/SmartCatalog';
import TrendCollection from './pages/TrendCollection';
import VerifyEmail from './pages/VerifyEmail';
import Register from './pages/Register';
import VerifyAccount from './pages/VerifyAccount';
import Onboarding from './pages/Onboarding';

// Seller pages
import MyProducts from './pages/MyProducts';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import SellerOrders from './pages/SellerOrders';
import InventoryAdvisor from './pages/InventoryAdvisor';
import SellerDashboard from './pages/SellerDashboard';
import TargetedMarketing from './pages/TargetedMarketing';
import SellerFinance from './pages/SellerFinance';
// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import ManageAllProducts from './pages/ManageAllProducts';
import ManageCategories from './pages/ManageCategories';
import AdminOrders from './pages/AdminOrders';
import AdminAiAnalytics from './pages/AdminAiAnalytics';
import CustomerInsight from './pages/CustomerInsight';
import ManageUsers from './pages/ManageUsers';
import Stats from './pages/Stats';
import FinanceManagement from './pages/FinanceManagement';

const App = () => {
  return (
    // 1. ROUTER PHẢI NẰM NGOÀI CÙNG NHẤT
    <Router>
      {/* 2. CÁC PROVIDER NẰM BÊN TRONG ĐỂ ĐƯỢC XÀI LỆNH NAVIGATE */}
      <AuthProvider>
        <CartProvider>
          {/* ĐÃ SỬA: Đổi bg-slate-900 thành bg-sky-50 để đồng bộ Light Theme */}
          <div className="bg-sky-50 min-h-screen flex flex-col relative">
            <Header /> 
            
            <main className="flex-grow">
              <Routes>
                {/* =========================================
                    KHU VỰC PUBLIC (AI CŨNG XEM ĐƯỢC)
                    ========================================= */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/product/:asin" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/discover" element={<SmartCatalog />} />
                <Route path="/collection/:type" element={<TrendCollection />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-account" element={<VerifyAccount />} />
                <Route path="/onboarding" element={<Onboarding />} />
                {/* =========================================
                    KHU VỰC DÀNH CHO USER ĐÃ ĐĂNG NHẬP (Role 0, 1, 2)
                    ========================================= */}
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

                
                {/* =========================================
                    KHU VỰC DÀNH RIÊNG CHO SELLER (Role 1) & ADMIN (Role 2)
                    ========================================= */}
                <Route path="/seller/dashboard" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <SellerDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/seller/my-products" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <MyProducts />
                  </ProtectedRoute>
                } />
                
                <Route path="/seller/add-product" element={
                  <ProtectedRoute allowedRoles={[1]}>
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
                
                <Route path="/seller/marketing-targets" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <TargetedMarketing />
                  </ProtectedRoute>
                } />

                <Route path="/seller/finance" element={
                  <ProtectedRoute allowedRoles={[1, 2]}>
                    <SellerFinance />
                  </ProtectedRoute>
                } />

                {/* =========================================
                    KHU VỰC TỐI CAO CHỈ DÀNH CHO ADMIN (Role 2) 
                    ========================================= */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/add-product" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <AddProduct />
                  </ProtectedRoute>
                } />
                <Route path="/admin/edit-product/:id" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <EditProduct />
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

                <Route path="/admin/customer-insight" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <CustomerInsight />
                  </ProtectedRoute>
                } />

                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <ManageUsers />
                  </ProtectedRoute>
                } />

                <Route path="/admin/finance" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <FinanceManagement />
                  </ProtectedRoute>
                } />
  
              </Routes>
            </main>

            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;