import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const FloatingNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 1. Ẩn hoàn toàn cụm nút nổi nếu đang ở trang Chi tiết Sản phẩm
  if (currentPath.startsWith('/product')) {
    return null;
  }

  // 2. Logic CSS: Hàm kiểm tra xem nút có đang là trang hiện tại không
  const getBtnStyle = (path) => {
    return currentPath === path 
      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110 cursor-default'
      : 'bg-slate-800 border-slate-600 text-slate-300 shadow-xl hover:bg-slate-700 hover:scale-110 hover:text-white cursor-pointer';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      
      {/* NÚT TRANG CHỦ */}
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

      {/* NÚT THỐNG KÊ */}
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

      {/* NÚT ADMIN */}
      <Link 
        to="/admin" 
        onClick={(e) => currentPath === '/admin' && e.preventDefault()}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/admin')}`} 
      >
        ⚙️
        <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Quản trị viên
        </span>
      </Link>

    </div>
  );
};

export default FloatingNav;