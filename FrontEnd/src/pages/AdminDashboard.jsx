import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// IMPORT CÁC COMPONENT AI
import AiOverviewDashboard from './AiOverviewDashboard';
import AdminAiAnalytics from './AdminAiAnalytics';
import TrendComparison from './TrendComparison';
import InventoryAdvisor from './InventoryAdvisor';
import TargetedMarketing from './TargetedMarketing';
import NewProductLaunch from './NewProductLaunch';

const AdminDashboard = () => {
  // KHỞI TẠO STATE QUẢN LÝ TAB
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200">
      
      {/* =========================================================
          1. THANH ĐIỀU HƯỚNG TÙY BIẾN (CHỈ HIỆN KHI Ở TRONG KHU VỰC AI)
          ========================================================= */}
      {activeTab !== 'menu' && (
        <div className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-700 pt-4 px-4 sm:px-8 shadow-md">
          <div className="max-w-7xl mx-auto">
            
            {/* Nút quay lại Menu chính */}
            <button
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-bold mb-4 transition-colors"
            >
              <span className="text-xl">🔙</span> Về Bảng Điều Khiển Cốt Lõi
            </button>

            {/* Dải Tab chuyển đổi nhanh giữa các công cụ AI */}
            <div className="flex overflow-x-auto gap-2 pb-3 scrollbar-hide">
              <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                🧠 Dashboard
              </button>
              <button onClick={() => setActiveTab('analytics')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'analytics' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                🔍 Phân Tích Thuật Toán
              </button>
              <button onClick={() => setActiveTab('trend')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'trend' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                📈 So Sánh Xu Hướng
              </button>
              <button onClick={() => setActiveTab('inventory')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'inventory' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                📦 Gợi Ý Nhập Hàng
              </button>
              <button onClick={() => setActiveTab('marketing')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'marketing' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                🎯 Mục Tiêu Marketing
              </button>
              <button onClick={() => setActiveTab('new_product')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'new_product' ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                🚀 Ra Mắt SP Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          2. MENU GRID (TRANG CHỦ QUẢN TRỊ)
          ========================================================= */}
      {activeTab === 'menu' && (
        <div className="p-4 sm:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <h1 className="text-3xl font-black text-blue-400 flex items-center gap-3">
              <span>⚙️</span> Trung Tâm Quản Trị Hệ Thống
            </h1>

            {/* KHU VỰC 1: NGHIỆP VỤ CỐT LÕI (Thống kê, Sản phẩm, Đơn hàng...) */}
            <div>
              <h2 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                <span>🏢</span> Nghiệp Vụ Cốt Lõi (E-Commerce)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-green-500 transition-all">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-lg font-bold text-white mb-2">Thống Kê Doanh Thu</h3>
                  <Link to="/stats" className="text-green-400 font-bold text-sm hover:underline">Xem Thống Kê ➡️</Link>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all">
                  <div className="text-3xl mb-3">📦</div>
                  <h3 className="text-lg font-bold text-white mb-2">Quản Trị Toàn Sàn</h3>
                  <Link to="/admin/manage-products" className="text-blue-400 font-bold text-sm hover:underline">Kho hàng ➡️</Link>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-all">
                  <div className="text-3xl mb-3">🗂️</div>
                  <h3 className="text-lg font-bold text-white mb-2">Danh Mục Sản Phẩm</h3>
                  <Link to="/admin/categories" className="text-emerald-400 font-bold text-sm hover:underline">Cấu trúc danh mục ➡️</Link>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 transition-all">
                  <div className="text-3xl mb-3">➕</div>
                  <h3 className="text-lg font-bold text-white mb-2">Đăng Sản Phẩm Mới</h3>
                  <Link to="/admin/add-product" className="text-orange-400 font-bold text-sm hover:underline">Thêm sản phẩm ➡️</Link>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-red-500 transition-all">
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="text-lg font-bold text-white mb-2">Kiểm Soát Đơn Hàng</h3>
                  <Link to="/admin/orders" className="text-red-400 font-bold text-sm hover:underline">Quản lý giao dịch ➡️</Link>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-purple-500 transition-all">
                  <div className="text-3xl mb-3">👥</div>
                  <h3 className="text-lg font-bold text-white mb-2">Insight Khách Hàng</h3>
                  <Link to="/admin/customer-insight" className="text-purple-400 font-bold text-sm hover:underline">Tra cứu User ➡️</Link>
                </div>
              </div>
            </div>

            {/* KHU VỰC 2: HỆ SINH THÁI AI (Tất cả Card AI được gom vào đây) */}
            <div className="bg-slate-800/30 p-6 rounded-3xl border border-indigo-500/20">
              <h2 className="text-xl font-bold text-indigo-300 mb-6 border-b border-indigo-500/30 pb-2 flex items-center gap-2">
                <span>🤖</span> Hệ Sinh Thái Trí Tuệ Nhân Tạo (AI Tools)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card 1 */}
                <div onClick={() => setActiveTab('overview')} className="bg-slate-800 p-6 rounded-2xl border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧠</div>
                  <h3 className="text-lg font-bold text-white mb-1">Dashboard Tổng Quan</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Theo dõi hiệu năng và mô hình AI tốt nhất.</p>
                  <span className="text-indigo-400 font-bold text-sm">Mở Dashboard ➡️</span>
                </div>

                {/* Card 2 */}
                <div onClick={() => setActiveTab('analytics')} className="bg-slate-800 p-6 rounded-2xl border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
                  <h3 className="text-lg font-bold text-white mb-1">Phân Tích Thuật Toán</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Theo dõi luồng phân phối gợi ý AI.</p>
                  <span className="text-cyan-400 font-bold text-sm">Xem Báo Cáo ➡️</span>
                </div>

                {/* Card 3 */}
                <div onClick={() => setActiveTab('trend')} className="bg-slate-800 p-6 rounded-2xl border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📈</div>
                  <h3 className="text-lg font-bold text-white mb-1">So Sánh Xu Hướng</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Lịch sử vs Dự đoán AI trong tương lai.</p>
                  <span className="text-emerald-400 font-bold text-sm">So Sát Ma Trận ➡️</span>
                </div>

                {/* Card 4 */}
                <div onClick={() => setActiveTab('inventory')} className="bg-slate-800 p-6 rounded-2xl border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📦</div>
                  <h3 className="text-lg font-bold text-white mb-1">Trợ Lý Nhập Hàng</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Quyết định chiến lược dồn vốn tồn kho.</p>
                  <span className="text-orange-400 font-bold text-sm">Gợi Ý Nhập Hàng ➡️</span>
                </div>

                {/* Card 5 (MỚI) */}
                <div onClick={() => setActiveTab('marketing')} className="bg-slate-800 p-6 rounded-2xl border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                  <h3 className="text-lg font-bold text-white mb-1">Mục Tiêu Marketing</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Xuất tệp khách hàng tiềm năng chạy Ads.</p>
                  <span className="text-purple-400 font-bold text-sm">Lấy Tệp Khách ➡️</span>
                </div>

                {/* Card 6 (MỚI) */}
                <div onClick={() => setActiveTab('new_product')} className="bg-slate-800 p-6 rounded-2xl border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
                  <h3 className="text-lg font-bold text-white mb-1">Ra Mắt Sản Phẩm Mới</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Đánh giá rủi ro (Cold-Start) cho hàng mới.</p>
                  <span className="text-pink-400 font-bold text-sm">Giả Lập AI ➡️</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          3. RENDER CÁC COMPONENT AI
          ========================================================= */}
      <div className={activeTab !== 'menu' ? 'pt-6' : ''}>
        {activeTab === 'overview' && <div className="animate-fade-in -mt-4"><AiOverviewDashboard /></div>}
        {activeTab === 'analytics' && <div className="animate-fade-in -mt-4"><AdminAiAnalytics /></div>}
        {activeTab === 'trend' && <div className="animate-fade-in -mt-4"><TrendComparison /></div>}
        {activeTab === 'inventory' && <div className="animate-fade-in -mt-4"><InventoryAdvisor /></div>}
        {activeTab === 'marketing' && <div className="animate-fade-in -mt-4"><TargetedMarketing /></div>}
        {activeTab === 'new_product' && <div className="animate-fade-in -mt-4"><NewProductLaunch /></div>}
      </div>

    </div>
  );
};

export default AdminDashboard;