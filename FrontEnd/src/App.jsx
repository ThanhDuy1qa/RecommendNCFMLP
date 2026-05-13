import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
// Đã sửa import thành CustomerInsight thay vì Admin
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
const App = () => {
  return (
    <Router>
      <div className="bg-slate-900 min-h-screen flex flex-col relative">
        <Header /> 
        
        <main className="flex-grow">
          <Routes>
            {/* Các trang công khai */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product/:asin" element={<ProductDetail />} />
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

            {/* ====================================================
                KHU VỰC TỐI CAO CHỈ DÀNH CHO ADMIN (Role 2) 
                ==================================================== */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={[2]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* ĐÂY LÀ ROUTE MỚI CHO TRANG CUSTOMER INSIGHT BỊ THIẾU */}
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

            
          </Routes>
        </main>

        <Footer />
        <FloatingNav />
      </div>
    </Router>
  );
};

export default App;