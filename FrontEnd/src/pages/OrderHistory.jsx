import React from 'react';
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

  if (loading) return <div className="text-white text-center p-10 mt-20 font-bold animate-pulse">⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="bg-slate-900 min-h-screen p-4 md:p-8 text-slate-200">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-8 border-b border-slate-700 pb-4">📦 Lịch Sử Mua Hàng</h1>
        
        {orders.length === 0 ? (
          <div className="text-center bg-slate-800 p-10 rounded-xl border border-slate-700">Bạn chưa có đơn hàng nào.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                
                <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
                  <div className="text-sm text-slate-400 font-mono bg-slate-900 px-3 py-1 rounded">
                    Mã ĐH: #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </div>
                  <div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    order.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                  }`}>{order.status}</div>
                </div>
                
                <div className="space-y-3">
                  {order.items.map(item => {
                    const existingReview = myReviews.find(r => r.asin === item.asin);

                    return (
                      <div key={item.asin} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 gap-4">
                        <div className="flex gap-4 items-center">
                          <img src={item.image} className="w-16 h-16 object-contain bg-white rounded-lg p-1 shrink-0" alt="" />
                          <div>
                            <div className="text-sm font-bold text-slate-200 line-clamp-2">{item.title}</div>
                            <div className="text-xs text-slate-400 mt-1">Số lượng: {item.quantity}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto gap-3">
                          <div className="font-bold text-green-400">${item.price.toFixed(2)}</div>
                          
                          {order.status === 'Hoàn thành' && (
                            existingReview ? (
                              <button 
                                onClick={() => openReviewModal(item.asin, item.title, existingReview)}
                                className="text-xs font-bold bg-blue-500/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/50 px-4 py-2 rounded-lg transition-all shadow-md whitespace-nowrap"
                              >
                                📝 Xem đánh giá
                              </button>
                            ) : (
                              <button 
                                onClick={() => openReviewModal(item.asin, item.title, null)}
                                className="text-xs font-bold bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-slate-900 border border-yellow-500/50 px-4 py-2 rounded-lg transition-all shadow-md whitespace-nowrap"
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

                <div className="text-right mt-4 pt-4 border-t border-slate-700">
                  <span className="text-slate-400 text-sm">Tổng thanh toán: </span>
                  <span className="text-2xl font-bold text-green-400 ml-2">${order.totalAmount.toFixed(2)}</span>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-600 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">
              {isReadOnly ? "📝 Đánh giá của bạn" : (isEditingExisting ? "✏️ Chỉnh sửa đánh giá" : "⭐ Đánh giá sản phẩm")}
            </h3>
            <p className="text-sm text-blue-300 mb-6 line-clamp-2 italic">"{reviewData.title}"</p>
            
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Sao chấm điểm */}
              <div>
                <label className="block text-sm text-slate-300 font-semibold mb-2">Chất lượng sản phẩm</label>
                <div className="flex gap-2 justify-center bg-slate-900/50 py-3 rounded-xl border border-slate-700">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      type="button" key={star} disabled={isReadOnly}
                      onClick={() => setReviewData({...reviewData, overall: star})}
                      className={`text-4xl transition-transform ${!isReadOnly && 'hover:scale-110'} ${
                        reviewData.overall >= star ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiêu đề ngắn */}
              <div>
                <label className="block text-sm text-slate-300 font-semibold mb-1">Tiêu đề (Tóm tắt)</label>
                <input 
                  type="text" required readOnly={isReadOnly}
                  value={reviewData.summary}
                  onChange={e => setReviewData({...reviewData, summary: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-blue-500 read-only:text-slate-400 read-only:bg-slate-900/40"
                />
              </div>

              {/* Nội dung chi tiết */}
              <div>
                <label className="block text-sm text-slate-300 font-semibold mb-1">Chi tiết trải nghiệm</label>
                <textarea 
                  required rows="4" readOnly={isReadOnly}
                  value={reviewData.reviewText}
                  onChange={e => setReviewData({...reviewData, reviewText: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-blue-500 resize-none read-only:text-slate-400 read-only:bg-slate-900/40"
                ></textarea>
              </div>

              {/* Nhóm Nút bấm Điều hướng */}
              <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-700">
                <div>
                  {/* NÚT SỬA: Chỉ xuất hiện khi đang ở chế độ xem và bài đánh giá đã có sẵn */}
                  {isReadOnly && isEditingExisting && (
                    <button 
                      type="button"
                      onClick={() => setIsReadOnly(false)} // Bấm vào để mở khóa ô nhập liệu
                      className="px-4 py-2 rounded-lg font-bold text-sm text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500 hover:text-slate-900 transition-all"
                    >
                      ⚙️ Chỉnh sửa bản đánh giá
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button" onClick={() => setShowModal(false)} 
                    className="px-5 py-2.5 rounded-lg font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    {isReadOnly ? "Đóng" : "Hủy"}
                  </button>
                  
                  {/* Hiện nút gửi nếu không phải chế độ chỉ đọc */}
                  {!isReadOnly && (
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg transition-all"
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