import React from 'react';
import { useManageUsers } from '../hooks/useManageUsers';

const ManageUsers = () => {
  const {
    users, totalUsers, loading,
    search, setSearch, roleFilter, setRoleFilter,
    hasMore, loadMore, filterButtons, getFilterTitle,
    handleRoleChange, handleDeleteUser, handleViewInsight
  } = useManageUsers();

  return (
    <div className="bg-sky-200 min-h-screen p-4 sm:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* =========================================================
            1. THANH TIÊU ĐỀ CHÍNH (HEADER)
            ========================================================= */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
              <span className="bg-sky-100 p-2 rounded-xl shadow-sm">👥</span> Quản Trị Người Dùng
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Quản lý phân quyền và xử lý tài khoản hệ thống ({totalUsers} thành viên).
            </p>
          </div>

          {/* Ô TÌM KIẾM THÔNG MINH */}
          <div className="w-full md:w-80">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 select-none">🔍</span>
              <input
                type="text"
                placeholder="Tìm tên, ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-sky-50/50 border border-sky-100 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all text-sm font-medium shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            2. BỘ LỌC PHÂN LOẠI THEO VAI TRÒ (FILTERS)
            ========================================================= */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterButtons.map((btn) => (
            <button
              key={btn.key} // ĐÃ SỬA: Đổi từ btn.value thành btn.key
              onClick={() => setRoleFilter(btn.key)} // ĐÃ SỬA LỖI LỌC
              className={`px-5 py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 shadow-sm active:scale-95 flex items-center gap-2 ${
                roleFilter === btn.key
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                  : 'bg-white text-slate-600 border-sky-200 hover:bg-sky-50'
              }`}
            >
              <span>{btn.icon}</span> {btn.label} ({btn.count})
            </button>
          ))}
        </div>

        {/* =========================================================
            3. BẢNG DỮ LIỆU TÁI CẤU TRÚC UX/UI (DATA TABLE)
            ========================================================= */}
        <div className="bg-white rounded-3xl border border-sky-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-sky-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Thông tin Người dùng</th>
                  <th className="px-6 py-4 text-left">Vai trò hệ thống</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50 text-sm font-medium">
                {users.length === 0 && !loading ? (
                  <tr>
                    {/* Đã giảm colSpan xuống 3 do bỏ 1 cột */}
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-semibold italic bg-slate-50/30">
                      Không tìm thấy người dùng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    return (
                      <tr key={user._id} className="hover:bg-sky-50/20 transition-colors group">
                        
                        {/* CỘT 1: THÔNG TIN NGƯỜI DÙNG (GỘP AVATAR + TÊN + EMAIL) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar_url || user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm bg-slate-50 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm">{user.name || 'Người dùng Amazon'}</span>
                              <span className="text-xs text-slate-400 font-semibold mt-0.5">
                                @{user.username || 'unknown'} • {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* CỘT 2: VAI TRÒ HỆ THỐNG (SELECT ĐỔI MÀU BIẾN THÀNH BADGE) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, Number(e.target.value))}
                            className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all shadow-sm ${
                              user.role === 2 ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-200' :
                              user.role === 1 ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-200' :
                              'bg-sky-50 text-sky-700 border-sky-200 focus:ring-sky-200'
                            }`}
                          >
                            <option value={0}>🛒 Khách hàng</option>
                            <option value={1}>🏪 Người bán</option>
                            <option value={2}>🛡️ Quản trị viên</option>
                          </select>
                        </td>

                        {/* CỘT 3: THAO TÁC CĂN PHẢI (ACTIONS) */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewInsight(user)}
                              className="bg-white hover:bg-sky-600 text-sky-700 hover:text-white font-bold text-xs border border-sky-200 hover:border-sky-600 px-3 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1"
                              title="Xem phân tích hành vi AI"
                            >
                              📊 Insight
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="bg-white hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs border border-rose-200 hover:border-rose-600 px-3 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1"
                              title="Xóa tài khoản vĩnh viễn"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* HIỆU ỨNG LOADING TRONG BẢNG */}
          {loading && (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-white border-t border-sky-100">
               <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <span className="text-sky-700 font-bold animate-pulse">Đang đồng bộ dữ liệu...</span>
            </div>
          )}

          {/* NÚT TẢI THÊM PHÂN TRANG (PAGINATION) */}
          {!loading && hasMore && (
            <div className="p-6 text-center border-t border-sky-100 bg-white">
              <button
                onClick={loadMore}
                className="text-sky-700 hover:text-white bg-white hover:bg-sky-600 font-bold text-sm border border-sky-200 hover:border-sky-500 px-8 py-2.5 rounded-full shadow-sm transition-all active:scale-95"
              >
                Tải thêm kết quả
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageUsers;