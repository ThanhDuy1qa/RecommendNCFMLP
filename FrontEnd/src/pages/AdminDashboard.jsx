import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="bg-slate-900 min-h-screen p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-8 flex items-center gap-3 border-b border-slate-700 pb-4">
          <span>⚙️</span> Bảng Điều Khiển Quản Trị Viên
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Block 1: Quản lý Sản phẩm */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-blue-500 transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-bold mb-2 text-white">Quản Trị Toàn Sàn</h2>
            <p className="text-slate-400 mb-6 text-sm h-10">Kiểm soát, sửa đổi hoặc gỡ bỏ toàn bộ sản phẩm trên hệ thống.</p>
            <Link 
              to="/admin/manage-products" 
              className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl font-bold inline-block w-full text-center transition-colors border border-blue-600/50"
            >
              Quản lý Kho hàng
            </Link>
          </div>

          {/* Block 2: Quản lý Danh mục */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-emerald-500 transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">🗂️</div>
            <h2 className="text-xl font-bold mb-2 text-white">Danh Mục Sản Phẩm</h2>
            <p className="text-slate-400 mb-6 text-sm h-10">Thêm mới, cập nhật hình ảnh và cấu trúc danh mục trang chủ.</p>
            <Link 
              to="/admin/categories" 
              className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-5 py-2.5 rounded-xl font-bold inline-block w-full text-center transition-colors border border-emerald-600/50"
            >
              Quản lý Danh mục
            </Link>
          </div>

          {/* Block 3: Thêm Sản phẩm mới */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-orange-500 transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">➕</div>
            <h2 className="text-xl font-bold mb-2 text-white">Đăng Sản Phẩm</h2>
            <p className="text-slate-400 mb-6 text-sm h-10">Thêm mới các mặt hàng vào cơ sở dữ liệu của hệ thống.</p>
            <Link 
              to="/admin/add-product" 
              className="bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white px-5 py-2.5 rounded-xl font-bold inline-block w-full text-center transition-colors border border-orange-600/50"
            >
              Thêm Sản Phẩm
            </Link>
          </div>

          {/* Block 4: Quản lý Đơn hàng */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-red-500 transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2 text-white">Kiểm Soát Giao Dịch</h2>
            <p className="text-slate-400 mb-6 text-sm h-10">Theo dõi và quản lý toàn bộ luồng đơn hàng trên toàn hệ thống.</p>
            <Link 
              to="/admin/orders" 
              className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl font-bold inline-block w-full text-center transition-colors border border-red-600/50"
            >
              Quản lý Toàn bộ Đơn
            </Link>
          </div>

          {/* Block 5: Thống kê & AI */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-green-500 transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-bold mb-2 text-white">Thống Kê & Doanh Thu</h2>
            <p className="text-slate-400 mb-6 text-sm h-10">Xem biểu đồ, báo cáo doanh số và hiệu suất kinh doanh.</p>
            <Link 
              to="/stats" 
              className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-5 py-2.5 rounded-xl font-bold inline-block w-full text-center transition-colors border border-green-600/50"
            >
              Xem Thống Kê
            </Link>
          </div>

          {/* Block 6: Hồ Sơ Khách Hàng */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-purple-500 transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-bold mb-2 text-white">Insight Khách Hàng</h2>
            <p className="text-slate-400 mb-6 text-sm h-10">Tra cứu lịch sử tương tác cá nhân của từng người dùng.</p>
            <Link 
              to="/admin/customer-insight" 
              className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-5 py-2.5 rounded-xl font-bold inline-block w-full text-center transition-colors border border-purple-600/50"
            >
              Tra Cứu Hồ Sơ
            </Link>
          </div>

          {/* Block 7: Phân Tích Thuật Toán AI (MỚI THÊM) */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-cyan-500 transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="text-xl font-bold mb-2 text-white">Phân Tích AI Tổng Hợp</h2>
            <p className="text-slate-400 mb-6 text-sm h-10">Theo dõi luồng phân phối gợi ý và các mặt hàng AI đề xuất nhiều nhất.</p>
            <Link 
              to="/admin/ai-analytics" 
              className="bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white px-5 py-2.5 rounded-xl font-bold inline-block w-full text-center transition-colors border border-cyan-600/50"
            >
              Xem Báo Cáo AI
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;