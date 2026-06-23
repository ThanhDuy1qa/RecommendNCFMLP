import React, { useState } from 'react';

const WithdrawModal = ({ isOpen, onClose, user }) => {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState(user?.bankInfo?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.bankInfo?.accountNumber || '');
  const [accountName, setAccountName] = useState(user?.bankInfo?.accountName || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleWithdraw = async () => {
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount < 10000) return alert("❌ Số tiền rút tối thiểu là 10.000đ");
    if (withdrawAmount > user.walletBalance) return alert("❌ Số dư không đủ!");
    if (!bankName || !accountNumber || !accountName) return alert("❌ Vui lòng nhập đầy đủ thông tin ngân hàng!");

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // 1. Cập nhật thông tin ngân hàng trước
      await fetch('http://localhost:5000/api/finance/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bankName, accountNumber, accountName })
      });

      // 2. Tạo lệnh rút tiền gửi cho Admin
      const res = await fetch('http://localhost:5000/api/finance/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: withdrawAmount })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message + "\nVui lòng chờ Kế toán duyệt và chuyển khoản!");
        onClose();
        window.location.reload(); // Tải lại trang để thấy số dư bị trừ
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold flex items-center justify-center">✕</button>

        <h2 className="text-2xl font-black text-rose-500 mb-2">💸 Rút Tiền Về Ngân Hàng</h2>
        <p className="text-slate-500 mb-6 text-sm">Số dư có thể rút: <strong className="text-emerald-600">{(user.walletBalance || 0).toLocaleString()} đ</strong></p>

        <div className="space-y-4 text-left mb-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Số tiền muốn rút (VNĐ):</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="VD: 50000" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:border-rose-400" />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tên Ngân hàng:</label>
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="VD: Vietcombank, MB Bank..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:border-rose-400" />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Số Tài khoản:</label>
                <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Nhập số tài khoản..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:border-rose-400" />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tên Chủ thẻ:</label>
                <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="VD: NGUYEN VAN A" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:border-rose-400 uppercase" />
            </div>
        </div>

        <button 
            onClick={handleWithdraw} 
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2"
        >
            {loading ? 'Đang gửi yêu cầu...' : 'Tạo Lệnh Rút Tiền'}
        </button>
      </div>
    </div>
  );
};

export default WithdrawModal;