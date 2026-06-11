import React from 'react';
import OrderCard from '../components/OrderCard';
import { useAdminOrders } from '../hooks/useAdminOrders';

const AdminOrders = () => {
  const { orders, loading, handleUpdateStatus } = useAdminOrders();

  if (loading) return <div className="text-slate-600 text-center p-10 mt-20 font-bold">⏳ Đang tải dữ liệu đơn hàng...</div>;

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-teal-700 mb-8 border-b border-slate-200 pb-4">📋 Toàn bộ đơn hàng hệ thống</h1>
        
        {orders.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-5xl block mb-4">📭</span>
            <p className="font-bold text-slate-500">Hệ thống chưa ghi nhận bất kỳ đơn hàng nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard 
                key={order._id} 
                order={order} 
                role="admin" 
                onUpdateStatus={handleUpdateStatus} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;