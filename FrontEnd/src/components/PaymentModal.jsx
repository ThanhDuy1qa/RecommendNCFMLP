import React from 'react';

const PaymentModal = ({
  isOpen,
  paymentMode,
  amountInVND,
  setPaymentMode,
  transactionCode,
  isChecking,
  onCancel,
  onFinish,
  onMock
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative animate-fadeIn">
        
        {/* Nút tắt */}
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold border border-slate-200 transition-colors flex items-center justify-center"
          title="Hủy giao dịch và đóng"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black text-amber-600 mb-2">⏳ Đang chờ thanh toán...</h2>
        {/* 🌟 CHÈN BỘ CHỌN MÔI TRƯỜNG TEST VÀO ĐÂY */}
        {setPaymentMode && (
          <div className="mb-4 p-3 bg-sky-50 rounded-xl border border-sky-200 text-left">
             <p className="text-xs font-bold text-sky-800 uppercase mb-2">Tùy chọn cho Đồ Án (DATN)</p>
             <div className="flex gap-4">
               <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                 <input type="radio" value="test_2k" checked={paymentMode === 'test_2k'} onChange={(e) => setPaymentMode(e.target.value)} className="accent-sky-600 w-4 h-4" />
                 Test (2.000đ)
               </label>
               <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                 <input type="radio" value="real_full" checked={paymentMode === 'real_full'} onChange={(e) => setPaymentMode(e.target.value)} className="accent-sky-600 w-4 h-4" />
                 Giá thật
               </label>
             </div>
          </div>
        )}
        
        <p className="text-slate-600 mb-4 text-sm">Vui lòng dùng App Ngân hàng quét mã QR dưới đây.</p>
        
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
            {/* 🌟 ĐÃ CẬP NHẬT: URL MÃ QR SACOMBANK CỦA BẠN */}
            <img 
              src={`https://qr.sepay.vn/img?acc=${import.meta.env.VITE_BANK_ACCOUNT}&bank=${import.meta.env.VITE_BANK_NAME}&template=compact&showinfo=true&amount=${amountInVND}&des=Thanh toan don hang ${transactionCode}`} 
              alt="Mã QR Chuyển khoản" 
              className="w-56 h-56 object-contain"
            />
          </div>
        </div>

        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 mb-6 text-sm text-left space-y-1">
          {/* 🌟 ĐÃ CẬP NHẬT: THÔNG TIN NGÂN HÀNG BẰNG CHỮ */}
          <p>Ngân hàng: <strong>{import.meta.env.VITE_BANK_NAME}</strong></p>
          <p>Số tài khoản: <strong className="text-sky-700 font-mono">{import.meta.env.VITE_BANK_ACCOUNT}</strong></p>
          <p>Chủ tài khoản: <strong>{import.meta.env.VITE_BANK_OWNER}</strong></p>
          <p>Số tiền: <strong className="text-rose-600 text-lg">{amountInVND.toLocaleString('vi-VN')} đ</strong></p>
          <p className="mt-2 border-t border-amber-200 pt-1 text-xs text-slate-500">Nội dung CK bắt buộc:</p>
          <p className="font-bold text-base uppercase bg-white p-2 border border-amber-200 rounded text-center text-rose-600 font-mono select-all">
            Thanh toan don hang {transactionCode}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* 🌟 NÚT: CHẾ ĐỘ THẬT (Đã đổi thành trạng thái tự động nhận diện) */}
          {(paymentMode === 'real_full' || paymentMode === 'test_2k') && (
            <>
              {/* Hiển thị thanh loading báo hiệu hệ thống đang quét ngầm */}
              <div className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold flex justify-center items-center gap-2 border border-emerald-200 animate-pulse mb-1">
                <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Hệ thống đang tự động kiểm tra giao dịch...
              </div>
              
              {/* Nút thủ công ẩn mình làm backup */}
              <button 
                onClick={onFinish} 
                disabled={isChecking} 
                className="w-full text-slate-500 hover:text-sky-600 text-xs font-medium underline transition-all disabled:opacity-50"
              >
                {isChecking ? "⏳ Đang kiểm tra..." : "Chờ lâu quá? Bấm vào đây để kiểm tra thủ công"}
              </button>
            </>
          )}



          <button 
            onClick={onCancel} 
            disabled={isChecking} 
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 mt-2"
          >
            ❌ Thoát và Thanh toán sau
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default PaymentModal;