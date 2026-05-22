import React from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';

const UserProfile = () => {
  // Lấy toàn bộ dữ liệu và hàm xử lý từ Custom Hook
  const {
    user,
    name, setName,
    isUpdatingName,
    passwords, setPasswords,
    isUpdatingPass,
    handleUpdateName,
    handleUpdatePassword
  } = useUserProfile();

  return (
    <div className="bg-slate-900 min-h-screen p-4 md:p-8 text-slate-200 flex justify-center items-start">
      <div className="w-full max-w-3xl space-y-8 mt-10">
        
        {/* TIÊU ĐỀ */}
        <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3 border-b border-slate-700 pb-4">
          <span>👤</span> Hồ Sơ Cá Nhân
        </h1>

        {/* NÚT BẤM SANG TRANG LỊCH SỬ TƯƠNG TÁC */}
        <Link 
          to="/interaction-history" 
          className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-blue-400 px-4 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2 w-fit"
        >
          <span>🕒</span> Lịch Sử Tương Tác
        </Link>

        {/* KHU VỰC CHỨA 2 KHỐI FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
          <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Thông Tin Cơ Bản</h2>
            
            <form onSubmit={handleUpdateName} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên hiển thị</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Email đăng nhập (Không thể đổi)</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed outline-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isUpdatingName}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {isUpdatingName ? "⏳ Đang cập nhật..." : "💾 Lưu Thay Đổi"}
              </button>
            </form>
          </div>

          {/* KHỐI 2: ĐỔI MẬT KHẨU */}
          <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl">
            <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <span>🔒</span> Đổi Mật Khẩu
            </h2>
            
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mật khẩu hiện tại *</label>
                <input 
                  type="password" 
                  value={passwords.oldPassword} 
                  onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Mật khẩu mới *</label>
                <input 
                  type="password" 
                  value={passwords.newPassword} 
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors" 
                  required
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Xác nhận mật khẩu mới *</label>
                <input 
                  type="password" 
                  value={passwords.confirmPassword} 
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors" 
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isUpdatingPass}
                className="w-full bg-slate-700 border border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isUpdatingPass ? "⏳ Đang xử lý..." : "🔑 Đổi Mật Khẩu"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;