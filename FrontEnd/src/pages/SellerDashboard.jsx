import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// CHỈ IMPORT COMPONENT AI CẦN THIẾT
import NewProductLaunch from '../pages/NewProductLaunch';

const SellerDashboard = () => {
  // KHỞI TẠO STATE QUẢN LÝ TAB
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="bg-sky-200 min-h-screen text-slate-800">
      
      {/* =========================================================
          1. THANH ĐIỀU HƯỚNG TÙY BIẾN (CHỈ HIỆN KHI Ở TRONG KHU VỰC AI)
          ========================================================= */}
      {activeTab !== 'menu' && (
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sky-200 pt-4 px-4 sm:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto">
            
            <button
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-sky-700 hover:text-sky-900 font-bold mb-4 transition-colors"
            >
              <span className="text-xl">🔙</span> Về Bảng Điều Khiển Của Tôi
            </button>

            <div className="flex overflow-x-auto gap-2 pb-3 custom-scrollbar">
              <button 
                onClick={() => setActiveTab('new_product')} 
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm ${
                  activeTab === 'new_product' 
                    ? 'bg-rose-500 text-white shadow-rose-500/30' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                🚀 Phân Tích Sản Phẩm Mới
              </button>
              
              {/* Nút mờ chuẩn bị cho tương lai (Bạn có thể bỏ đi nếu không thích) */}
              <button 
                disabled
                className="whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-50 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed border-dashed"
              >
                📊 (Sắp ra mắt) Phân tích đối thủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          2. MENU GRID (TRANG CHỦ SELLER)
          ========================================================= */}
      {activeTab === 'menu' && (
        <div className="p-4 sm:p-8 animate-fadeIn">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-200 flex flex-col md:flex-row items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                🏪
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-sky-800">
                  Quản Trị Gian Hàng (Seller Center)
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Trung tâm điều hành mọi hoạt động kinh doanh và AI phân tích</p>
              </div>
            </div>

            {/* KHU VỰC 1: NGHIỆP VỤ BÁN HÀNG CƠ BẢN CỦA SELLER */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                <span className="bg-emerald-100 p-2 rounded-lg">🛒</span> Nghiệp Vụ Bán Hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 hover:border-sky-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">📦</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Sản Phẩm Của Tôi</h3>
                  <Link to="/seller/my-products" className="text-sky-600 font-bold text-sm flex items-center gap-1 group-hover:text-sky-800">
                    Quản lý kho hàng <span>&rarr;</span>
                  </Link>
                </div>
                
                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 hover:border-amber-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">➕</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Đăng Sản Phẩm Mới</h3>
                  <Link to="/admin/add-product" className="text-amber-600 font-bold text-sm flex items-center gap-1 group-hover:text-amber-800">
                    Thêm sản phẩm <span>&rarr;</span>
                  </Link>
                </div>
                
                <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 hover:border-rose-400 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">📋</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Đơn Hàng Của Tôi</h3>
                  <Link to="/seller/orders" className="text-rose-600 font-bold text-sm flex items-center gap-1 group-hover:text-rose-800">
                    Xử lý đơn hàng <span>&rarr;</span>
                  </Link>
                </div>
                
              </div>
            </div>

            {/* KHU VỰC 2: CÔNG CỤ AI DÀNH RIÊNG CHO SELLER */}
            <div className="bg-indigo-50/30 p-6 md:p-8 rounded-3xl border border-indigo-200 shadow-sm relative overflow-hidden">
              {/* Hiệu ứng nền trang trí */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

              <h2 className="text-xl font-black text-indigo-900 mb-6 border-b border-indigo-100 pb-4 flex items-center gap-2 relative z-10">
                <span className="bg-indigo-100 p-2 rounded-lg">🤖</span> Trợ Lý AI: Phân Tích Thị Trường
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {/* Thẻ Đánh giá sản phẩm mới */}
                <div 
                  onClick={() => setActiveTab('new_product')} 
                  className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-indigo-300 shadow-sm hover:shadow-lg cursor-pointer transition-all group"
                >
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:-translate-y-1 transition-transform">🚀</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Đánh Giá Sản Phẩm Mới</h3>
                  <p className="text-slate-500 text-sm mb-6 h-10 leading-relaxed">
                    Kiểm tra độ HOT và dự báo mức độ rủi ro trước khi nhập hàng.
                  </p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2.5 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Kiểm Tra Ngay <span>&rarr;</span>
                  </div>
                </div>

               

              </div>

            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          3. RENDER CÁC COMPONENT AI
          ========================================================= */}
      <div className={activeTab !== 'menu' ? 'pt-6 pb-12' : ''}>
        {activeTab === 'new_product' && <div className="animate-fadeIn -mt-4"><NewProductLaunch /></div>}
      </div>

    </div>
  );
};

export default SellerDashboard;