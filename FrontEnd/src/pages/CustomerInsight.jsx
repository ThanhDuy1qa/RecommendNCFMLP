import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerInsight } from '../hooks/useCustomerInsight';
import ProductCard from '../components/ProductCard';

const CustomerInsight = () => {
  const {
    userInput,
    setUserInput,

    userHistory,
    loadingSearch,
    searched,

    suggestions,
    showSuggestions,
    setShowSuggestions,

    wrapperRef,
    handleSearchSubmit,
    handleSuggestionClick,
    handleGetRecommendations,

    recommendations,
    loadingRecs
  } = useCustomerInsight();

  const location = useLocation();
  const navigate = useNavigate();

  const autoSearchId = location.state?.autoSearchId;
  const autoSearchName = location.state?.autoSearchName;

  const hasAutoSearchedRef = useRef(false);

  // =====================================================
  // NHẬN ID TỪ TRANG QUẢN LÝ USER VÀ ĐIỀN VÀO Ô TÌM KIẾM
  // =====================================================
  useEffect(() => {
    if (!autoSearchId) return;
    if (hasAutoSearchedRef.current) return;

    hasAutoSearchedRef.current = true;

    setUserInput(String(autoSearchId));
    setShowSuggestions(false);
  }, [autoSearchId, setUserInput, setShowSuggestions]);

  // =====================================================
  // SAU KHI userInput ĐÃ ĐƯỢC SET, TỰ GỌI TÌM HỒ SƠ
  // =====================================================
  useEffect(() => {
    if (!autoSearchId) return;
    if (!hasAutoSearchedRef.current) return;
    if (String(userInput) !== String(autoSearchId)) return;

    const timer = setTimeout(() => {
      handleSearchSubmit({
        preventDefault: () => {}
      });

      // Xóa state để tránh F5 hoặc quay lại làm tự search lại nhiều lần
      navigate('/admin/customer-insight', {
        replace: true,
        state: {}
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [autoSearchId, userInput, handleSearchSubmit, navigate]);

  return (
    // 🌟 ĐÃ SỬA: Đổi màu nền background thành dải màu gradient Sky
    <div className="bg-gradient-to-br from-sky-200 via-sky-100 to-sky-50 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER BAR & TÌM KIẾM */}
        <div className="bg-white/95 backdrop-blur rounded-3xl p-6 border border-sky-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            {/* 🌟 ĐÃ SỬA: Đổi màu chữ Header thành Sky */}
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
              <span className="bg-sky-100 p-2 rounded-xl shadow-sm text-2xl">🔍</span> Customer Insight & AI
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Tra cứu lịch sử và chạy mô hình dự đoán (Hybrid Recommendation) trực tiếp.
            </p>
          </div>

          <div className="relative w-full md:w-96" ref={wrapperRef}>
            <form onSubmit={handleSearchSubmit} className="flex shadow-sm rounded-xl">
              <input
                type="text"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Nhập ID User (VD: 0, 1, 2) hoặc User Name..."
                // 🌟 ĐÃ SỬA: Đổi màu viền Input khi focus sang Sky
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-l-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium"
              />
              <button
                type="submit"
                disabled={loadingSearch || !userInput}
                // 🌟 ĐÃ SỬA: Đổi màu nút bấm tra cứu
                className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-r-xl font-bold transition-colors disabled:bg-slate-300 shadow-sm"
              >
                {loadingSearch ? "..." : "Tra Cứu"}
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-sky-200 rounded-xl shadow-xl overflow-hidden z-50">
                {suggestions.map((user) => (
                  <div
                    key={user.reviewerID}
                    onClick={() => handleSuggestionClick(user)}
                    className="p-3 border-b border-sky-50 hover:bg-sky-50 cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-sky-800">ID: {user.user_id}</div>
                    <div className="text-sm text-slate-500">Name: {user.reviewerName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {searched && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* CỘT 1: LỊCH SỬ TƯƠNG TÁC (Input) */}
            <div className="bg-white rounded-3xl border border-sky-200 shadow-sm flex flex-col h-[70vh] overflow-hidden">
              <div className="p-5 border-b border-sky-100 bg-white flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span className="bg-sky-50 p-1.5 rounded-lg">📂</span> Dữ liệu Lịch sử (Dataset Input)
                </h2>
                <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                  {userHistory.length} items
                </span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                {userHistory.length > 0 ? (
                  <div className="space-y-3">
                    {userHistory.map((item, index) => (
                      <div key={index} className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-300 hover:shadow-md transition-all group">
                        <div className="w-16 h-16 bg-white rounded-xl p-1 border border-slate-100 shrink-0 flex items-center justify-center">
                          <img 
                            src={item.productImage || 'https://via.placeholder.com/150?text=No+Image'} 
                            alt="Product" 
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-800 line-clamp-1">{item.productTitle}</div>
                          <div className="text-xs text-slate-500 mt-1 font-mono">ASIN: {item.asin}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-amber-500 text-xs font-black bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">★ {item.overall}</span>
                            {item.verified && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold border border-emerald-200">Verified</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 italic font-medium">
                    User này chưa có lịch sử đánh giá sản phẩm nào.
                  </div>
                )}
              </div>
            </div>

            {/* CỘT 2: KẾT QUẢ AI DỰ ĐOÁN (Output) */}
            <div className="bg-white rounded-3xl border border-sky-200 shadow-sm flex flex-col h-[70vh] overflow-hidden">
              <div className="p-5 border-b border-sky-200 bg-sky-50 flex justify-between items-center">
                <h2 className="text-lg font-black text-sky-800 flex items-center gap-2">
                  <span className="bg-white p-1.5 rounded-lg shadow-sm">✨</span> AI Prediction (Output)
                </h2>
                {recommendations.length > 0 && (
                  <span className="bg-sky-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    Top {recommendations.length}
                  </span>
                )}
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-white relative">
                {loadingRecs ? (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    {/* 🌟 ĐÃ SỬA: Đổi màu vòng xoay Loading */}
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-sky-700 font-bold animate-pulse">Mô hình đang phân tích...</p>
                  </div>
                ) : null}

                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
                    {recommendations.map((prod, index) => (
                      <ProductCard
                        key={`admin-ai-${prod.asin}-${index}`}
                        product={prod}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 px-6">
                    <div className="text-6xl mb-4 opacity-50">🤖</div>
                    <p className="text-slate-500 mb-6 max-w-sm font-medium leading-relaxed">
                      Hệ thống sẽ phân tích dữ liệu lịch sử bên trái thông qua <strong className="text-sky-700">Hybrid Model</strong> để dự đoán Top sản phẩm phù hợp nhất với người dùng này.
                    </p>

                    <button
                      onClick={handleGetRecommendations}
                      disabled={userHistory.length === 0}
                      // 🌟 ĐÃ SỬA: Nút bấm chạy AI Prediction
                      className={`px-8 py-3.5 rounded-xl font-black transition-all shadow-md active:scale-95 ${
                        userHistory.length > 0
                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/30'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                      }`}
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

export default CustomerInsight;