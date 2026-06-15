import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrderHistory } from '../hooks/useOrderHistory';
import ReviewModal from '../components/ReviewModal';

const TABS = ['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

const OrderHistory = () => {
  const {
    orders, myReviews, loading, fetchAllData,
    activeTab, setActiveTab, search, setSearch, timeFilter, setTimeFilter, handleSearchSubmit, handleBuyAgain
  } = useOrderHistory();

  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'create', data: null });

 const handleReviewSubmit = async (formData, submitMode) => {
    const token = localStorage.getItem('token');
    const apiUrl = submitMode === 'edit' ? 'http://localhost:5000/api/reviews/update' : 'http://localhost:5000/api/reviews/add';
    const apiMethod = submitMode === 'edit' ? 'PUT' : 'POST';

    try {
      const res = await fetch(apiUrl, {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message);
        setModalConfig({ ...modalConfig, isOpen: false });
        if (fetchAllData) fetchAllData(); 
      } else { alert("❌ " + data.message); }
    } catch (error) { alert("❌ Lỗi kết nối!"); }
  };
  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
            <span className="bg-white p-2 rounded-xl shadow-sm">📦</span> Lịch Sử Mua Hàng
          </h1>
          <Link to="/profile" className="text-sm font-bold bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 rounded-xl border border-sky-300 transition-colors shadow-sm flex items-center gap-2 shrink-0">
            &larr; Quay lại
          </Link>
        </div>

        {/* 🌟 THANH TABS TRẠNG THÁI */}
        <div className="flex gap-2 overflow-x-auto mb-4 pb-2 custom-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${
                activeTab === tab 
                  ? 'bg-sky-600 text-white border border-sky-600' 
                  : 'bg-white text-slate-600 border border-sky-200 hover:bg-sky-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 🌟 THANH TÌM KIẾM VÀ LỌC THỜI GIAN */}
        <div className="bg-white p-4 rounded-3xl border border-sky-200 shadow-sm flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="relative flex-grow flex gap-2">
            <input 
              type="text" 
              placeholder="Bạn muốn tìm sản phẩm nào đã mua?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-800 outline-none focus:border-sky-500 shadow-sm"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1.5 bottom-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 rounded-lg font-bold text-sm transition-all active:scale-95"
            >
              Tìm
            </button>
          </form>

          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm text-slate-700 outline-none focus:border-sky-500 shadow-sm sm:w-48 cursor-pointer"
          >
            <option value="">🕒 Mọi lúc</option>
            <option value="30days">30 ngày qua</option>
            <option value="6months">6 tháng qua</option>
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
          </select>
        </div>
        
        {/* KHU VỰC HIỂN THỊ ĐƠN HÀNG */}
        {loading ? (
           <div className="bg-white p-12 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center justify-center text-sky-800 font-bold">
             <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></div>
             Đang tải dữ liệu...
           </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl border border-sky-200 shadow-sm">
             <span className="text-5xl block mb-4 opacity-50">📭</span>
             <p className="font-bold text-slate-600">Không tìm thấy đơn hàng nào phù hợp.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-3xl border border-sky-200 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-sky-700 font-bold font-mono bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg">
                      Mã: #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    order.status === 'Hoàn thành' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                      : order.status === 'Đã hủy'
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>{order.status}</div>
                </div>
                
                <div className="space-y-4">
                  {order.items.map(item => {
                    const existingReview = myReviews.find(r => r.asin === item.asin);

                    return (
                      <div key={item.asin} className="flex flex-col sm:flex-row justify-between items-start bg-sky-50/40 p-4 rounded-2xl border border-sky-100 gap-4">
                        
                        {/* CỘT TRÁI: THÔNG TIN SẢN PHẨM */}
                        <div className="flex gap-4 items-start flex-1 min-w-0">
                          <Link to={`/product/${item.asin}`} className="shrink-0 block">
                            <img src={item.image} className="w-20 h-20 object-contain bg-white rounded-xl p-1.5 border border-slate-200 hover:border-sky-400 transition-colors" alt="" />
                          </Link>
                          
                          <div className="flex flex-col">
                            <Link to={`/product/${item.asin}`} className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-sky-600 hover:underline transition-colors mb-1">
                              {item.title}
                            </Link>
                            <div className="text-xs text-slate-500 font-medium mt-1">Số lượng: {item.quantity}</div>
                          </div>
                        </div>
                        
                        {/* CỘT PHẢI: GIÁ & NÚT BẤM ĐÃ FIX LẠI BỐ CỤC */}
                        <div className="flex flex-col w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-sky-100 sm:items-end gap-3">
                          <div className="font-black text-rose-600 text-base md:text-lg text-right">
                            ${item.price.toFixed(2)}
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            {/* Nút Mua Lại */}
                            <button 
                              onClick={() => handleBuyAgain(item)}
                              className="text-xs font-bold bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 px-3 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 min-w-[90px]"
                            >
                              <span className="text-sm">🛒</span> Mua lại
                            </button>

                            {/* Nút Đánh Giá */}
                            {order.status === 'Hoàn thành' && (
                              existingReview ? (
                                <button 
                                  onClick={() => setModalConfig({ isOpen: true, mode: 'view', data: { ...existingReview, title: item.title } })}
                                  className="text-xs font-bold bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 px-3 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 min-w-[90px]"
                                >
                                  <span className="text-sm">📝</span> Xem ĐG
                                </button>
                              ) : (
                                <button 
                                  onClick={() => setModalConfig({ isOpen: true, mode: 'create', data: { asin: item.asin, title: item.title } })}
                                  className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 px-3 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 min-w-[90px]"
                                >
                                  <span className="text-sm">⭐</span> Đánh giá
                                </button>
                              )
                            )}
                          </div>
                        </div>
                        
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end items-center mt-5 pt-4 border-t border-slate-200">
                  <span className="text-slate-500 text-sm font-medium">Tổng thanh toán: </span>
                  <span className="text-2xl font-black text-rose-600 ml-3">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 GỌI COMPONENT MODAL TẠI ĐÂY */}
      <ReviewModal 
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        initialData={modalConfig.data}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default OrderHistory;