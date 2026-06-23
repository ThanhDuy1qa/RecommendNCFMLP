import React from 'react';
import defaultIcon from '../assets/no-image.png';

// 🌟 1. ĐÃ ĐỒNG BỘ MÀU SẮC GIỐNG VỚI ORDER HISTORY
const statusColors = {
  'Chờ xác nhận': 'bg-slate-100 text-slate-600 border-slate-300',
  'Đang xử lý': 'bg-sky-100 text-sky-700 border-sky-400 font-black',
  'Đang giao hàng': 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'Hoàn thành': 'bg-emerald-100 text-emerald-700 border-emerald-400 font-black',
  'Đã hủy': 'bg-red-50 text-red-500 border-red-200 line-through',
  'Thanh toán thiếu': 'bg-rose-100 text-rose-700 border-rose-500 font-black animate-pulse',
  'Thanh toán thừa': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-400 font-black'
};

// 🌟 2. TÁCH RIÊNG OPTIONS ĐỂ ADMIN KHÔNG TỰ CHỌN "THANH TOÁN THIẾU" ĐƯỢC
const statusOptions = [
  'Chờ xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Hoàn thành', 'Đã hủy'
];

const OrderCard = ({ order, role, onUpdateStatus }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
      
      {/* Thông tin khách hàng */}
      <div className="md:w-1/3 border-r border-slate-100 pr-6">
        <div className="mb-4">
          <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">ID: {order._id}</span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2">{order.shippingInfo?.fullName || 'Khách hàng'}</h3>
        <p className="text-sm text-slate-600 mb-1 flex items-center gap-2"><span>✉️</span> {order.userId?.email || 'Chưa cập nhật email'}</p>
        <p className="text-sm text-slate-600 mb-1 flex items-center gap-2"><span>📞</span> {order.shippingInfo?.phone || 'Chưa cập nhật SĐT'}</p>
        <p className="text-sm text-slate-600 flex items-start gap-2 leading-relaxed">
          <span>📍</span> {order.shippingInfo?.address || 'Chưa cập nhật địa chỉ'}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          <div className="mt-2 text-lg font-black text-rose-600">Tổng: ${order.totalAmount?.toFixed(2)}</div>
        </div>
      </div>

      {/* Danh sách sản phẩm & Trạng thái */}
      <div className="md:w-2/3 flex flex-col">
        <div className="flex-1 space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="w-14 h-14 bg-white rounded-lg p-1 border border-slate-200 flex shrink-0 items-center justify-center">
                <img 
                  src={item.image || defaultIcon} 
                  alt={item.title} 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.src = defaultIcon; }}
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                <div className="text-xs text-slate-500 mt-1">
                  ${item.price} <span className="mx-1">x</span> <span className="font-bold text-slate-700">{item.quantity}</span>
                </div>
              </div>
              <div className="font-bold text-sky-700">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Trạng thái & Cập nhật */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-100 mt-auto gap-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm font-medium">Trạng thái:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || statusColors['Chờ xác nhận']}`}>
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 uppercase font-bold">Cập nhật:</span>
            <select 
              value={order.status}
              onChange={(e) => onUpdateStatus(order._id, e.target.value)}
              disabled={role === 'seller' && (order.status === 'Đã hủy' || order.status === 'Hoàn thành')} 
              className="bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {!statusOptions.includes(order.status) && (
                <option value={order.status} disabled>⚠️ {order.status}</option>
              )}

              {/* 🌟 2. ẨN HOÀN TOÀN "CHỜ XÁC NHẬN" NẾU KHÔNG PHẢI ADMIN */}
              {statusOptions.map(status => {
                // Nếu người dùng KHÔNG phải Admin VÀ đang xét tới trạng thái 'Chờ xác nhận'
                if (role !== 'admin' && status === 'Chờ xác nhận') {
                  // Nếu bản thân đơn hàng chưa vượt qua mốc 'Chờ xác nhận' thì vẫn hiện để khung <select> không bị lỗi trắng
                  // Còn nếu đơn hàng đã vượt qua rồi (Đang xử lý, Hoàn thành...) thì ẨN HOÀN TOÀN
                  if (order.status !== 'Chờ xác nhận') {
                    return null; 
                  }
                }
                
                return (
                  <option 
                    key={status} 
                    value={status} 
                  >
                    {status}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;