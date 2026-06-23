import React, { useState, useEffect } from 'react';

const DepositModal = ({ isOpen, onClose, user }) => {
  const [depositAmount, setDepositAmount] = useState(50000); 
  
  // 🌟 THÊM 2 STATE MỚI ĐỂ XỬ LÝ HIỆU ỨNG THÀNH CÔNG VÀ CHỜ ĐỢI
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 🌟 MAGIC NẰM Ở ĐÂY: LẮNG NGHE BIẾN ĐỘNG SỐ DƯ
  useEffect(() => {
    let interval;

    if (isOpen && user) {
      // Reset trạng thái mỗi khi mở lại modal
      setIsSuccess(false);
      setIsChecking(true);
      
      let baseBalance = user.walletBalance || 0;

      // Hàm kiểm tra biến động
      const verifyPayment = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/users/wallet-balance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            const data = await res.json();
            
            // 🔥 NẾU SỐ DƯ TĂNG LÊN SO VỚI LÚC MỚI MỞ MODAL -> TIỀN ĐÃ VÀO!
            if (data.balance > baseBalance) {
              setIsSuccess(true);
              setIsChecking(false);
              clearInterval(interval); // Tiền vào rồi thì ngừng hỏi thăm
            }
          }
        } catch (error) {}
      };

      // Lấy mốc số dư chuẩn nhất ngay lúc vừa mở cửa sổ QR
      fetch('http://localhost:5000/api/users/wallet-balance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if(data.balance !== undefined) baseBalance = data.balance;
        
        // Bắt đầu vòng lặp hỏi thăm ngân hàng mỗi 3 giây
        interval = setInterval(verifyPayment, 3000);
      });
    }

    // Dọn dẹp bộ nhớ khi đóng cửa sổ
    return () => clearInterval(interval);
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* ========================================================
            GIAO DIỆN 1: KHI THÀNH CÔNG (TIỀN ĐÃ VÀO)
            ======================================================== */}
        {isSuccess ? (
          <div className="py-6 animate-fadeIn">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="text-6xl animate-bounce">🎉</span>
            </div>
            <h2 className="text-3xl font-black text-emerald-600 mb-2">Tuyệt vời!</h2>
            <p className="text-slate-600 mb-8 font-medium">Hệ thống đã nhận được tiền và tự động cộng vào ví của bạn.</p>
            
            <button 
              onClick={onClose} 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 active:scale-95 text-lg"
            >
              Đóng và Mua sắm ngay
            </button>
          </div>
        ) : (
          
        /* ========================================================
            GIAO DIỆN 2: ĐANG CHỜ QUÉT MÃ QR
            ======================================================== */
          <div className="animate-fadeIn">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black text-sky-600 mb-2">💰 Nạp tiền vào Ví</h2>
            <p className="text-slate-500 mb-6 text-sm">Số dư hiện tại: <strong className="text-emerald-600">{(user.walletBalance || 0).toLocaleString()} đ</strong></p>

            {/* Khung nhập số tiền */}
            <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nhập số tiền muốn nạp (VNĐ):</label>
                <input 
                    type="number" 
                    step="10000" 
                    min="10000"
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-colors"
                />
            </div>

            {/* Mã QR */}
            <div className="flex justify-center mb-6 relative group">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 transition-transform group-hover:scale-105 duration-300">
                <img 
                  src={`https://qr.sepay.vn/img?bank=Sacombank&acc=071027042004&amount=${depositAmount || 0}&des=NAPTIEN ${user._id || user.id}`} 
                  alt="Mã QR Nạp Tiền" 
                  className="w-56 h-56 object-contain mix-blend-multiply"
                />
              </div>
            </div>

            <div className="bg-sky-50 text-sky-800 p-4 rounded-xl border border-sky-200 mb-4 text-sm text-left shadow-sm">
              <p>Nội dung chuyển khoản: <strong className="text-rose-600 select-all font-mono text-base ml-1">NAPTIEN {user._id || user.id}</strong></p>
            </div>

            {/* HIỆU ỨNG LOADING CHỜ TIỀN VÀO */}
            {isChecking && (
               <div className="flex items-center justify-center gap-2 mb-4 text-emerald-600 font-semibold bg-emerald-50 py-2.5 px-4 rounded-full border border-emerald-100 w-full animate-pulse">
                 <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-xs">Đang lắng nghe ngân hàng đối soát...</span>
               </div>
            )}

            <button 
                onClick={onClose} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            >
                Hủy bỏ giao dịch
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DepositModal;