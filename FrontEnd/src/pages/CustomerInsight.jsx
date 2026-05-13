import React from 'react';
import { useCustomerInsight } from '../hooks/useCustomerInsight';
import ProductCard from '../components/ProductCard';

// Đổi tên component từ Admin -> CustomerInsight
const CustomerInsight = () => {
  const {
    userInput, setUserInput,
    userHistory, loadingSearch, searched,
    suggestions, showSuggestions, setShowSuggestions,
    wrapperRef, handleSearchSubmit, handleSuggestionClick, handleGetRecommendations,
    recommendations, loadingRecs
  } = useCustomerInsight();

  return (
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-400 border-b border-slate-700 pb-4">
          Insight Khách hàng
        </h1>

        <h2 className="text-xl font-semibold mb-4 text-slate-200">🔍 Tra cứu Hồ sơ Khách hàng</h2>
        
        {/* ... (Giữ nguyên toàn bộ phần JSX cũ của bạn ở giữa) ... */}
        {/* Mọi logic giao diện bên dưới không cần thay đổi gì cả */}
        
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
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col h-[650px]">
              <h2 className="text-xl font-semibold mb-4 flex justify-between items-center shrink-0">
                <span>Lịch sử Tương tác</span>
                <span className="text-sm bg-slate-700 px-3 py-1 rounded-full">{userHistory.length} bản ghi</span>
              </h2>
              
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {loadingSearch ? (
                  <div className="text-center py-10 text-blue-400 animate-pulse">Đang truy xuất dữ liệu...</div>
                ) : userHistory.length > 0 ? (
                  userHistory.map((review, idx) => (
                    <div key={idx} className="bg-slate-900 p-4 rounded border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-yellow-400 font-bold">⭐ {review.overall} / 5</span>
                        <span className="text-xs text-slate-500">{review.reviewTime || "N/A"}</span>
                      </div>
                      
                      <p className="text-sm text-blue-300 font-bold line-clamp-2 mb-1" title={review.productTitle}>
                        {review.productTitle}
                      </p>
                      
                      <p className="text-[10px] text-slate-500 mb-2">ASIN: {review.asin}</p>
                      <p className="text-sm text-slate-300 font-semibold mb-1">"{review.summary}"</p>
                      <p className="text-xs text-slate-400 line-clamp-3">{review.reviewText}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500">Không tìm thấy dữ liệu tương tác của người dùng này.</div>
                )}
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-blue-900 shadow-[0_0_20px_rgba(30,58,138,0.3)] flex flex-col h-[650px]">
              <h2 className="text-xl font-semibold mb-4 text-blue-400 flex justify-between items-center shrink-0">
                <span>🤖 Kết Quả Gợi Ý AI</span>
                {recommendations.length > 0 && (
                  <button 
                    onClick={handleGetRecommendations}
                    disabled={loadingRecs}
                    className="text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ⚡ Phân tích lại
                  </button>
                )}
              </h2>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex-grow overflow-y-auto custom-scrollbar">
                {loadingRecs ? (
                  <div className="h-full flex flex-col items-center justify-center text-blue-400 animate-pulse py-20">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    Đang chạy mạng Nơ-ron Nhân tạo...
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
                    {recommendations.map((prod, index) => (
                      <ProductCard key={`admin-ai-${prod.asin}-${index}`} product={prod} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <p className="text-slate-400 mb-6 max-w-sm">
                      Hệ thống sẽ phân tích dữ liệu lịch sử bên trái thông qua Hybrid Model (GMF + MLP + Attention) để dự đoán Top 9 sản phẩm phù hợp nhất.
                    </p>
                    <button 
                      onClick={handleGetRecommendations}
                      disabled={userHistory.length === 0}
                      className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg 
                        ${userHistory.length > 0 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-blue-500/50' 
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                    >
                      ⚡ Bắt đầu Phân tích
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Đổi export tương ứng
export default CustomerInsight;