import React, { useState, useEffect, useRef } from 'react';

const RefundModal = ({ isOpen, order, onClose, onSubmit }) => {
  // States cho Form
  const [bankList, setBankList] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  
  // States cho UI tìm kiếm ngân hàng
  const [searchBank, setSearchBank] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // GỌI API LẤY DANH SÁCH NGÂN HÀNG (VIETQR API - MIỄN PHÍ)
  useEffect(() => {
    if (isOpen) {
      fetch('https://api.vietqr.io/v2/banks')
        .then(res => res.json())
        .then(data => {
          if (data.code === '00') {
            setBankList(data.data); // data.data chứa mảng các ngân hàng
          }
        })
        .catch(err => console.error('Lỗi tải danh sách ngân hàng:', err));
    }
  }, [isOpen]);

  // Xử lý click ra ngoài để đóng dropdown ngân hàng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lọc ngân hàng theo từ khóa
  const filteredBanks = bankList.filter(bank => 
    bank.shortName?.toLowerCase().includes(searchBank.toLowerCase()) || 
    bank.name?.toLowerCase().includes(searchBank.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedBank || !accountNumber || !accountName) {
      alert("Vui lòng điền đầy đủ thông tin hoàn tiền!");
      return;
    }
    // Gộp data và gửi lên hàm submitCancelOrder ở OrderHistory
    onSubmit({
      bankName: selectedBank.shortName,
      accountNumber: accountNumber,
      accountName: accountName
    });
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-fadeIn">
        <h3 className="text-2xl font-black text-rose-600 mb-2 flex items-center gap-2">
          <span>💸</span> Yêu cầu hoàn tiền
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Đơn hàng <strong className="text-slate-800">#{order._id.substring(order._id.length - 8).toUpperCase()}</strong> đã thanh toán. Vui lòng cung cấp tài khoản để chúng tôi hoàn tiền.
        </p>
        
        <div className="space-y-5">
          {/* TRƯỜNG CHỌN NGÂN HÀNG (VẪN GIỮ MENU DROPDOWN CÓ LOGO) */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1">Ngân hàng / Ví điện tử *</label>
            
            <div 
              onClick={() => setIsDropdownOpen(true)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-rose-400 transition-colors"
            >
              {selectedBank ? (
                <div className="flex items-center gap-3">
                  <img src={selectedBank.logo} alt={selectedBank.shortName} className="h-6 w-auto object-contain bg-white rounded shadow-sm p-0.5" />
                  <span className="font-bold text-slate-800">{selectedBank.shortName}</span>
                </div>
              ) : (
                <span className="text-slate-400">Chọn ngân hàng...</span>
              )}
              <span className="text-slate-400">▼</span>
            </div>

            {/* DROPDOWN DANH SÁCH NGÂN HÀNG */}
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

          {/* TRƯỜNG NHẬP SỐ TÀI KHOẢN TỰ DO */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Số tài khoản / Số điện thoại *</label>
            <input 
              type="text" 
              placeholder="Nhập số tài khoản..." 
              value={accountNumber} 
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-rose-400 font-mono text-lg" 
            />
          </div>

          {/* TRƯỜNG NHẬP TÊN CHỦ TÀI KHOẢN TỰ DO */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tên chủ tài khoản *</label>
            <input 
              type="text" 
              placeholder="VD: NGUYEN VAN A" 
              value={accountName} 
              // Tự động in hoa khi khách nhập
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-rose-400 uppercase" 
            />
          </div>
        </div>

        {/* NÚT THAO TÁC */}
        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose} 
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!selectedBank || !accountNumber || !accountName} 
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;