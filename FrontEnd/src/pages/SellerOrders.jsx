import React from 'react';
import OrderCard from '../components/OrderCard';
import { useSellerOrders } from '../hooks/useSellerOrders';

const SellerOrders = () => {
  const { 
    orders, loading, handleUpdateStatus, loadMore, hasMore, totalOrders,
    search, setSearch, statusFilter, setStatusFilter, handleSearchSubmit,
    paymentFilter, setPaymentFilter, startDate, setStartDate, endDate, setEndDate,
    activeSearch, setActiveSearch
  } = useSellerOrders();

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER BAR */}
        <div className="bg-white/95 backdrop-blur border border-sky-300 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
              <span className="bg-sky-100 p-2 rounded-xl text-2xl shadow-sm">📦</span> Đơn hàng của tôi
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Quản lý và xử lý các đơn đặt hàng từ khách hàng.
            </p>
          </div>
          
          <div className="bg-sky-50 px-5 py-3 rounded-2xl border border-sky-100 shadow-sm shrink-0">
             <div className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">Tổng Số Đơn</div>
             <div className="text-3xl font-black text-sky-800 font-mono leading-none">
                {totalOrders ? totalOrders.toLocaleString() : 0}
             </div>
          </div>
        </div>

        {/* 🌟 THANH CÔNG CỤ TÌM KIẾM VÀ LỌC */}
        <div className="bg-white p-4 rounded-3xl border border-sky-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
             <form onSubmit={handleSearchSubmit} className="relative flex-grow flex gap-2">
              <input 
                type="text" 
                placeholder="Mã đơn/SP, Tên, SĐT khách..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-12 py-3 text-slate-800 font-medium outline-none focus:border-sky-500 shadow-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1.5 bottom-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 rounded-lg font-bold transition-all shadow-sm active:scale-95"
              >
                Tìm
              </button>
            </form>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-sky-500 shadow-sm lg:w-48 cursor-pointer"
            >
              <option value="">🛒 Tất cả trạng thái</option>
              <option value="Đang xử lý">📦 Đang xử lý</option>
              <option value="Đang giao">🚚 Đang giao</option>
              <option value="Hoàn thành">✅ Hoàn thành </option>
              <option value="Đã hủy">❌ Đã hủy</option>
            </select>

            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-sky-500 shadow-sm lg:w-48 cursor-pointer"
            >
              <option value="">💳 Tất cả thanh toán</option>
              <option value="COD">COD (Tiền mặt)</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
              <option value="Thẻ tín dụng">Thẻ tín dụng</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
             <span className="text-slate-600 font-medium text-sm w-full sm:w-auto">Lọc ngày đặt:</span>
             <input 
               type="date"
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-sky-500"
             />
             <span className="text-slate-400 hidden sm:block">➡️</span>
             <input 
               type="date"
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-sky-500"
             />
             
             {(startDate || endDate || paymentFilter || statusFilter || activeSearch) && (
               <button 
                 onClick={() => {
                   setStartDate(''); setEndDate(''); setPaymentFilter(''); setStatusFilter(''); setSearch(''); setActiveSearch('');
                 }}
                 className="ml-auto text-sm text-red-500 hover:text-red-700 font-semibold"
               >
                 ✖ Xóa bộ lọc
               </button>
             )}
          </div>
        </div>

        {/* DANH SÁCH ĐƠN HÀNG */}
        {orders.length === 0 && !loading ? (
          <div className="bg-white border border-sky-200 rounded-3xl p-12 text-center shadow-sm">
            <span className="text-5xl block mb-4 opacity-50">📭</span>
            <h2 className="text-xl font-black text-slate-800 mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-slate-500 font-medium">Thử thay đổi từ khóa hoặc xóa bớt các bộ lọc.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard 
                key={order._id} 
                order={order} 
                role="seller" 
                onUpdateStatus={handleUpdateStatus} 
              />
            ))}
          </div>
        )}

        {/* TRẠNG THÁI LOADING VÀ TẢI THÊM */}
        {loading && (
          <div className="p-8 text-center flex justify-center items-center gap-3 bg-white/60 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-sm">
            <div className="w-6 h-6 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sky-800 font-bold">Đang tải dữ liệu...</span>
          </div>
        )}

        {!loading && hasMore && orders.length > 0 && (
          <div className="text-center pt-4 pb-8">
            <button 
              onClick={loadMore}
              className="bg-white border border-sky-300 text-sky-800 hover:bg-sky-600 hover:text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <span>⬇️</span> Tải thêm đơn hàng cũ
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SellerOrders;