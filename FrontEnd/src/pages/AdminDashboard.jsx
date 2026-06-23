import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// IMPORT CÁC COMPONENT AI
import AiOverviewDashboard from './AiOverviewDashboard';
import AdminAiAnalytics from './AdminAiAnalytics';
import TrendComparison from './TrendComparison';
import InventoryAdvisor from './InventoryAdvisor';
import TargetedMarketing from './TargetedMarketing';
import NewProductLaunch from './NewProductLaunch';
import ManageUsers from './ManageUsers';

const AdminDashboard = () => {
  // KHỞI TẠO STATE QUẢN LÝ TAB
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="bg-sky-200 min-h-screen text-slate-800">
      
      {/* =========================================================
          1. THANH ĐIỀU HƯỚNG TÙY BIẾN (CHỈ HIỆN KHI Ở TRONG KHU VỰC AI/QUẢN LÝ)
          ========================================================= */}
      {activeTab !== 'menu' && (
        <div className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-sky-200 pt-4 px-4 sm:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto">
            
            {/* Nút quay lại Menu chính */}
            <button
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-sky-700 hover:text-sky-900 font-bold mb-4 transition-colors"
            >
              <span className="text-xl">🔙</span> Về Bảng Điều Khiển Cốt Lõi
            </button>

            {/* Dải Tab chuyển đổi nhanh giữa các công cụ */}
            <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar">
              {[
                { id: 'overview', icon: '📊', label: 'Tổng Quan AI' },
                { id: 'analytics', icon: '🧠', label: 'Phân tích Model' },
                { id: 'trend', icon: '📈', label: 'Xu hướng' },
                { id: 'inventory', icon: '📦', label: 'Tồn kho AI' },
                { id: 'marketing', icon: '🎯', label: 'Marketing' },
                { id: 'new_product', icon: '🚀', label: 'Sản phẩm mới' },
                { id: 'users', icon: '👥', label: 'Người dùng' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap pb-2 font-bold transition-all border-b-2 text-sm ${
                    activeTab === tab.id 
                    ? 'border-sky-600 text-sky-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          2. MENU GRID (TRANG CHỦ QUẢN TRỊ)
          ========================================================= */}
      {activeTab === 'menu' && (
        <div className="p-4 sm:p-8 animate-fadeIn">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Header Tổng */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-sky-200 flex flex-col md:flex-row items-center gap-4 mt-2">
              <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                ⚙️
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black text-sky-800">
                  Trung Tâm Quản Trị Hệ Thống
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Hệ thống quản lý sàn thương mại điện tử và phân tích trí tuệ nhân tạo.</p>
              </div>
            </div>

            {/* KHU VỰC 1: NGHIỆP VỤ CỐT LÕI */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                <span className="bg-emerald-100 p-2 rounded-lg">🏢</span> Nghiệp Vụ Cốt Lõi (E-Commerce)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 hover:border-emerald-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">📊</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Thống Kê Doanh Thu</h3>
                  <p className="text-slate-500 text-xs mb-4">Báo cáo doanh số và chỉ số bán hàng.</p>
                  <Link to="/stats" className="text-emerald-600 font-bold text-sm flex items-center gap-1 group-hover:text-emerald-800">Xem Thống Kê <span>&rarr;</span></Link>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">📦</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Quản Trị Toàn Sàn</h3>
                  <p className="text-slate-500 text-xs mb-4">Quản lý toàn bộ danh sách sản phẩm.</p>
                  <Link to="/admin/manage-products" className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:text-blue-800">Kho hàng <span>&rarr;</span></Link>
                </div>

                <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 hover:border-sky-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">🗂️</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Danh Mục Sản Phẩm</h3>
                  <p className="text-slate-500 text-xs mb-4">Sắp xếp và chỉnh sửa cây danh mục.</p>
                  <Link to="/admin/categories" className="text-sky-600 font-bold text-sm flex items-center gap-1 group-hover:text-sky-800">Cấu trúc danh mục <span>&rarr;</span></Link>
                </div>

                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 hover:border-amber-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">➕</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Đăng Sản Phẩm Mới</h3>
                  <p className="text-slate-500 text-xs mb-4">Thêm sản phẩm mới vào hệ thống.</p>
                  <Link to="/admin/add-product" className="text-amber-600 font-bold text-sm flex items-center gap-1 group-hover:text-amber-800">Thêm sản phẩm <span>&rarr;</span></Link>
                </div>

                <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 hover:border-rose-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">📋</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Kiểm Soát Đơn Hàng</h3>
                  <p className="text-slate-500 text-xs mb-4">Xử lý các giao dịch và vận chuyển.</p>
                  <Link to="/admin/orders" className="text-rose-600 font-bold text-sm flex items-center gap-1 group-hover:text-rose-800">Quản lý giao dịch <span>&rarr;</span></Link>
                </div>

                <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 hover:border-teal-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">💰</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Quản Lý Tài Chính</h3>
                  <p className="text-slate-500 text-xs mb-4">Kế toán đối soát, rút tiền và hoàn tiền.</p>
                  <Link to="/admin/finance" className="text-teal-600 font-bold text-sm flex items-center gap-1 group-hover:text-teal-800">Nghiệp vụ Kế toán <span>&rarr;</span></Link>
                </div>

                <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 hover:border-purple-400 hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveTab('users')}>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">👥</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Quản Lý Người Dùng</h3>
                  <p className="text-slate-500 text-xs mb-4">Phân quyền, cấp VIP, xử lý vi phạm.</p>
                  <span className="text-purple-600 font-bold text-sm flex items-center gap-1 group-hover:text-purple-800">Quản lý User <span>&rarr;</span></span>
                </div>

              </div>
            </div>

            {/* KHU VỰC 2: HỆ SINH THÁI AI */}
            <div className="bg-indigo-50/30 p-6 md:p-8 rounded-3xl border border-indigo-200 shadow-sm relative overflow-hidden">
              {/* Ánh sáng nền */}
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

              <h2 className="text-xl font-black text-indigo-900 mb-6 border-b border-indigo-100 pb-4 flex items-center gap-2 relative z-10">
                <span className="bg-indigo-100 p-2 rounded-lg">🤖</span> Hệ Sinh Thái Trí Tuệ Nhân Tạo
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                
                <div onClick={() => setActiveTab('overview')} className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-indigo-300 shadow-sm hover:shadow-lg cursor-pointer transition-all group">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:-translate-y-1 transition-transform">🧠</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Dashboard Tổng Quan</h3>
                  <p className="text-slate-500 text-sm mb-6 h-10 leading-relaxed">Theo dõi hiệu năng và mô hình AI tốt nhất.</p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2.5 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Mở Dashboard <span>&rarr;</span>
                  </div>
                </div>

                <div onClick={() => setActiveTab('analytics')} className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-indigo-300 shadow-sm hover:shadow-lg cursor-pointer transition-all group">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:-translate-y-1 transition-transform">🔍</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Phân Tích Thuật Toán</h3>
                  <p className="text-slate-500 text-sm mb-6 h-10 leading-relaxed">Theo dõi luồng phân phối gợi ý AI.</p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2.5 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Xem Báo Cáo <span>&rarr;</span>
                  </div>
                </div>

                <div onClick={() => setActiveTab('trend')} className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-indigo-300 shadow-sm hover:shadow-lg cursor-pointer transition-all group">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:-translate-y-1 transition-transform">📈</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">So Sánh Xu Hướng</h3>
                  <p className="text-slate-500 text-sm mb-6 h-10 leading-relaxed">Lịch sử vs Dự đoán AI trong tương lai.</p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2.5 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    So Sát Ma Trận <span>&rarr;</span>
                  </div>
                </div>

                <div onClick={() => setActiveTab('inventory')} className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-indigo-300 shadow-sm hover:shadow-lg cursor-pointer transition-all group">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:-translate-y-1 transition-transform">📦</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Trợ Lý Nhập Hàng</h3>
                  <p className="text-slate-500 text-sm mb-6 h-10 leading-relaxed">Quyết định chiến lược dồn vốn tồn kho.</p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2.5 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Gợi Ý Nhập Hàng <span>&rarr;</span>
                  </div>
                </div>

                <div onClick={() => setActiveTab('marketing')} className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-indigo-300 shadow-sm hover:shadow-lg cursor-pointer transition-all group">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:-translate-y-1 transition-transform">🎯</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Mục Tiêu Marketing</h3>
                  <p className="text-slate-500 text-sm mb-6 h-10 leading-relaxed">Xuất tệp khách hàng tiềm năng chạy Ads.</p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2.5 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Lấy Tệp Khách <span>&rarr;</span>
                  </div>
                </div>

                <div onClick={() => setActiveTab('new_product')} className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-indigo-300 shadow-sm hover:shadow-lg cursor-pointer transition-all group">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:-translate-y-1 transition-transform">🚀</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Ra Mắt Sản Phẩm Mới</h3>
                  <p className="text-slate-500 text-sm mb-6 h-10 leading-relaxed">Đánh giá rủi ro (Cold-Start) cho hàng mới.</p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2.5 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Giả Lập AI <span>&rarr;</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          3. RENDER CÁC COMPONENT AI VÀ USER
          ========================================================= */}
      <div className={activeTab !== 'menu' ? 'pt-6 pb-12' : ''}>
        {activeTab === 'overview' && <div className="animate-fadeIn -mt-4"><AiOverviewDashboard /></div>}
        {activeTab === 'analytics' && <div className="animate-fadeIn -mt-4"><AdminAiAnalytics /></div>}
        {activeTab === 'trend' && <div className="animate-fadeIn -mt-4"><TrendComparison /></div>}
        {activeTab === 'inventory' && <div className="animate-fadeIn -mt-4"><InventoryAdvisor /></div>}
        {activeTab === 'marketing' && <div className="animate-fadeIn -mt-4"><TargetedMarketing /></div>}
        {activeTab === 'new_product' && <div className="animate-fadeIn -mt-4"><NewProductLaunch /></div>}
        {activeTab === 'users' && <div className="animate-fadeIn -mt-4"><ManageUsers /></div>}
      </div>

    </div>
  );
};

export default AdminDashboard;