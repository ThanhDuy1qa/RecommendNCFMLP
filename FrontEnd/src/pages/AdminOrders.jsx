import React from 'react';
import OrderCard from '../components/OrderCard';
import { useAdminOrders } from '../hooks/useAdminOrders';

const AdminOrders = () => {
  const { orders, loading, handleUpdateStatus } = useAdminOrders();

  if (loading) return <div className="text-white text-center p-10 mt-20">⏳ Đang tải dữ liệu đơn hàng...</div>;

  return (
    <div className="bg-slate-900 min-h-screen p-4 md:p-8 text-slate-200">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-red-400 mb-8">📋 Toàn bộ đơn hàng hệ thống</h1>
        
        {orders.length === 0 ? (
          <div className="text-center bg-slate-800 p-10 rounded-xl border border-slate-700 shadow-lg">
            <span className="text-5xl block mb-4">📭</span>
            Hệ thống chưa ghi nhận bất kỳ đơn hàng nào.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard 
                key={order._id} 
                order={order} 
                role="admin" // Vai trò Admin
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