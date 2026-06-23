import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useCheckoutPage } from '../hooks/useCheckoutPage';

const Checkout = () => {
  const {
    user, hasValidState, shippingInfo, paymentMethod, setPaymentMethod,
    handleChange, onSubmit, selectedItems, totalAmount, loading,
    goBackToCart, totalQuantity, paymentMode, setPaymentMode, liveBalance
  } = useCheckoutPage();

  useEffect(() => {
    if (!paymentMethod || paymentMethod === 'BANK_TRANSFER') {
      setPaymentMethod('WALLET');
    }
  }, [paymentMethod, setPaymentMethod]);

  if (!hasValidState) return <Navigate to="/cart" />;

  const exchangeRate = 25000;
  
  // 🌟 TÍNH TIỀN DỰA VÀO CHẾ ĐỘ THẬT HAY TEST
  const amountInVND = paymentMode === 'test_2k' ? (totalQuantity * 2000) : Math.round(totalAmount * exchangeRate); 
  const isBalanceEnough = liveBalance >= amountInVND;

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
                <label className="block text-sm font-bold text-slate-600 mb-1 mt-3">Họ và tên người nhận *</label>
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

          {/* PHƯƠNG THỨC THANH TOÁN */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-800 border-b border-slate-200 pb-3">💳 Phương thức thanh toán</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* VÍ NỘI BỘ */}
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'WALLET' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="paymentMethod" value="WALLET" checked={paymentMethod === 'WALLET'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-sky-600" />
                  <span className="font-bold text-slate-700">Thanh toán bằng Ví</span>
                </div>
                
                {/* 🌟 ĐÃ ĐỔI SANG DÙNG LIVE BALANCE */}
                <div className={`text-xs font-bold px-3 py-1.5 rounded-md text-center flex flex-col items-center gap-1 ${isBalanceEnough ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  Số dư hiện tại: {liveBalance.toLocaleString('vi-VN')} đ
                  {!isBalanceEnough && (
                    <span className="flex items-center gap-1 mt-0.5 font-black text-rose-500 bg-white px-2 py-0.5 rounded-full shadow-sm border border-rose-100">
                      ❌ Không đủ tiền
                    </span>
                  )}
                </div>
              </label>

              {/* COD */}
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-center gap-2 transition-all ${paymentMethod === 'COD' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300'}`}>
                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-sky-600" />
                <span className="font-bold text-slate-700">Thanh toán khi nhận hàng (COD)</span>
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

            {/* 🌟 THÊM LẠI BỘ CHỌN MÔI TRƯỜNG TEST VÀO ĐÂY */}
            {paymentMethod === 'WALLET' && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2">
                <p className="text-xs font-bold text-indigo-800 uppercase border-b border-indigo-200 pb-1">Tùy chọn thanh toán (Dành cho DATN)</p>
                
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input type="radio" value="real_full" checked={paymentMode === 'real_full'} onChange={(e) => setPaymentMode(e.target.value)} className="mt-1 accent-indigo-600" />
                  <div>
                    <div className="text-sm text-indigo-900 font-bold">Thanh toán Thật (Giá gốc)</div>
                    <div className="text-[11px] text-slate-500">Trừ đúng số tiền thực tế của đơn hàng vào Ví.</div>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none mt-2">
                  <input type="radio" value="test_2k" checked={paymentMode === 'test_2k'} onChange={(e) => setPaymentMode(e.target.value)} className="mt-1 accent-indigo-600" />
                  <div>
                    <div className="text-sm text-indigo-900 font-bold">Thanh toán Kiểm thử (2.000đ/sp)</div>
                    <div className="text-[11px] text-slate-500">Chỉ trừ 2.000đ/sản phẩm vào Ví để test.</div>
                  </div>
                </label>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-xl font-black text-slate-800 pt-3 border-t border-slate-200 items-end">
                <span>Tổng tiền:</span>
                <div className="text-right">
                    <div className="text-rose-600">${totalAmount.toFixed(2)}</div>
                    <div className="text-sm text-slate-500 font-medium">
                      ~ {amountInVND.toLocaleString('vi-VN')} đ
                    </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form" 
              disabled={loading || (paymentMethod === 'WALLET' && !isBalanceEnough)} 
              className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all ${
                (paymentMethod === 'WALLET' && !isBalanceEnough) 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {loading ? "Đang xử lý..." : (paymentMethod === 'WALLET' && !isBalanceEnough) ? "⚠️ Ví Không Đủ Tiền" : "Đặt Hàng Ngay"}
            </button>
            
            {(paymentMethod === 'WALLET' && !isBalanceEnough) && (
              <p className="text-center text-xs text-rose-500 font-bold mt-3">
                Bạn cần nạp thêm {(amountInVND - liveBalance).toLocaleString('vi-VN')}đ vào ví! 
                <br/><Link to="/profile" className="text-sky-600 underline hover:text-sky-800">Tới trang Hồ sơ cá nhân để nạp</Link>
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;