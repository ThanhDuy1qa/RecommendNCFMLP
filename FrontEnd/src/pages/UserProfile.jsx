import React, { useState, useEffect } from 'react'; // 🌟 ĐÃ SỬA: Thêm useEffect vào đây
import { Link } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';

const UserProfile = () => {
  const {
    user,
    name, setName,
    isUpdatingName,
    passwords, setPasswords,
    isUpdatingPass,
    handleUpdateName,
    handleUpdatePassword,
    phone, setPhone, 
    address, setAddress
  } = useUserProfile();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isRequestingEmail, setIsRequestingEmail] = useState(false); 
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const [liveBalance, setLiveBalance] = useState(0);

  const handleRequestEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert("Vui lòng nhập một địa chỉ email hợp lệ!");
      return;
    }

    try {
      setIsRequestingEmail(true);
      const response = await fetch('http://localhost:5000/api/request-email-change', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newEmail })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || "Đã gửi link xác nhận vào email mới. Vui lòng kiểm tra hộp thư!");
        setShowEmailModal(false);
        setNewEmail(''); 
      } else {
        alert(data.message || "Có lỗi xảy ra khi yêu cầu đổi email.");
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ.");
    } finally {
      setIsRequestingEmail(false);
    }
  };

  // 🌟 ĐOẠN CODE LẤY SỐ DƯ REAL-TIME
  useEffect(() => {
    if (user) {
      setLiveBalance(user.walletBalance || 0); // Gán số dư ban đầu
      
      const fetchBalance = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5000/api/users/wallet-balance', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setLiveBalance(data.balance); // Cập nhật số dư mới mỗi 3s
          }
        } catch (error) {
          // Bỏ qua lỗi mạng để không làm phiền người dùng
        }
      };
      fetchBalance();
      const interval = setInterval(fetchBalance, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="bg-sky-200 min-h-screen p-4 md:p-8 text-slate-800 flex justify-center items-start">
      <div className="w-full max-w-4xl space-y-6 mt-4 md:mt-10">
        
        {/* TẦNG 1: TIÊU ĐỀ & AVATAR & CÁC NÚT LỊCH SỬ NHỎ */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-sky-300 pb-6">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 bg-white border border-sky-300 rounded-full flex items-center justify-center text-3xl shadow-sm shrink-0">
              😎
            </div>
            <div>
              <h1 className="text-3xl font-black text-sky-800">Hồ Sơ Cá Nhân</h1>
              <p className="text-sm font-medium text-slate-600 mt-1">Quản lý thông tin và bảo mật tài khoản</p>
            </div>
          </div>

          <div className="flex justify-center gap-3 w-full md:w-auto">
            <Link 
              to="/interaction-history" 
              className="bg-white hover:bg-sky-50 border border-sky-300 text-sky-700 px-4 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 text-sm"
            >
              <span>💬</span> Đánh Giá
            </Link>

            <Link 
              to="/order-history" 
              className="bg-white hover:bg-sky-50 border border-sky-300 text-sky-700 px-4 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 text-sm"
            >
              <span>🧾</span> Lịch Sử Mua
            </Link>
          </div>
        </div>

        {/* 🌟 TẦNG 2: THẺ VÍ TIỀN */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-6 md:p-8 rounded-3xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 transform hover:scale-[1.01] transition-transform w-full">
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold opacity-90 mb-1 flex items-center justify-center md:justify-start gap-2">
              💳 Số Dư Ví Của Bạn
            </h2>
            <div className="text-4xl md:text-5xl font-black tracking-tight mt-2">
              {liveBalance.toLocaleString('vi-VN')} <span className="text-2xl md:text-3xl font-bold opacity-80">VNĐ</span>
            </div>
            <p className="text-sm opacity-90 mt-2 font-medium">Sử dụng ví để thanh toán đơn hàng ngay lập tức mà không cần chờ đợi.</p>
          </div>
          
          <button
           onClick={() => setIsDepositOpen(true)}
           className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
         >
           ➕ Nạp Thêm Tiền
         </button>
         <button
           onClick={() => setIsWithdrawOpen(true)}
           className="bg-teal-700/30 border border-teal-300 hover:bg-teal-700/50 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
         >
           💸 Rút Tiền
         </button>

        </div>

        {/* TẦNG 3: KHU VỰC CHỨA 2 KHỐI FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm h-fit">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="bg-sky-100 p-2 rounded-lg">📝</span> Thông Tin Cơ Bản
            </h2>
            
            <form onSubmit={handleUpdateName} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Tên hiển thị</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Số điện thoại giao hàng</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" 
                  placeholder="Nhập số điện thoại..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Địa chỉ mặc định</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  rows="2"
                  className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" 
                  placeholder="Nhập địa chỉ giao hàng..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-slate-600">Email đăng nhập</label>
                  <button 
                    type="button" 
                    onClick={() => setShowEmailModal(true)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-full border border-sky-200 transition-colors"
                  >
                    ✏️ Thay đổi
                  </button>
                </div>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3.5 text-slate-500 cursor-not-allowed outline-none" 
                  placeholder="Đang tải email..."
                />
              </div>

              {user?.role !== undefined && (
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">Vai trò tài khoản</label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-600 font-medium">
                    {user.role === 2 ? '👑 Quản trị viên (Admin)' : user.role === 1 ? '🏪 Người bán (Seller)' : '👤 Khách hàng'}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isUpdatingName}
                className="w-full mt-2 bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingName && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {isUpdatingName ? "Đang cập nhật..." : "💾 Lưu Thay Đổi"}
              </button>
            </form>
          </div>

          {/* KHỐI 2: ĐỔI MẬT KHẨU */}
          <div className="transition-all duration-300">
            {!showPasswordForm ? (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center justify-center text-center space-y-5 h-full min-h-[350px]">
                <span className="text-4xl bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm animate-bounce">🔒</span>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Bảo Mật & Mật Khẩu</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                    Bạn nên chủ động thay đổi mật khẩu định kỳ để gia tăng tính bảo mật bảo vệ tài sản cá nhân tốt hơn.
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-rose-500/20 transition-all text-sm active:scale-95"
                >
                  🔑 Tiến Hành Đổi Mật Khẩu
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm relative animate-fadeIn">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-rose-100 p-2 rounded-lg">🔒</span> Đổi Mật Khẩu
                  </h2>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                  >
                    ✕ Thu gọn
                  </button>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1.5">Mật khẩu hiện tại *</label>
                    <input 
                      type="password" 
                      value={passwords.oldPassword} 
                      onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
                      className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1.5">Mật khẩu mới *</label>
                    <input 
                      type="password" 
                      value={passwords.newPassword} 
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                      className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all" 
                      required
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1.5">Xác nhận mật khẩu mới *</label>
                    <input 
                      type="password" 
                      value={passwords.confirmPassword} 
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                      className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all" 
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUpdatingPass}
                    className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdatingPass && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {isUpdatingPass ? "Đang xử lý..." : "🔑 Xác Nhận Đổi Mật Khẩu"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL NHẬP EMAIL MỚI */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm border border-sky-200 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-4">Đổi Email Đăng Nhập</h3>
            <p className="text-sm text-slate-500 mb-6">
              Chúng tôi sẽ gửi một đường dẫn xác nhận vào địa chỉ email mới của bạn.
            </p>
            
            <input 
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-sky-50/50 border border-slate-200 rounded-xl p-3.5 mb-6 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              placeholder="Nhập email mới..."
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowEmailModal(false);
                  setNewEmail('');
                }}
                disabled={isRequestingEmail}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                onClick={handleRequestEmailChange}
                disabled={isRequestingEmail}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRequestingEmail && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {isRequestingEmail ? 'Đang gửi...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NẠP TIỀN */}
      <DepositModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
        user={user} 
      />

      <WithdrawModal 
     isOpen={isWithdrawOpen} 
     onClose={() => setIsWithdrawOpen(false)} 
     user={user} 
   />
    </div>
  );
};

export default UserProfile;