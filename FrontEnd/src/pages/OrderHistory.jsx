import React from 'react';
import { Link } from 'react-router-dom';
import { useOrderHistory } from '../hooks/useOrderHistory';

const OrderHistory = () => {
  const {
    orders,
    myReviews,
    loading,
    showModal, setShowModal,
    isReadOnly, setIsReadOnly,
    isEditingExisting,
    reviewData, setReviewData,
    openReviewModal,
    handleFormSubmit
  } = useOrderHistory();

  if (loading) return (
    <div className="bg-sky-200 min-h-screen flex items-center justify-center text-sky-800 font-bold">
      <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mr-3"></div>
      Đang tải dữ liệu...
    </div>
  );

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* THANH ĐIỀU HƯỚNG & TIÊU ĐỀ ĐÃ THÊM NÚT QUAY LẠI */}
        <div className="flex justify-between items-center mb-8 border-b border-sky-300 pb-4">
          <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
            <span className="bg-white p-2 rounded-xl shadow-sm">📦</span> Lịch Sử Mua Hàng
          </h1>
          <Link to="/profile" className="text-sm font-bold bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 rounded-xl border border-sky-300 transition-colors shadow-sm flex items-center gap-2 shrink-0">
            &larr; Quay lại Hồ sơ
          </Link>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-3xl border border-sky-200 shadow-sm font-medium text-slate-600">
            Bạn chưa có đơn hàng nào.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-3xl border border-sky-200 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <div className="text-sm text-sky-700 font-bold font-mono bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg">
                    Mã ĐH: #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </div>
                  <div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    order.status === 'Hoàn thành' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>{order.status}</div>
                </div>
                
                <div className="space-y-3">
                  {order.items.map(item => {
                    const existingReview = myReviews.find(r => r.asin === item.asin);

                    return (
                      <div key={item.asin} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-sky-50/50 p-4 rounded-2xl border border-sky-100 gap-4">
                        <div className="flex gap-4 items-center">
                          {/* 1. Bọc ảnh vào Link để click được */}
                          <Link to={`/product/${item.asin}`} className="shrink-0 block">
                            <img src={item.image} className="w-16 h-16 object-contain bg-white rounded-xl p-1 border border-slate-200 hover:border-sky-400 transition-colors" alt="" />
                          </Link>
                          
                          <div>
                            {/* 2. Đổi thẻ div của tiêu đề thành thẻ Link kèm hiệu ứng hover */}
                            <Link 
                              to={`/product/${item.asin}`} 
                              className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-sky-600 hover:underline transition-colors"
                            >
                              {item.title}
                            </Link>
                            <div className="text-xs text-slate-500 mt-1 font-medium">Số lượng: {item.quantity}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto gap-3">
                          <div className="font-black text-rose-600">${item.price.toFixed(2)}</div>
                          
                          {order.status === 'Hoàn thành' && (
                            existingReview ? (
                              <button 
                                onClick={() => openReviewModal(item.asin, item.title, existingReview)}
                                className="text-xs font-bold bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 px-4 py-2 rounded-xl transition-all shadow-sm whitespace-nowrap flex items-center gap-1"
                              >
                                📝 Xem đánh giá
                              </button>
                            ) : (
                              <button 
                                onClick={() => openReviewModal(item.asin, item.title, null)}
                                className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 px-4 py-2 rounded-xl transition-all shadow-sm whitespace-nowrap flex items-center gap-1"
                              >
                                ⭐ Đánh giá ngay
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end items-center mt-4 pt-4 border-t border-slate-100">
                  <span className="text-slate-500 text-sm font-medium">Tổng thanh toán: </span>
                  <span className="text-2xl font-black text-rose-600 ml-3">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====================================================
          MODAL ĐA NĂNG: XEM - VIẾT - SỬA ĐÁNH GIÁ
          ==================================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
              {isReadOnly ? "📝 Đánh giá của bạn" : (isEditingExisting ? "✏️ Chỉnh sửa đánh giá" : "⭐ Đánh giá sản phẩm")}
            </h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2 font-medium italic">"{reviewData.title}"</p>
            
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Sao chấm điểm */}
              <div>
                <label className="block text-sm text-slate-700 font-bold mb-2">Chất lượng sản phẩm</label>
                <div className="flex gap-2 justify-center bg-sky-50/80 py-3 rounded-2xl border border-sky-100">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      type="button" key={star} disabled={isReadOnly}
                      onClick={() => setReviewData({...reviewData, overall: star})}
                      className={`text-4xl transition-transform ${!isReadOnly && 'hover:scale-110'} ${
                        reviewData.overall >= star ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiêu đề ngắn */}
              <div>
                <label className="block text-sm text-slate-700 font-bold mb-1">Tiêu đề (Tóm tắt)</label>
                <input 
                  type="text" required readOnly={isReadOnly}
                  value={reviewData.summary}
                  onChange={e => setReviewData({...reviewData, summary: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 read-only:text-slate-500 read-only:bg-slate-50 read-only:border-slate-200 transition-all"
                />
              </div>

              {/* Nội dung chi tiết */}
              <div>
                <label className="block text-sm text-slate-700 font-bold mb-1">Chi tiết trải nghiệm</label>
                <textarea 
                  required rows="4" readOnly={isReadOnly}
                  value={reviewData.reviewText}
                  onChange={e => setReviewData({...reviewData, reviewText: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none read-only:text-slate-500 read-only:bg-slate-50 read-only:border-slate-200 transition-all"
                ></textarea>
              </div>

              {/* Nhóm Nút bấm Điều hướng */}
              <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-100">
                <div>
                  {/* NÚT SỬA */}
                  {isReadOnly && isEditingExisting && (
                    <button 
                      type="button"
                      onClick={() => setIsReadOnly(false)}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm text-amber-600 border border-amber-200 hover:bg-amber-50 transition-all flex items-center gap-1"
                    >
                      ⚙️ Sửa lại
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button" onClick={() => setShowModal(false)} 
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    {isReadOnly ? "Đóng" : "Hủy"}
                  </button>
                  
                  {/* Hiện nút gửi nếu không phải chế độ chỉ đọc */}
                  {!isReadOnly && (
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-500/30 transition-all"
                    >
                      {isEditingExisting ? "Cập Nhật" : "Gửi Đánh Giá"}
                    </button>
                  )}
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;