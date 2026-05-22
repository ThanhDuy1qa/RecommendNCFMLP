import React from 'react';
import { Navigate } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useCheckoutPage } from '../hooks/useCheckoutPage';

const Checkout = () => {
  const {
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
    <div className="bg-slate-900 min-h-screen p-4 md:p-8 text-slate-200">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN (2/3 màn hình) */}
        <div className="lg:w-2/3 space-y-6">
          <button onClick={goBackToCart} className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2">
            &larr; Quay lại Giỏ hàng
          </button>

          <form id="checkout-form" onSubmit={onSubmit} className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">📍 Địa chỉ giao hàng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Họ và tên người nhận *</label>
                <input 
                  type="text" required name="fullName"
                  value={shippingInfo.fullName} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Số điện thoại *</label>
                <input 
                  type="tel" required name="phone"
                  value={shippingInfo.phone} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: 0987654321"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Địa chỉ nhận hàng chi tiết *</label>
              <textarea 
                required name="address" rows="3"
                value={shippingInfo.address} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4 mt-8">💳 Phương thức thanh toán</h2>
            <div className="space-y-4">
              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:bg-slate-700'}`}>
                <input 
                  type="radio" name="payment" value="COD" 
                  checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 accent-blue-600"
                />
                <div>
                  <div className="font-bold text-white">Thanh toán khi nhận hàng (COD)</div>
                  <div className="text-sm text-slate-400">Thanh toán bằng tiền mặt khi shipper giao hàng tới.</div>
                </div>
              </label>

              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'CreditCard' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:bg-slate-700'}`}>
                <input 
                  type="radio" name="payment" value="CreditCard" 
                  checked={paymentMethod === 'CreditCard'} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 accent-blue-600"
                />
                <div>
                  <div className="font-bold text-white">Chuyển khoản / Thẻ tín dụng</div>
                  <div className="text-sm text-slate-400">Tính năng đang trong quá trình phát triển.</div>
                </div>
              </label>
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: HÓA ĐƠN TÓM TẮT (1/3 màn hình) */}
        <div className="lg:w-1/3">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">📄 Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedItems.map(item => (
                <div key={item.asin} className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white rounded p-1 shrink-0">
                    <img src={item.image || defaultIcon} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm font-semibold line-clamp-1">{item.title}</div>
                    <div className="text-xs text-slate-400">SL: {item.quantity} x ${item.price}</div>
                  </div>
                  <div className="font-bold text-green-400">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phí vận chuyển:</span>
                <span className="text-green-400 font-bold">Miễn phí</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-slate-700">
                <span>Tổng cộng:</span>
                <span className="text-green-400">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đặt Hàng Thành Công"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;