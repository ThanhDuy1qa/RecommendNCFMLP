import React from 'react';
import OrderCard from '../components/OrderCard';
import { useSellerOrders } from '../hooks/useSellerOrders';

const SellerOrders = () => {
  const { orders, loading, handleUpdateStatus } = useSellerOrders();

  if (loading) return <div className="text-white text-center p-10 mt-20">⏳ Đang tải đơn hàng của bạn...</div>;

  return (
    <div className="bg-slate-900 min-h-screen p-4 md:p-8 text-slate-200">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">📦 Đơn hàng của tôi</h1>
        
        {orders.length === 0 ? (
          <div className="text-center bg-slate-800 p-10 rounded-xl border border-slate-700 shadow-lg">
            <span className="text-5xl block mb-4">📭</span>
            Chưa có giao dịch nào được ghi nhận.
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