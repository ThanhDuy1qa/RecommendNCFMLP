import React from 'react';
import { Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useHeader } from '../hooks/useHeader'; // Kéo Não bộ vào

const Header = () => {
  const {
    searchInput, setSearchInput,
    suggestions, showSuggestions, setShowSuggestions,
    currentUser, wrapperRef,
    handleLoginLogout, handleSearchSubmit, handleSuggestionClick
  } = useHeader();

  return (
    <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <Link to="/" className="text-2xl font-bold text-white whitespace-nowrap hover:text-blue-400 transition-colors">
          Kho Điện Tử
        </Link>
        
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

        <button 
          onClick={handleLoginLogout}
          className="text-sm font-semibold whitespace-nowrap bg-slate-800 text-slate-300 px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-400 hover:text-blue-400 transition-all shadow-md"
        >
          {currentUser ? `👋 Xin chào, ${currentUser.name}` : "👤 Nhập ID Khách hàng"}
        </button>

      </div>
    </div>
  );
};

export default Header;