import React from 'react';
import defaultIcon from '../assets/no-image.png';

const statusColors = {
  'Chờ xác nhận': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  'Đang chuẩn bị hàng': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  'Đang giao hàng': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  'Hoàn thành': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  'Đã hủy': 'bg-red-500/20 text-red-400 border-red-500/50'
};
const statusOptions = Object.keys(statusColors);

const OrderCard = ({ order, role, onUpdateStatus }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col md:flex-row gap-6">
      
      {/* Thông tin khách hàng */}
      <div className="md:w-1/3 border-r border-slate-700 pr-6">
        <div className="mb-4">
          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
            Mã ĐH: {order._id.slice(-8).toUpperCase()}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Thông tin nhận hàng</h3>
        <div className="space-y-1 text-sm text-slate-300">
          <p>👤 <span className="font-semibold text-white">{order.shippingInfo?.fullName}</span></p>
          <p>📞 {order.shippingInfo?.phone}</p>
          <p>📍 {order.shippingInfo?.address}</p>
          <p className="mt-3 text-blue-400 border border-blue-400/30 bg-blue-400/10 inline-block px-3 py-1 rounded font-medium">
            💳 Thanh toán: {order.paymentMethod}
          </p>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="md:w-2/3 flex flex-col justify-between">
        <div className="space-y-3 mb-6">
          {order.items.map(item => (
            <div key={item.asin} className="flex gap-4 items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
              <img src={item.image || defaultIcon} className="w-12 h-12 object-contain bg-white rounded p-1" alt="Product"/>
              <div className="flex-grow">
                <div className="text-sm font-bold text-slate-200 line-clamp-1">{item.title}</div>
                <div className="text-xs text-slate-400">Số lượng: {item.quantity}</div>
                
                {/* ĐIỂM KHÁC BIỆT: Chỉ Admin mới thấy Seller ID */}
                {role === 'admin' && (
                  <div className="mt-2 text-[11px] text-orange-300 bg-orange-900/30 inline-block px-2 py-0.5 rounded border border-orange-800/50">
                    🏬 Seller: {item.sellerName || item.sellerId || "Hệ thống"}
                  </div>
                )}
              </div>
              <div className="font-bold text-green-400">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Trạng thái & Cập nhật */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-700 mt-auto gap-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">Trạng thái:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || statusColors['Chờ xác nhận']}`}>
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase font-bold">Cập nhật:</span>
            <select 
              value={order.status}
              onChange={(e) => onUpdateStatus(order._id, e.target.value)}
              disabled={role === 'seller' && (order.status === 'Đã hủy' || order.status === 'Hoàn thành')} // Admin có quyền đổi cả khi đã hủy
              className="bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-blue-500 block p-2 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;