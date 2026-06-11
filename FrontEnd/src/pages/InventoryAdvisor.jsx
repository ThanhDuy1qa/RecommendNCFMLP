import React, { useState, useEffect } from 'react';

const InventoryAdvisor = () => {
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Từ chối truy cập! Bạn chưa đăng nhập.");

        const response = await fetch('http://localhost:5000/api/analytics/inventory-advice', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi tải dữ liệu');
        
        setInventoryData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50 rounded-xl">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-teal-600 font-bold animate-pulse">Đang đồng bộ dữ liệu AI với Kho hàng...</p>
      </div>
    );
  }

  if (error) return <div className="bg-rose-50 border border-rose-200 text-rose-600 font-bold p-6 text-center rounded-xl m-4">⚠️ {error}</div>;

  // Cập nhật lại màu sắc nhãn dán cho Theme Sáng
  const actionLabels = {
    "priority_import_future_trend": { text: "Ưu tiên nhập - Xu hướng mới", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    "priority_import_stable_hot_item": { text: "Ưu tiên nhập - Hàng ổn định", color: "bg-blue-50 text-blue-700 border-blue-200" },
    "consider_import": { text: "Cân nhắc nhập", color: "bg-amber-50 text-amber-700 border-amber-200" },
    "avoid_over_import_old_trend": { text: "Tránh nhập quá nhiều", color: "bg-rose-50 text-rose-700 border-rose-200" },
    "monitor": { text: "Theo dõi thêm", color: "bg-slate-100 text-slate-600 border-slate-300" }
  };

  const rawItems = inventoryData?.enriched_items || [];

  const filteredProducts = rawItems.filter(prod => {
    const matchesSearch = prod.title?.toLowerCase().includes(searchTerm.toLowerCase()) || prod.asin?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'ALL' || prod.inventory_action === filterAction;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-black text-teal-700 flex items-center gap-3">
            <span>📦</span> Trợ lý Quyết định Nhập hàng (Procurement AI)
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">AI phân tích nhu cầu thị trường để đề xuất chiến lược dồn vốn, giúp tối ưu hóa tồn kho.</p>
        </div>

        {/* Thanh Công Cụ: Tìm kiếm & Lọc */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Tìm mã ASIN hoặc Tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>
          <div className="md:w-64">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
            >
              <option value="ALL">📋 Tất cả khuyến nghị</option>
              <option value="priority_import_future_trend">🚀 Ưu tiên: Xu hướng mới</option>
              <option value="priority_import_stable_hot_item">🔥 Ưu tiên: Hàng ổn định</option>
              <option value="consider_import">🤔 Cân nhắc nhập</option>
              <option value="avoid_over_import_old_trend">⚠️ Tránh nhập quá nhiều</option>
              <option value="monitor">👀 Theo dõi thêm</option>
            </select>
          </div>
        </div>

        {/* Bảng Dữ Liệu */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200 tracking-wider">
                  <th className="p-4 w-20 text-center">Ảnh</th>
                  <th className="p-4">Thông tin Sản phẩm</th>
                  <th className="p-4 w-28 text-right">Giá</th>
                  <th className="p-4 w-40 text-center">AI Dự đoán<br/><span className="text-[10px] text-slate-400 font-normal">(Rank / Khách)</span></th>
                  <th className="p-4 w-56 text-center">Quyết định của AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500 font-medium">
                      Không có sản phẩm nào phù hợp với tiêu chí lọc.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod, idx) => {
                    const actionInfo = actionLabels[prod.inventory_action] || actionLabels["monitor"];
                    const prodRank = prod.predicted_rank || prod['Predicted rank'] || idx + 1;
                    const prodUserCount = prod.predicted_user_count || prod['Predicted user count'] || 0;
                    
                    return (
                      <tr key={prod.asin || idx} className="hover:bg-teal-50/50 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center border border-slate-200 shadow-sm">
                            <img src={prod.image_url || 'https://via.placeholder.com/50'} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800 line-clamp-1 mb-1">{prod.title}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="font-mono text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded font-bold">{prod.asin}</span>
                            <span className="font-medium">{prod.brand}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right font-mono font-black text-rose-600 text-base">
                          {prod.price != null || prod.price_clean != null ? `$${parseFloat(prod.price ?? prod.price_clean).toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-amber-600 text-base">#{prodRank}</span>
                            <span className="text-xs text-slate-500 mt-1 font-medium">~{prodUserCount} users</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border ${actionInfo.color} whitespace-nowrap shadow-sm`}>
                            {actionInfo.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default InventoryAdvisor;