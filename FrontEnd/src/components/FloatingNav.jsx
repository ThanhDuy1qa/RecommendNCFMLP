import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFloatingNav } from '../hooks/useFloatingNav'; 

const FloatingNav = () => {
  const { currentPath, isHidden, getBtnStyle } = useFloatingNav();
  
  // Trích xuất quyền hạn của user
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role);
    }
  }, []);

  if (isHidden) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      
      {/* 1. NÚT TRANG CHỦ: Ai cũng thấy */}
      <Link 
        to="/" 
        onClick={(e) => currentPath === '/' && e.preventDefault()}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/')}`} 
      >
        🏠
        <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Trang chủ
        </span>
      </Link>

      {/* 2. NÚT DÀNH CHO KHÁCH HÀNG (Role 0 hoặc chưa đăng nhập) */}
      {(role === 0 || role === null) && (
        <Link 
          to="/cart" 
          onClick={(e) => currentPath === '/cart' && e.preventDefault()}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/cart')}`} 
        >
          🛒
          <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Giỏ hàng
          </span>
        </Link>
      )}

      {/* 3. NÚT THÊM SẢN PHẨM: Dành cho Seller (1) và Admin (2) */}
      {(role === 1 || role === 2) && (
        <Link 
          to="/admin/add-product" 
          onClick={(e) => currentPath === '/admin/add-product' && e.preventDefault()}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/admin/add-product')}`} 
        >
          ➕
          <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Thêm sản phẩm
          </span>
        </Link>
      )}

      {/* Thêm nút Kho hàng cho Seller và Admin */}
      {(role === 1 || role === 2) && (
        <Link 
          to="/seller/my-products" 
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/seller/my-products')}`} 
        >
          📦
          <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Sản phẩm của tôi
          </span>
        </Link>
      )}
      
      {/* 4. CÁC NÚT RIÊNG CỦA ADMIN (Role 2) */}
      {role === 2 && (
        <>
          <Link 
            to="/stats" 
            onClick={(e) => currentPath === '/stats' && e.preventDefault()}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/stats')}`} 
          >
            📊
            <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Thống kê Data
            </span>
          </Link>

          {/* Nút Tra Cứu Khách Hàng (Customer Insight) */}
          <Link 
            to="/admin/customer-insight" 
            onClick={(e) => currentPath === '/admin/customer-insight' && e.preventDefault()}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/admin/customer-insight')}`} 
          >
            👥
            <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Insight Khách Hàng
            </span>
          </Link>

          <Link 
            to="/admin/dashboard" 
            onClick={(e) => currentPath === '/admin/dashboard' && e.preventDefault()}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/admin/dashboard')}`} 
          >
            ⚙️
            <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Bảng Điều Khiển
            </span>
          </Link>
        </>
      )}

    </div>
  );
};

export default FloatingNav;