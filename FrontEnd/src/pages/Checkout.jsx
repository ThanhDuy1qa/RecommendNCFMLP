import React from 'react';
import { Navigate } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useCheckoutPage } from '../hooks/useCheckoutPage';

const Checkout = () => {
  const {
    user,
    hasValidState,
    shippingInfo,
    paymentMethod,
    setPaymentMethod,
    handleChange,
    onSubmit,
    selectedItems,
    totalAmount,
    loading,
    goBackToCart
  } = useCheckoutPage();

  // Nếu người dùng gõ trực tiếp URL /checkout mà chưa chọn đồ, đá về giỏ hàng
  if (!hasValidState) {
    return <Navigate to="/cart" />;
  }

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
        <div className="lg:w-2/3 space-y-6">
          <button onClick={goBackToCart} className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-2">
            &larr; Quay lại Giỏ hàng
          </button>

          <form id="checkout-form" onSubmit={onSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-black text-slate-800 border-b border-slate-200 pb-3">📍 Thông tin giao hàng</h2>
            
            {/* Ô hiển thị Email (Khóa - Chỉ đọc) */}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Email đặt hàng</label>
                <input 
                  type="email" 
                  value={user?.email || 'Đang tải...'} 
                  disabled 
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-500 cursor-not-allowed outline-none" 
                />
              </div>


            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Họ và tên người nhận *</label>
                <input required type="text" name="fullName" value={shippingInfo.fullName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="Nhập họ và tên..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Số điện thoại *</label>
                <input required type="tel" name="phone" value={shippingInfo.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="Nhập số điện thoại..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Địa chỉ nhận hàng chi tiết *</label>
                <textarea required name="address" rows="3" value={shippingInfo.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..." />
              </div>
            </div>
          </form>

          {/* Phương thức thanh toán */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-800 border-b border-slate-200 pb-3">💳 Phương thức thanh toán</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${paymentMethod === 'COD' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300'}`}>
                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-sky-600" />
                <span className="font-bold text-slate-700">Thanh toán khi nhận hàng (COD)</span>
              </label>

              <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${paymentMethod === 'VNPAY' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300'}`}>
                <input type="radio" name="paymentMethod" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-sky-600" />
                <span className="font-bold text-slate-700">Chuyển khoản VNPay (Demo)</span>
              </label>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-black text-slate-800 border-b border-slate-200 pb-3 mb-4">🧾 Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedItems.map((item) => (
                <div key={item.asin} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded flex shrink-0 items-center justify-center p-1 border border-slate-200">
                    <img src={item.image || defaultIcon} alt={item.title} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.src = defaultIcon; }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">SL: {item.quantity}</p>
                  </div>
                  <div className="font-black text-rose-600">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Phí vận chuyển:</span>
                <span className="text-emerald-600 font-bold">Miễn phí</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-800 pt-3 border-t border-slate-200">
                <span>Tổng cộng:</span>
                <span className="text-rose-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={loading}
              className="w-full mt-8 bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đặt Hàng Ngay"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;