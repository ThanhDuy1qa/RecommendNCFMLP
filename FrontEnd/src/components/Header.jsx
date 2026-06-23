import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useHeader } from '../hooks/useHeader';
import { useCart } from '../hooks/useCart';
import DepositModal from '../components/DepositModal';

const Header = () => {
  const {
    searchInput, setSearchInput,
    suggestions, showSuggestions, setShowSuggestions,
    wrapperRef, handleSearchSubmit, handleSuggestionClick,
    loggedInUser, handleAuthAction
  } = useHeader();

  const { cartItems } = useCart();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [liveBalance, setLiveBalance] = useState(loggedInUser?.walletBalance || 0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && loggedInUser && (loggedInUser.role === 1 || loggedInUser.role === 2)) {
      const fetchPendingOrders = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/orders/pending-count', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) setPendingCount(data.count);
        } catch (error) { console.error(error); }
      };
      
      fetchPendingOrders();
      const interval = setInterval(fetchPendingOrders, 30000);
      return () => clearInterval(interval); 
    } else {
      setPendingCount(0); 
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser) {
      setLiveBalance(loggedInUser.walletBalance || 0); // Lấy số dư lúc mới login

      const fetchBalance = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5000/api/users/wallet-balance', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setLiveBalance(data.balance); // Cập nhật số dư mới nhất
          }
        } catch (error) { console.error("Lỗi cập nhật ví"); }
      };
      fetchBalance();
      // Hỏi thăm backend mỗi 3 giây
      const interval = setInterval(fetchBalance, 3000);
      return () => clearInterval(interval);
    }
  }, [loggedInUser]);

  return (
    <>
      {/* 🌟 ĐÃ CẬP NHẬT: THÊM THẺ KẾT THÚC HEADER Ở ĐÂY ĐỂ TÁCH MODAL RA KHỎI HEADER */}
      <div className="bg-white/95 backdrop-blur-md border-b border-sky-200 sticky top-0 z-50 shadow-sm flex flex-col">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 w-full relative z-50">
          
          <Link to="/" className="text-2xl font-black text-sky-700 flex items-center gap-2 hover:scale-105 transition-transform shrink-0">
            <span className="text-2xl">🛍️</span> Kho Điện Tử
          </Link>
          
          <div ref={wrapperRef} className="relative w-full md:w-1/2">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm sản phẩm..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-5 py-2.5 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all shadow-sm text-slate-700 bg-sky-50/50"
              />
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                Tìm kiếm
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-[999] w-full bg-white border border-sky-100 rounded-xl mt-2 shadow-xl overflow-hidden">
                {suggestions.map((product) => (
                  <li 
                    key={product.asin} 
                    onClick={() => handleSuggestionClick(product.asin)}
                    className="px-4 py-3 hover:bg-sky-50 cursor-pointer transition-colors border-b border-sky-50 last:border-0 flex items-center gap-3"
                  >
                    <img 
                      src={product.image || defaultIcon} 
                      alt={product.title} 
                      className="w-10 h-10 object-cover rounded-md border border-slate-200 bg-white"
                    />
                    <span className="text-sm font-medium text-slate-700 line-clamp-1">{product.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            
            {/* 🌟 ĐÃ THÊM ĐIỀU KIỆN: CHỈ ROLE 0 (KHÁCH HÀNG) HOẶC CHƯA ĐĂNG NHẬP MỚI THẤY GIỎ HÀNG */}
            {(!loggedInUser || loggedInUser.role === 0) && (
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-sky-600 transition-colors">
                <span className="text-2xl">🛒</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border-2 border-white">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}

            {loggedInUser ? (
              <div className="flex items-center gap-3">
                
                {/* 🌟 ĐÃ THÊM ĐIỀU KIỆN: CHỈ HIỂN THỊ VÍ NẾU KHÔNG PHẢI LÀ ADMIN (ROLE KHÁC 2) */}
                {loggedInUser.role !== 2 && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 pl-3 pr-1 py-1 rounded-lg">
                    <span className="text-sm font-black text-emerald-700">
                      {liveBalance.toLocaleString('vi-VN')} đ
                    </span>
                    <button 
                      onClick={() => setIsDepositOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm transition-all"
                      title="Nạp thêm tiền"
                    >
                      Nạp +
                    </button>
                  </div>
                )}

                <Link
                  to="/order-history"
                  className="text-sm font-semibold text-slate-700 hover:text-sky-700 transition-colors border border-transparent hover:border-sky-200 bg-slate-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg"
                  title="Lịch sử mua hàng"
                >
                  🧾 Đơn mua
                </Link>
                
                <Link 
                  to="/profile"
                  className="text-sm font-semibold text-slate-700 hover:text-sky-700 transition-colors border border-transparent hover:border-sky-200 bg-slate-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg"
                  title="Quản lý hồ sơ"
                >
                  👋 Chào, {loggedInUser.name || loggedInUser.username}
                </Link>
                <button 
                  onClick={handleAuthAction}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  Đăng Xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAuthAction}
                className="bg-sky-600 text-white hover:bg-sky-700 text-sm font-bold py-2 px-5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Đăng Nhập
              </button>
            )}
          </div>
        </div>

        {loggedInUser && (loggedInUser.role === 1 || loggedInUser.role === 2) && (
          <div className="bg-slate-800 text-slate-300 w-full relative z-40 border-t border-slate-700 shadow-inner">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex items-center justify-end gap-6 text-sm font-medium overflow-x-auto">
              
              <Link 
                to={loggedInUser.role === 2 ? "/admin/dashboard" : "/seller/dashboard"} 
                className="text-slate-400 mr-auto flex items-center gap-2 hover:text-sky-400 transition-colors duration-200 whitespace-nowrap font-bold"
              >
                <span>🛡️</span> 
                {loggedInUser.role === 2 ? 'Bảng điều khiển Admin' : 'Kênh Người Bán'}
              </Link>

              {loggedInUser.role === 1 && (
                <>
                  <Link to="/seller/my-products" className="hover:text-sky-400 transition-colors whitespace-nowrap">
                    📦 Sản phẩm của tôi
                  </Link>
                  <Link to="/seller/add-product" className="hover:text-sky-400 transition-colors whitespace-nowrap">
                    ➕ Thêm sản phẩm
                  </Link>
                  <Link to="/seller/finance" className="hover:text-sky-400 transition-colors whitespace-nowrap font-bold text-emerald-400">
                    💰 Doanh thu
                  </Link>
                  <Link to="/seller/orders" className="hover:text-sky-400 transition-colors flex items-center gap-1 whitespace-nowrap">
                    📋 Đơn hàng
                    {pendingCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {loggedInUser.role === 2 && (
                <>
                  <Link to="/admin/manage-products" className="hover:text-sky-400 transition-colors whitespace-nowrap">
                    📦 Quản lý Sản phẩm
                  </Link>
                  <Link to="/admin/categories" className="hover:text-sky-400 transition-colors whitespace-nowrap">
                    🗂️ Quản lý danh mục
                  </Link>
                  <Link to="/admin/users" className="hover:text-sky-400 transition-colors whitespace-nowrap">
                    👥 Người dùng
                  </Link>
                  <Link to="/admin/finance" className="hover:text-sky-400 transition-colors whitespace-nowrap font-bold text-amber-400">
                    💰 Tài chính
                  </Link>
                  <Link to="/admin/orders" className="hover:text-sky-400 transition-colors flex items-center gap-1 whitespace-nowrap">
                    📋 Đơn hàng
                    {pendingCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

            </div>
          </div>
        )}
      </div>

      {/* 🌟 ĐÃ CẬP NHẬT: CHUYỂN MODAL RA HẲN NGOÀI CÙNG, BÊN DƯỚI THẺ DIV CỦA HEADER */}
      <div className="relative z-[9999]">
        <DepositModal 
          isOpen={isDepositOpen} 
          onClose={() => setIsDepositOpen(false)} 
          user={loggedInUser} 
        />
      </div>
    </>
  );
};

export default Header;