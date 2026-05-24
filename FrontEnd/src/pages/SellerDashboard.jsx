import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// IMPORT CÁC COMPONENT AI (Dùng chung với Admin)
// Lưu ý: Đảm bảo đường dẫn import chính xác tùy thuộc vào cấu trúc thư mục của bạn
import TrendComparison from '../pages/TrendComparison';
import TargetedMarketing from '../pages/TargetedMarketing';
import InventoryAdvisor from '../pages/InventoryAdvisor';
import NewProductLaunch from '../pages/NewProductLaunch';
const SellerDashboard = () => {
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
            
            <button
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-bold mb-4 transition-colors"
            >
              <span className="text-xl">🔙</span> Về Bảng Điều Khiển Của Tôi
            </button>

            <div className="flex overflow-x-auto gap-2 pb-3 scrollbar-hide">
              <button onClick={() => setActiveTab('trend')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'trend' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                📈 So Sánh Xu Hướng Của Tôi
              </button>
              <button onClick={() => setActiveTab('marketing')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'marketing' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                🎯 Tệp Khách Hàng Tiềm Năng
              </button>
              <button onClick={() => setActiveTab('inventory')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'inventory' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                📦 Lời Khuyên Nhập Hàng
              </button>
              <button onClick={() => setActiveTab('new_product')} className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'new_product' ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                🚀 Phân Tích Sản Phẩm Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          2. MENU GRID (TRANG CHỦ SELLER)
          ========================================================= */}
      {activeTab === 'menu' && (
        <div className="p-4 sm:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <h1 className="text-3xl font-black text-blue-400 flex items-center gap-3">
              <span>🏪</span> Quản Trị Gian Hàng (Seller Center)
            </h1>

            {/* KHU VỰC 1: NGHIỆP VỤ BÁN HÀNG CƠ BẢN CỦA SELLER */}
            <div>
              <h2 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                <span>🛒</span> Nghiệp Vụ Bán Hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all">
                  <div className="text-3xl mb-3">📦</div>
                  <h3 className="text-lg font-bold text-white mb-2">Sản Phẩm Của Tôi</h3>
                  <Link to="/seller/products" className="text-blue-400 font-bold text-sm hover:underline">Quản lý kho hàng ➡️</Link>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 transition-all">
                  <div className="text-3xl mb-3">➕</div>
                  <h3 className="text-lg font-bold text-white mb-2">Đăng Sản Phẩm Mới</h3>
                  <Link to="/seller/add-product" className="text-orange-400 font-bold text-sm hover:underline">Thêm sản phẩm ➡️</Link>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-red-500 transition-all">
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="text-lg font-bold text-white mb-2">Đơn Hàng Của Tôi</h3>
                  <Link to="/seller/orders" className="text-red-400 font-bold text-sm hover:underline">Xử lý đơn hàng ➡️</Link>
                </div>
              </div>
            </div>

            {/* KHU VỰC 2: CÔNG CỤ AI DÀNH RIÊNG CHO SELLER */}
            <div className="bg-slate-800/30 p-6 rounded-3xl border border-emerald-500/20">
              <h2 className="text-xl font-bold text-emerald-300 mb-6 border-b border-emerald-500/30 pb-2 flex items-center gap-2">
                <span>🤖</span> Trợ Lý AI Dành Cho Nhà Bán Hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Các tính năng được "mở khóa" cho Seller */}
                <div onClick={() => setActiveTab('trend')} className="bg-slate-800 p-6 rounded-2xl border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📈</div>
                  <h3 className="text-lg font-bold text-white mb-1">Xu Hướng Của Tôi</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Phân tích tiềm năng các sản phẩm bạn đang bán.</p>
                  <span className="text-emerald-400 font-bold text-sm">Xem Phân Tích ➡️</span>
                </div>

                <div onClick={() => setActiveTab('marketing')} className="bg-slate-800 p-6 rounded-2xl border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                  <h3 className="text-lg font-bold text-white mb-1">Mục Tiêu Quảng Cáo</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Lấy tệp khách hàng tiềm năng cho sản phẩm của bạn.</p>
                  <span className="text-purple-400 font-bold text-sm">Lấy Tệp Khách ➡️</span>
                </div>

                <div onClick={() => setActiveTab('inventory')} className="bg-slate-800 p-6 rounded-2xl border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📦</div>
                  <h3 className="text-lg font-bold text-white mb-1">Kế Hoạch Nhập Hàng</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">AI tư vấn số lượng nhập hàng tối ưu.</p>
                  <span className="text-orange-400 font-bold text-sm">Nhận Lời Khuyên ➡️</span>
                </div>

                <div onClick={() => setActiveTab('new_product')} className="bg-slate-800 p-6 rounded-2xl border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:-translate-y-1 cursor-pointer transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
                  <h3 className="text-lg font-bold text-white mb-1">Đánh Giá Sản Phẩm Mới</h3>
                  <p className="text-slate-400 text-xs mb-4 h-8">Kiểm tra độ HOT của sản phẩm bạn sắp bán.</p>
                  <span className="text-pink-400 font-bold text-sm">Kiểm Tra Ngay ➡️</span>
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
        {activeTab === 'trend' && <div className="animate-fade-in -mt-4"><TrendComparison /></div>}
        {activeTab === 'inventory' && <div className="animate-fade-in -mt-4"><InventoryAdvisor /></div>}
        {activeTab === 'marketing' && <div className="animate-fade-in -mt-4"><TargetedMarketing /></div>}
        {activeTab === 'new_product' && <div className="animate-fade-in -mt-4"><NewProductLaunch /></div>}
      </div>

    </div>
  );
};

export default SellerDashboard;