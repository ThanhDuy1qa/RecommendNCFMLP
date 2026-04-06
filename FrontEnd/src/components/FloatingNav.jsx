import React from 'react';
import { Link } from 'react-router-dom';
import { useFloatingNav } from '../hooks/useFloatingNav'; // Kéo Não bộ vào

const FloatingNav = () => {
  const { currentPath, isHidden, getBtnStyle } = useFloatingNav();

  if (isHidden) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      
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