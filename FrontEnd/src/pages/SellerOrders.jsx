import React from 'react';
import OrderCard from '../components/OrderCard';
import { useSellerOrders } from '../hooks/useSellerOrders';

const SellerOrders = () => {
  const { orders, loading, handleUpdateStatus } = useSellerOrders();

  if (loading) return (
    <div className="bg-sky-200 min-h-screen flex items-center justify-center text-sky-800 font-bold">
      <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mr-3"></div>
      ⏳ Đang tải đơn hàng của bạn...
    </div>
  );

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* TIÊU ĐỀ ĐÃ ĐƯỢC LÀM MỚI */}
        <h1 className="text-2xl md:text-3xl font-black text-sky-800 mb-8 flex items-center gap-3 border-b border-sky-300 pb-6">
          <span className="bg-white p-2 rounded-xl shadow-sm">📦</span> Đơn hàng của tôi
        </h1>
        
        {orders.length === 0 ? (
          <div className="bg-white border border-sky-200 rounded-3xl p-12 text-center shadow-sm">
            <span className="text-5xl block mb-4 animate-bounce">📭</span>
            <h2 className="text-xl font-black text-slate-800 mb-2">Chưa có giao dịch nào</h2>
            <p className="text-slate-500 font-medium">Bạn chưa có đơn hàng nào cần xử lý lúc này.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard 
                key={order._id} 
                order={order} 
                role="seller" // Vai trò Seller
                onUpdateStatus={handleUpdateStatus} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;