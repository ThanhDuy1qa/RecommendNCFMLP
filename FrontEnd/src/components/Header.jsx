import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';

const Header = () => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const navigate = useNavigate();
  const wrapperRef = useRef(null); // Dùng để bắt sự kiện click ra ngoài để đóng khung gợi ý

  // 1. GỌI API GỢI Ý KHI GÕ CHỮ (Áp dụng Debounce 300ms)
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Chỉ tìm khi gõ từ 2 ký tự trở lên
      if (searchInput.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/products/suggest?q=${encodeURIComponent(searchInput)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Lỗi load gợi ý:", error);
      }
    };

    // Tạo bộ đếm thời gian: Chờ người dùng gõ xong 300ms mới gọi API để chống giật lag
    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  // 2. BẮT SỰ KIỆN CLICK RA NGOÀI ĐỂ ĐÓNG KHUNG
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. XỬ LÝ KHI BẤM NÚT "TÌM KIẾM" (Tìm chung chung)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") return;
    setShowSuggestions(false);
    navigate(`/?search=${encodeURIComponent(searchInput)}`);
  };

  // 4. XỬ LÝ KHI CLICK VÀO 1 SẢN PHẨM GỢI Ý CỤ THỂ
  const handleSuggestionClick = (asin) => {
    setShowSuggestions(false);
    setSearchInput(""); // Xóa thanh tìm kiếm cho gọn
    navigate(`/product/${asin}`); // Nhảy thẳng vào trang chi tiết
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <Link to="/" className="text-2xl font-bold text-white whitespace-nowrap hover:text-blue-400 transition-colors">
          Kho Điện Tử
        </Link>
        <Link to="/admin" className="text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-3 py-1.5 rounded border border-slate-600 hover:border-blue-400 hover:text-blue-400 transition-all">
            Quản Trị
          </Link>
        {/* Khu vực chứa Form và Khung xổ xuống */}
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

          {/* KHUNG HIỂN THỊ GỢI Ý XỔ XUỐNG */}
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

      </div>
    </div>
  );
};

export default Header;