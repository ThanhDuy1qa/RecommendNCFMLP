import React, { useState } from 'react'; // Bổ sung useState
import { Link } from 'react-router-dom';
import { useUserReviews } from '../hooks/useUserReviews';
import ReviewModal from '../components/ReviewModal'; // IMPORT MODAL

const UserReviews = () => {
  const { reviews, loading, error } = useUserReviews();

  // THÊM CÁC BIẾN VÀ HÀM NÀY VÀO TRƯỚC HÀM renderStars
  const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });

  // Sửa lại hàm này trong UserReviews.jsx
  const handleReviewSubmit = async (formData, submitMode) => {
    // Dù ở trang Quản lý chỉ có chế độ Sửa (edit), ta vẫn truyền chuẩn form
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/reviews/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("✅ Đã cập nhật đánh giá!");
        setModalConfig({ isOpen: false, data: null });
        window.location.reload(); 
      } else { 
        const data = await res.json();
        alert("❌ Lỗi: " + data.message); 
      }
    } catch (e) { alert("❌ Lỗi kết nối!"); }
  };
  const handleDeleteReview = async (asin) => {
    if (!window.confirm("🗑 Bạn có chắc chắn muốn xóa bài đánh giá này không?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/delete/${asin}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("✅ Đã xóa đánh giá!");
        window.location.reload();
      } else { alert("❌ Không thể xóa!"); }
    } catch (e) { alert("❌ Lỗi kết nối!"); }
  };
  // Thuật toán vẽ số lượng sao vàng
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-amber-400 text-xl" : "text-slate-200 text-xl"}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-200 text-sky-800 flex flex-col justify-center items-center font-bold">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        Đang đồng bộ cấu trúc dữ liệu lịch sử tương tác...
      </div>
    );
  }

  return (
    <div className="bg-sky-200 min-h-screen p-6 md:p-10 text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* THANH ĐIỀU HƯỚNG TIÊU ĐỀ */}
        <div className="flex justify-between items-center mb-8 border-b border-sky-300 pb-4">
          <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
            <span className="bg-white p-2 rounded-xl shadow-sm">🕒</span> Lịch Sử Đánh Giá
          </h1>
          <Link to="/profile" className="text-sm font-bold bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 rounded-xl border border-sky-300 transition-colors shadow-sm flex items-center gap-2">
            &larr; Quay lại Hồ sơ
          </Link>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold">
            {error}
          </div>
        )}

        {/* DIỄN BIẾN GIAO DIỆN CHÍNH */}
        {reviews.length === 0 ? (
          <div className="bg-white border border-sky-200 rounded-3xl p-12 text-center shadow-sm">
            <span className="text-5xl block mb-4 animate-bounce">📬</span>
            <h2 className="text-xl font-black text-slate-800 mb-2">Chưa có tương tác nào</h2>
            <p className="text-slate-500 mb-6 font-medium">Hệ thống chưa ghi nhận bất kỳ đánh giá nào từ tài khoản của bạn.</p>
            <Link to="/" className="inline-block bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/30 active:scale-95">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((item, index) => (
              <div 
                key={item._id || index} 
                className="bg-white border border-sky-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-sky-400 transition-all group flex flex-col md:flex-row gap-6"
              >
                {/* KHUNG ẢNH SẢN PHẨM */}
                <div className="w-full md:w-32 h-32 shrink-0 bg-sky-50/50 rounded-2xl p-2 flex items-center justify-center overflow-hidden border border-sky-100">
                  <img 
                    src={item.productImage || 'https://via.placeholder.com/150?text=No+Image'} 
                    alt="Product Asset" 
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                  />
                </div>

                {/* THÔNG TIN CHI TIẾT */}
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                    <Link 
                      to={`/product/${item.asin}`} 
                      className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2"
                    >
                      {item.productTitle}
                    </Link>
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 shrink-0 mt-1 sm:mt-0">
                      ASIN: {item.asin}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex -mt-1">{renderStars(item.overall)}</div>
                    <span className="text-xs text-slate-500 font-medium">
                      📅 {item.reviewTime}
                    </span>
                    {item.verified && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>✓</span> Đã mua hàng
                      </span>
                    )}
                  </div>

                  {/* KHUNG NỘI DUNG ĐÁNH GIÁ */}
                  <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl">
                    <h4 className="text-sm font-black text-slate-700 mb-1">"{item.summary}"</h4>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      {item.reviewText}
                    </p>
                  </div>

                  {/* THÊM CỤM NÚT SỬA VÀ XÓA VÀO ĐÂY */}
                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setModalConfig({ isOpen: true, data: item })}
                      className="px-4 py-2 text-sm font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button 
                      onClick={() => handleDeleteReview(item.asin)}
                      className="px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                    >
                      🗑 Xóa
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ReviewModal 
        isOpen={modalConfig.isOpen}
        mode="edit" 
        initialData={modalConfig.data}
        onClose={() => setModalConfig({ isOpen: false, data: null })}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default UserReviews;