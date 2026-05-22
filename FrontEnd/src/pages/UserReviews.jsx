import React from 'react';
import { Link } from 'react-router-dom';
import { useUserReviews } from '../hooks/useUserReviews';

const UserReviews = () => {
  // Triệu hồi dữ liệu từ Hook tự động
  const { reviews, loading, error } = useUserReviews();

  // Thuật toán vẽ số lượng sao vàng
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400 text-xl" : "text-slate-600 text-xl"}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-blue-400 flex flex-col justify-center items-center font-bold">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        Đang đồng bộ cấu trúc dữ liệu lịch sử tương tác...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen p-6 md:p-10 text-slate-200">
      <div className="max-w-4xl mx-auto">
        
        {/* THANH ĐIỀU HƯỚNG TIÊU ĐỀ */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-400 flex items-center gap-3">
            <span>🕒</span> Lịch Sử Tương Tác Đánh Giá
          </h1>
          <Link to="/profile" className="text-sm bg-slate-800 hover:bg-slate-700 text-blue-400 px-4 py-2.5 rounded-xl border border-slate-700 transition-colors shadow-md">
            &larr; Quay lại Hồ sơ
          </Link>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 font-semibold">
            {error}
          </div>
        )}

        {/* DIỄN BIẾN GIAO DIỆN CHÍNH */}
        {reviews.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center shadow-xl">
            <span className="text-5xl block mb-4">📬</span>
            <h2 className="text-xl font-bold text-white mb-2">Chưa có tương tác nào</h2>
            <p className="text-slate-400 mb-6">Mạng Nơ-ron hệ thống chưa ghi nhận bất kỳ lịch sử dữ liệu đánh giá nào từ tài khoản của bạn.</p>
            <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20">
              Khám phá sản phẩm mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((item, index) => (
              <div 
                key={item._id || index} 
                className="bg-slate-800 border border-slate-700 rounded-2xl p-5 md:p-6 shadow-xl hover:border-blue-500/50 transition-all group flex flex-col md:flex-row gap-6"
              >
                {/* KHUNG ẢNH SẢN PHẨM */}
                <div className="w-full md:w-32 h-32 shrink-0 bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.productImage || 'https://via.placeholder.com/150?text=No+Image'} 
                    alt="Product Asset" 
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                  />
                </div>

                {/* THÔNG TIN CHI TIẾT */}
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                    <Link 
                      to={`/product/${item.asin}`} 
                      className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2"
                    >
                      {item.productTitle}
                    </Link>
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700 shrink-0">
                      ASIN: {item.asin}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex">{renderStars(item.overall)}</div>
                    <span className="text-xs text-slate-400 font-medium">
                      📅 {item.reviewTime}
                    </span>
                    {item.verified && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        ✓ Hệ thống xác thực đã mua
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-slate-300 mb-1">"{item.summary}"</h4>
                    <p className="text-sm text-slate-400 leading-relaxed italic">
                      {item.reviewText}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviews;