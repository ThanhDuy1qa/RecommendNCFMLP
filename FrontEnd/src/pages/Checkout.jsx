import React from 'react';
import { Navigate } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useCheckoutPage } from '../hooks/useCheckoutPage';
// 🌟 NHỚ IMPORT COMPONENT MODAL BẠN VỪA TẠO
import PaymentModal from '../components/PaymentModal';

const Checkout = () => {
  const {
    user, hasValidState, shippingInfo, paymentMethod, setPaymentMethod,
    handleChange, onSubmit, selectedItems, totalAmount, loading,
    goBackToCart, isOrderCreated, finishPayment, isChecking,
    paymentMode, setPaymentMode, totalQuantity, handleCancelPayment, createdOrderId
  } = useCheckoutPage();

  if (!hasValidState) return <Navigate to="/cart" />;

  const exchangeRate = 25000;
  
  // 🌟 Tính tiền dựa vào chế độ được chọn
  let amountInVND = Math.round(totalAmount * exchangeRate); // Mặc định là giá thật
  if (paymentMode === 'test_2k') {
    amountInVND = totalQuantity * 2000; // Nếu chọn test thì áp giá 2k
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Email đặt hàng</label>
                <input 
                  type="email" 
                  value={user?.email || 'Đang tải...'} 
                  disabled 
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-500 cursor-not-allowed outline-none" 
                />
                <label className="block text-sm font-bold text-slate-600 mb-1">Họ và tên người nhận *</label>
                <input required type="text" name="fullName" value={shippingInfo.fullName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="Nhập họ và tên..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Số điện thoại *</label>
                <input required type="tel" name="phone" value={shippingInfo.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="Nhập số điện thoại..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Địa chỉ chi tiết *</label>
                <textarea required name="address" rows="3" value={shippingInfo.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="Số nhà, Tên đường..." />
              </div>
            </div>
          </form>

          {/* Phương thức thanh toán */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-800 border-b border-slate-200 pb-3">💳 Phương thức thanh toán</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${paymentMethod === 'COD' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300'}`}>
                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-sky-600" />
                <span className="font-bold text-slate-700">Thanh toán khi nhận (COD)</span>
              </label>
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300'}`}>
                <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={paymentMethod === 'BANK_TRANSFER'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-sky-600" />
                <span className="font-bold text-slate-700">Chuyển khoản Ngân hàng</span>
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
                    <img src={item.image || defaultIcon} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">SL: {item.quantity}</p>
                  </div>
                  <div className="font-black text-rose-600">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* BỘ CHỌN MÔI TRƯỜNG TEST */}
            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2">
                <p className="text-xs font-bold text-indigo-800 uppercase border-b border-indigo-200 pb-1">Tùy chọn thanh toán (Dành cho DATN)</p>
                
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input type="radio" value="real_full" checked={paymentMode === 'real_full'} onChange={(e) => setPaymentMode(e.target.value)} className="mt-1 accent-indigo-600" />
                  <div>
                    <div className="text-sm text-indigo-900 font-bold">Thanh toán Thật (Giá gốc)</div>
                    <div className="text-[11px] text-slate-500">Quét QR chuyển đúng số tiền thực tế của đơn hàng.</div>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none mt-2">
                  <input type="radio" value="test_2k" checked={paymentMode === 'test_2k'} onChange={(e) => setPaymentMode(e.target.value)} className="mt-1 accent-indigo-600" />
                  <div>
                    <div className="text-sm text-indigo-900 font-bold">Thanh toán Kiểm thử (2.000đ/sp)</div>
                    <div className="text-[11px] text-slate-500">Quét QR chuyển tiền thật, nhưng chỉ tính 2.000đ/sản phẩm.</div>
                  </div>
                </label>

                
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-xl font-black text-slate-800 pt-3 border-t border-slate-200">
                <span>Tổng thanh toán:</span>
                <span className="text-rose-600">
                  {paymentMode === 'test_2k' ? `${(totalQuantity * 2000).toLocaleString()} đ` : `$${totalAmount.toFixed(2)}`}
                </span>
              </div>
            </div>

            <button type="submit" form="checkout-form" disabled={loading} className="w-full mt-8 bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl font-bold text-lg">
              {loading ? "Đang xử lý..." : "Đặt Hàng Ngay"}
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 SỬ DỤNG COMPONENT MODAL BẠN VỪA TẠCH */}
      <PaymentModal 
        isOpen={isOrderCreated && paymentMethod === 'BANK_TRANSFER'}
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
        amountInVND={amountInVND}
        transactionCode={createdOrderId}
        isChecking={isChecking}
        onCancel={handleCancelPayment}
        onFinish={finishPayment}
      />

    </div>
  );
};

export default Checkout;