import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFloatingNav } from '../hooks/useFloatingNav'; 

const FloatingNav = () => {
  const { currentPath, isHidden, getBtnStyle } = useFloatingNav();
  const [role, setRole] = useState(null);
  
  // STATE MỚI: Lưu số lượng đơn hàng chờ
  const [pendingCount, setPendingCount] = useState(0);

  // 🛠️ FIX 1: Lắng nghe sự thay đổi tài khoản mỗi khi chuyển trang (Login / Logout)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role);
    } else {
      setRole(null); // BẮT BUỘC: Reset về null khi đăng xuất
    }
  }, [currentPath]); // <-- Mấu chốt: Cứ chuyển link là check lại quyền

  // 🛠️ FIX 2: Tách riêng bộ đếm API để chạy ổn định, chỉ kích hoạt nếu đúng Role
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // KỸ THUẬT POLLING: Chỉ đếm đơn hàng nếu là Seller(1) hoặc Admin(2)
    if (token && (role === 1 || role === 2)) {
      const fetchPendingOrders = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/orders/pending-count', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) setPendingCount(data.count);
        } catch (error) { console.error(error); }
      };

      // Gọi ngay lần đầu
      fetchPendingOrders();

      // Cứ 30 giây lại gọi API 1 lần ngầm bên dưới
      const interval = setInterval(fetchPendingOrders, 30000);
      return () => clearInterval(interval); // Dọn dẹp bộ đếm khi đăng xuất
    } else {
      setPendingCount(0); // Reset số đếm đỏ về 0 nếu là tài khoản Khách
    }
  }, [role]); // <-- Chạy lại bộ đếm bất cứ khi nào Role thay đổi

  // 🛠️ FIX 3: Chặn hiển thị hoàn toàn ở trang /login
  if (isHidden || currentPath === '/login') return null;

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

      {/* 2. NÚT GIỎ HÀNG: Ai cũng thấy */}
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

      {/* 3. NÚT LỊCH SỬ MUA HÀNG: Hiển thị khi đã đăng nhập */}
      {role !== null && (
        <Link 
          to="/order-history" 
          onClick={(e) => currentPath === '/order-history' && e.preventDefault()}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/order-history')}`} 
        >
          🧾
          <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Lịch sử mua hàng
          </span>
        </Link>
      )}

      {/* 4. NÚT QUẢN LÝ ĐƠN HÀNG (CÓ CHỨA THÔNG BÁO) - Dành cho Seller/Admin */}
      {(role === 1 || role === 2) && (
        <Link 
          to={role === 2 ? "/admin/orders" : "/seller/orders"} 
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle(role === 2 ? '/admin/orders' : '/seller/orders')}`} 
        >
          📋
          {/* CỤC BADGE MÀU ĐỎ THẦN THÁNH NẰM Ở ĐÂY */}
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[12px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-bounce">
              {pendingCount}
            </span>
          )}
          <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Quản lý đơn hàng
          </span>
        </Link>
      )}

      {/* 5. NÚT THÊM SẢN PHẨM: Dành cho Seller (1) và Admin (2) */}
      {(role === 1) && (
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

      {/* 6. NÚT KHO HÀNG: Dành cho Seller (1) và Admin (2) */}
      {(role === 1) && (
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

      {/* 🌟 NÚT SELLER DASHBOARD: Dành riêng cho Seller (Role 1) */}
      {role === 1 && (
        <Link 
          to="/seller/dashboard" 
          onClick={(e) => currentPath === '/seller/dashboard' && e.preventDefault()}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/seller/dashboard')} shadow-[0_0_15px_rgba(16,185,129,0.5)]`} 
        >
          🏪
          <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Quản trị gian hàng & AI
          </span>
        </Link>
      )}

      {/* 7. CÁC NÚT RIÊNG CỦA ADMIN (Role 2) */}
      {role === 2 && (
        <Link 
          to="/admin/dashboard" 
          onClick={(e) => currentPath === '/admin/dashboard' && e.preventDefault()}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group relative border ${getBtnStyle('/admin/dashboard')} shadow-[0_0_15px_rgba(59,130,246,0.5)]`} 
        >
          ⚙️
          <span className="absolute right-full mr-4 bg-slate-800 text-slate-200 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Bảng điều khiển Admin
          </span>
        </Link>
      )}
    </div>
  );
};

export default FloatingNav;