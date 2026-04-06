import { useLocation } from 'react-router-dom';

export const useFloatingNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 1. Kiểm tra xem có phải trang ẩn không
  const isHidden = currentPath.startsWith('/product');

  // 2. Logic tính toán CSS
  const getBtnStyle = (path) => {
    return currentPath === path 
      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110 cursor-default'
      : 'bg-slate-800 border-slate-600 text-slate-300 shadow-xl hover:bg-slate-700 hover:scale-110 hover:text-white cursor-pointer';
  };

  return { currentPath, isHidden, getBtnStyle };
};