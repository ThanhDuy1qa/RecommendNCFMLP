import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';

const Header = () => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // STATE MỚI: Lưu trữ thông tin người dùng đang đăng nhập
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // =========================================================
  // LOGIC ĐĂNG NHẬP (MOCK LOGIN) VÀ TÌM TÊN KHÁCH HÀNG
  // =========================================================
  useEffect(() => {
    // Kiểm tra xem trước đó đã đăng nhập chưa
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginLogout = async () => {
    if (currentUser) {
      // NẾU ĐÃ ĐĂNG NHẬP -> XỬ LÝ ĐĂNG XUẤT
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?")) {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        window.location.reload(); // Tải lại trang để xóa dữ liệu gợi ý AI
      }
    } else {
      // NẾU CHƯA ĐĂNG NHẬP -> XỬ LÝ ĐĂNG NHẬP
      const id = window.prompt("Vui lòng nhập Reviewer ID của bạn (VD: A192HO2ICJ75VU):");
      if (!id || !id.trim()) return;

      try {
        // Dùng API của trang Admin để tìm người dùng này
        const res = await fetch(`http://localhost:5000/api/reviews/user/${encodeURIComponent(id.trim())}`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          // Lấy tên thật từ bài đánh giá đầu tiên của họ
          const userName = data[0].reviewerName || "Khách hàng ẩn danh";
          const userObj = { id: id.trim(), name: userName };
          
          localStorage.setItem('currentUser', JSON.stringify(userObj));
          setCurrentUser(userObj);
          
          alert(`Đăng nhập thành công! Chào mừng ${userName} quay trở lại!`);
          window.location.reload(); // Tải lại trang để kích hoạt gọi thuật toán AI ở trang chủ
        } else {
          alert("Không tìm thấy khách hàng nào với ID này trong hệ thống!");
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi kết nối Server khi đăng nhập!");
      }
    }
  };

  // =========================================================
  // LOGIC TÌM KIẾM SẢN PHẨM (GIỮ NGUYÊN CỦA BẠN)
  // =========================================================
  useEffect(() => {
    const fetchSuggestions = async () => {
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

    const delayDebounceFn = setTimeout(() => fetchSuggestions(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") return;
    setShowSuggestions(false);
    navigate(`/?search=${encodeURIComponent(searchInput)}`);
  };

  const handleSuggestionClick = (asin) => {
    setShowSuggestions(false);
    setSearchInput(""); 
    navigate(`/product/${asin}`); 
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* LOGO TRANG CHỦ */}
        <Link to="/" className="text-2xl font-bold text-white whitespace-nowrap hover:text-blue-400 transition-colors">
          Kho Điện Tử
        </Link>
        
        {/* THANH TÌM KIẾM SẢN PHẨM */}
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

          {/* GỢI Ý TÌM KIẾM */}
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

        {/* NÚT ĐĂNG NHẬP / THÔNG TIN CÁ NHÂN */}
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