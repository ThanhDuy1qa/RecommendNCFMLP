import React, { useState, useEffect, useRef } from 'react';

const Admin = () => {
  const [userInput, setUserInput] = useState("");
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // State cho Gợi ý
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // 1. GỌI API GỢI Ý NGƯỜI DÙNG (Debounce 150ms)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (userInput.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/reviews/suggest?q=${encodeURIComponent(userInput)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Lỗi load gợi ý user:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [userInput]);

  // Đóng khung gợi ý khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. HÀM TÌM KIẾM CHÍNH THỨC
  const executeSearch = async (keyword) => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setShowSuggestions(false); // Ẩn gợi ý khi đang tìm
    
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/user/${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setUserHistory(data);
    } catch (err) {
      console.error("Lỗi tìm người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(userInput);
  };

  // 3. KHI CLICK VÀO GỢI Ý -> TỰ ĐỘNG TÌM BẰNG ID ĐỂ CHÍNH XÁC 100%
  const handleSuggestionClick = (reviewerID) => {
    setUserInput(reviewerID); // Tự động điền ID vào ô input cho chuẩn
    executeSearch(reviewerID);
  };

  const handleGetRecommendations = () => {
    alert(`Đang gửi ID [${userInput}] sang Server Python AI... (Chờ tích hợp)`);
  };

  return (
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-bold mb-8 text-blue-400 border-b border-slate-700 pb-4">
          Bảng Điều Khiển Quản Trị Hệ Thống (Admin)
        </h1>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Tra cứu Hồ sơ Khách hàng</h2>
          
          {/* Bọc form trong div relative để khung xổ xuống không bị xô lệch */}
          <div ref={wrapperRef} className="relative">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Nhập tên khách hàng (VD: John) hoặc Reviewer ID..."
                className="flex-grow bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition-all"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-lg font-bold transition-colors whitespace-nowrap"
              >
                Tìm Hồ Sơ
              </button>
            </form>

            {/* KHUNG GỢI Ý NGƯỜI DÙNG */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 sm:right-[130px] mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50">
                {suggestions.map((user, index) => (
                  <div 
                    key={`${user.reviewerID}-${index}`} 
                    onClick={() => handleSuggestionClick(user.reviewerID)}
                    className="flex flex-col p-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <span className="text-sm text-slate-200 font-bold">{user.reviewerName || "Khách hàng ẩn danh"}</span>
                    <span className="text-xs text-blue-400">ID: {user.reviewerID}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ... (Phần hiển thị kết quả userHistory giữ nguyên hoàn toàn) ... */}
        {searched && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
                <span>Lịch sử Tương tác (Reviews)</span>
                <span className="text-sm bg-slate-700 px-3 py-1 rounded-full">{userHistory.length} bản ghi</span>
              </h2>
              
              {loading ? (
                <div className="text-center py-10 text-blue-400 animate-pulse">Đang truy xuất dữ liệu...</div>
              ) : userHistory.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {userHistory.map((review, idx) => (
                    <div key={idx} className="bg-slate-900 p-4 rounded border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-yellow-400 font-bold">⭐ {review.overall} / 5</span>
                        <span className="text-xs text-slate-500">{review.reviewTime || "N/A"}</span>
                      </div>
                      <p className="text-xs text-blue-300 mb-2">ASIN Sản phẩm: {review.asin}</p>
                      <p className="text-sm text-slate-300 font-semibold mb-1">"{review.summary}"</p>
                      <p className="text-xs text-slate-400 line-clamp-3">{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">Không tìm thấy dữ liệu tương tác của người dùng này.</div>
              )}
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-blue-900 shadow-[0_0_20px_rgba(30,58,138,0.3)]">
              <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                <span>🤖 Kết Quả Gợi Ý Phân Tích (AI)</span>
              </h2>
              
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 text-center h-[500px] flex flex-col items-center justify-center">
                <p className="text-slate-400 mb-6 max-w-sm">
                  Khu vực này sẽ nhận dữ liệu từ Model Machine Learning (Python). Hệ thống sẽ phân tích lịch sử bên trái để đưa ra Top 5 sản phẩm khách hàng này có khả năng mua cao nhất.
                </p>
                <button 
                  onClick={handleGetRecommendations}
                  disabled={userHistory.length === 0}
                  className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg 
                    ${userHistory.length > 0 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-blue-500/50' 
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                  ⚡ Chạy Thuật Toán Gợi Ý
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;