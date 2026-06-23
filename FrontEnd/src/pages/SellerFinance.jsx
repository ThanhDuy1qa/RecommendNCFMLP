import React, { useState, useEffect, useRef } from 'react';

const SellerFinance = () => {
  // 1. STATE DỮ LIỆU THẬT
  const [walletBalance, setWalletBalance] = useState(0);
  const [bankInfo, setBankInfo] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const [payoutHistory, setPayoutHistory] = useState([]);
  
  // 2. STATE ĐIỀU KHIỂN UI
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [loading, setLoading] = useState(true);

  // 3. STATE CHO DROPDOWN NGÂN HÀNG VIETQR
  const [bankList, setBankList] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchBank, setSearchBank] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // LẤY DỮ LIỆU TỪ SERVER KHI MỞ TRANG
  useEffect(() => {
    fetchFinanceData();
    
    // Lấy danh sách ngân hàng VietQR
    fetch('https://api.vietqr.io/v2/banks')
      .then(res => res.json())
      .then(data => {
        if (data.code === '00') setBankList(data.data);
      });
  }, []);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFinanceData = async () => {
    const token = localStorage.getItem('token');
    try {
      // Gọi API lấy thông tin tài chính của Seller
      const res = await fetch('http://localhost:5000/api/finance/seller', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(data.walletBalance || 0);
        setBankInfo(data.bankInfo || { bankName: '', accountNumber: '', accountName: '' });
        setPayoutHistory(data.payoutHistory || []);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu tài chính:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditingBank(true);
    // Tự động tìm và gán Logo ngân hàng cũ nếu đã có
    if (bankInfo.bankName && bankList.length > 0) {
      const existing = bankList.find(b => b.shortName === bankInfo.bankName);
      if (existing) setSelectedBank(existing);
    }
  };

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    if (!selectedBank || !bankInfo.accountNumber || !bankInfo.accountName) {
      alert("Vui lòng điền đầy đủ thông tin ngân hàng!");
      return;
    }

    const payload = {
      bankName: selectedBank.shortName,
      accountNumber: bankInfo.accountNumber,
      accountName: bankInfo.accountName
    };

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/finance/seller/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ Đã cập nhật tài khoản ngân hàng thành công!");
        setBankInfo(payload);
        setIsEditingBank(false);
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleRequestPayout = async () => {
    if (!bankInfo.accountNumber) {
      alert("❌ Bạn cần thiết lập Tài khoản ngân hàng trước khi rút tiền!");
      return;
    }
    const amount = Number(payoutAmount);
    if (amount < 10) {
      alert("❌ Số tiền rút tối thiểu là $10");
      return;
    }
    if (amount > walletBalance) {
      alert("❌ Số dư không đủ!");
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/finance/seller/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();

      if (res.ok) {
        alert(`✅ Đã gửi yêu cầu rút $${amount}. Vui lòng chờ Admin duyệt!`);
        setPayoutAmount('');
        fetchFinanceData(); // Load lại lịch sử và số dư
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const filteredBanks = bankList.filter(bank => 
    bank.shortName?.toLowerCase().includes(searchBank.toLowerCase()) || 
    bank.name?.toLowerCase().includes(searchBank.toLowerCase())
  );

  // Tìm logo của ngân hàng hiện tại để hiển thị ở chế độ Xem (Chỉ đọc)
  const currentBankLogo = bankList.find(b => b.shortName === bankInfo.bankName)?.logo;

  if (loading) return <div className="p-10 text-center font-bold text-sky-700">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-800">
      <h1 className="text-3xl font-black text-sky-800 mb-8">💰 Quản Lý Doanh Thu & Rút Tiền</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: SỐ DƯ & LỆNH RÚT TIỀN */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ví Doanh Thu */}
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <p className="text-sky-100 font-medium uppercase tracking-wider mb-2">Số Dư Có Thể Rút</p>
            <h2 className="text-5xl font-black mb-8">${walletBalance.toFixed(2)}</h2>
            
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-sky-100 mb-1 block">Nhập số tiền muốn rút ($)</label>
                <input 
                  type="number" 
                  value={payoutAmount} 
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-white/90 text-slate-800 border-0 rounded-lg p-3 outline-none font-bold text-lg focus:ring-2 focus:ring-sky-300"
                  placeholder="Nhập số tiền tối thiểu $10..."
                />
              </div>
              <button 
                onClick={handleRequestPayout}
                className="w-full sm:w-auto bg-white text-sky-700 hover:bg-sky-50 font-bold px-8 py-3.5 rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                Rút Tiền Ngay
              </button>
            </div>
          </div>

          {/* Lịch sử Rút tiền */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="font-black text-slate-700">🕒 Lịch Sử Rút Tiền</h3>
            </div>
            {payoutHistory.length === 0 ? (
               <div className="p-8 text-center text-slate-500 italic">Chưa có giao dịch rút tiền nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-slate-500 bg-slate-50 border-b border-slate-100">
                      <th className="p-4 font-bold">Mã Lệnh</th>
                      <th className="p-4 font-bold">Ngày Yêu Cầu</th>
                      <th className="p-4 font-bold">Số Tiền</th>
                      <th className="p-4 font-bold">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payoutHistory.map(item => (
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-sm text-sky-700 font-bold">#{item._id.substring(item._id.length - 8).toUpperCase()}</td>
                        <td className="p-4 text-sm text-slate-600">{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                        <td className="p-4 font-black text-rose-600">${item.amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            item.status === 'Đã chuyển' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : item.status === 'Từ chối' ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN NGÂN HÀNG (LƯU TÀI KHOẢN) */}
        <div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <span className="text-xl">🏦</span> Tài Khoản Nhận Tiền
              </h3>
              {!isEditingBank && (
                <button onClick={handleEditClick} className="text-sky-600 font-bold text-sm hover:underline">Sửa</button>
              )}
            </div>

            {isEditingBank ? (
              <form onSubmit={handleUpdateBank} className="space-y-4 animate-fadeIn">
                
                {/* DROPDOWN CHỌN NGÂN HÀNG */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ngân hàng / Ví điện tử *</label>
                  <div 
                    onClick={() => setIsDropdownOpen(true)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-colors"
                  >
                    {selectedBank ? (
                      <div className="flex items-center gap-3">
                        <img src={selectedBank.logo} alt={selectedBank.shortName} className="h-6 w-auto object-contain bg-white rounded shadow-sm p-0.5" />
                        <span className="font-bold text-slate-800">{selectedBank.shortName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">Chọn ngân hàng...</span>
                    )}
                    <span className="text-slate-400">▼</span>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                      <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
                        <input 
                          type="text" 
                          placeholder="🔍 Tìm ngân hàng..." 
                          value={searchBank}
                          onChange={(e) => setSearchBank(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-sky-500"
                          autoFocus
                        />
                      </div>
                      {filteredBanks.map(bank => (
                        <div 
                          key={bank.bin}
                          onClick={() => {
                            setSelectedBank(bank);
                            setBankInfo({...bankInfo, bankName: bank.shortName});
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-50 last:border-none"
                        >
                          <img src={bank.logo} alt={bank.shortName} className="h-6 w-auto object-contain bg-white rounded border border-slate-100" />
                          <div>
                            <div className="font-bold text-sm text-slate-800">{bank.shortName}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{bank.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Số tài khoản / SĐT *</label>
                  <input required type="text" value={bankInfo.accountNumber} onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-sky-400 text-sm font-mono" placeholder="Nhập số tài khoản..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tên chủ tài khoản *</label>
                  <input required type="text" value={bankInfo.accountName} onChange={e => setBankInfo({...bankInfo, accountName: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-sky-400 text-sm uppercase" placeholder="NGUYEN VAN A" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditingBank(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl shadow-md hover:bg-emerald-500">Lưu lại</button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative overflow-hidden">
                {bankInfo.accountNumber ? (
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-3">
                      {currentBankLogo && <img src={currentBankLogo} className="h-8 bg-white p-1 rounded border border-slate-200 shadow-sm" alt="logo" />}
                      <p className="text-sm font-bold text-slate-600 uppercase">{bankInfo.bankName}</p>
                    </div>
                    <p className="text-2xl font-black font-mono tracking-widest text-sky-800">{bankInfo.accountNumber}</p>
                    <p className="text-sm font-bold text-slate-600 uppercase">👤 {bankInfo.accountName}</p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 relative z-10">
                    <span className="text-3xl block mb-2 opacity-50">💳</span>
                    <p className="text-sm font-medium">Chưa liên kết ngân hàng</p>
                    <button onClick={handleEditClick} className="mt-4 bg-sky-100 text-sky-700 font-bold px-4 py-2 rounded-lg text-sm hover:bg-sky-200 transition-colors">Liên kết ngay</button>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 text-xs text-slate-500 bg-amber-50 p-3 rounded-lg border border-amber-100">
              <span className="font-bold text-amber-700">Lưu ý:</span> Tên chủ tài khoản phải trùng khớp với thông tin định danh để tránh lỗi khi Admin đối soát chuyển khoản rút tiền.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerFinance;