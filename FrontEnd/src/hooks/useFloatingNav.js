import { useLocation } from 'react-router-dom';
// Hook này dùng để điều khiển hiển thị và style của thanh điều hướng nổi (floating nav) dựa trên đường dẫn hiện tại. 
// Nếu đang ở trang chi tiết sản phẩm thì sẽ ẩn đi, còn lại sẽ hiển thị với style tương ứng với trang đang đứng.
export const useFloatingNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isHidden = currentPath.startsWith('/product');

  const getBtnStyle = (path) => {
    return currentPath === path 
      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110 cursor-default'
      : 'bg-slate-800 border-slate-600 text-slate-300 shadow-xl hover:bg-slate-700 hover:scale-110 hover:text-white cursor-pointer';
  };

  return { currentPath, isHidden, getBtnStyle };
};