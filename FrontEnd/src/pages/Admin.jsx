import React from 'react';
import { useAdminSearch } from '../hooks/useAdminSearch';

const Admin = () => {
  // Bốc toàn bộ "Não bộ" từ Hook ra để dùng
  const {
    userInput, setUserInput,
    userHistory, loadingSearch, searched,
    suggestions, showSuggestions, setShowSuggestions,
    wrapperRef, handleSearchSubmit, handleSuggestionClick, handleGetRecommendations
  } = useAdminSearch();

  return (
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-400 border-b border-slate-700 pb-4">
          Bảng Điều Khiển Quản Trị (Admin Dashboard)
        </h1>

        <h2 className="text-xl font-semibold mb-4 text-slate-200">🔍 Tra cứu Hồ sơ Khách hàng</h2>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8 shadow-lg">
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
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-lg font-bold transition-colors whitespace-nowrap">
                Tìm Hồ Sơ
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 sm:right-[130px] mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50">
                {suggestions.map((user, index) => (
                  <div key={`${user.reviewerID}-${index}`} onClick={() => handleSuggestionClick(user.reviewerID)} className="flex flex-col p-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors">
                    <span className="text-sm text-slate-200 font-bold">{user.reviewerName || "Khách hàng ẩn danh"}</span>
                    <span className="text-xs text-blue-400">ID: {user.reviewerID}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {searched && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
                <span>Lịch sử Tương tác</span>
                <span className="text-sm bg-slate-700 px-3 py-1 rounded-full">{userHistory.length} bản ghi</span>
              </h2>
              {loadingSearch ? (
                <div className="text-center py-10 text-blue-400 animate-pulse">Đang truy xuất dữ liệu...</div>
              ) : userHistory.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {userHistory.map((review, idx) => (
                    <div key={idx} className="bg-slate-900 p-4 rounded border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-yellow-400 font-bold">⭐ {review.overall} / 5</span>
                        <span className="text-xs text-slate-500">{review.reviewTime || "N/A"}</span>
                      </div>
                      <p className="text-xs text-blue-300 mb-2">ASIN: {review.asin}</p>
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