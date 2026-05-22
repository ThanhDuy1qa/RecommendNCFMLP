import React from 'react';
import { Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useHeader } from '../hooks/useHeader';
// 1. IMPORT HOOK GIỎ HÀNG
import { useCart } from '../hooks/useCart';

const Header = () => {
  // Lấy toàn bộ bộ não Tìm kiếm + Đăng nhập
  const {
    searchInput, setSearchInput,
    suggestions, showSuggestions, setShowSuggestions,
    wrapperRef, handleSearchSubmit, handleSuggestionClick,
    loggedInUser, handleAuthAction
  } = useHeader();

  // 2. LẤY DỮ LIỆU TỪ GIỎ HÀNG
  const { cartItems } = useCart();

  return (
    <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-white whitespace-nowrap hover:text-blue-400 transition-colors">
          Kho Điện Tử
        </Link>
        
        {/* THANH TÌM KIẾM */}
        <div ref={wrapperRef} className="relative w-full md:w-1/2">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên sách, sản phẩm, mã ASIN..."
              className="w-full bg-slate-800 text-white text-sm border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
            >
              Tìm kiếm
            </button>
          </form>

          {/* BOX GỢI Ý TÌM KIẾM */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-[90px] mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50">
              {suggestions.map((item, index) => (
                <div 
                  key={`${item.asin}-${index}`} 
                  onClick={() => handleSuggestionClick(item.asin)}
                  className="flex items-center gap-3 p-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-white rounded flex items-center justify-center p-1">
                    <img 
                      src={item.image || defaultIcon} 
                      alt={item.title} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { e.target.src = defaultIcon; }}
                    />
                  </div>
                  <div className="text-sm text-slate-200 line-clamp-2 leading-tight">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NHÓM NÚT BÊN PHẢI (GIỎ HÀNG + ĐĂNG NHẬP) */}
        <div className="flex items-center gap-6">
          
          {/* KHU VỰC ĐĂNG NHẬP / HỒ SƠ / ĐĂNG XUẤT */}
          {loggedInUser ? (
            <div className="flex items-center gap-3">
              {/* Nút vào trang Hồ Sơ Cá Nhân */}
              <Link 
                to="/profile"
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors border border-transparent hover:border-blue-500/50 px-3 py-1.5 rounded-lg"
                title="Quản lý hồ sơ"
              >
                👋 Xin chào, {loggedInUser.name || loggedInUser.username}
              </Link>

              {/* Nút Đăng Xuất */}
              <button 
                onClick={handleAuthAction}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-md"
                title="Đăng xuất"
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            /* Nút Đăng Nhập (Khi chưa login) */
            <button 
              onClick={handleAuthAction}
              className="bg-blue-600 text-white border-blue-600 hover:bg-blue-500 text-sm font-semibold whitespace-nowrap px-4 py-2 rounded-lg border transition-all shadow-md"
            >
              👤 Đăng Nhập
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default Header;