import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="bg-slate-900 min-h-screen p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-8 flex items-center gap-3">
          <span>⚙️</span> Bảng Điều Khiển Quản Trị Viên
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Block 1: Quản lý Sản phẩm */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-bold mb-2 text-white">Quản trị Toàn sàn</h2>
            <p className="text-slate-400 mb-6 text-sm">Kiểm soát, sửa đổi hoặc gỡ bỏ bất kỳ sản phẩm nào trong tổng số 21 triệu bản ghi.</p>
            <Link 
              to="/admin/manage-products" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold inline-block w-full text-center transition-colors"
            >
              Quản lý kho hàng
            </Link>
          </div>

          {/* Block 2: Thống kê & AI */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-green-500 transition-colors">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-bold mb-2 text-white">Thống Kê Hệ Thống</h2>
            <p className="text-slate-400 mb-6 text-sm">Xem biểu đồ, báo cáo doanh thu và hiệu suất của thuật toán AI.</p>
            <Link 
              to="/stats" 
              className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold inline-block w-full text-center transition-colors"
            >
              Xem Thống Kê
            </Link>
          </div>

          {/* Block 3: ĐÃ MỞ KHÓA - Hồ Sơ Khách Hàng */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-purple-500 transition-colors">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-bold mb-2 text-white">Insight Khách Hàng</h2>
            <p className="text-slate-400 mb-6 text-sm">Tra cứu lịch sử tương tác, đánh giá sản phẩm và chạy thuật toán AI phân tích.</p>
            <Link 
              to="/admin/customer-insight" 
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-semibold inline-block w-full text-center transition-colors shadow-lg shadow-purple-500/20"
            >
              Tra Cứu Hồ Sơ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;