import React, { useState, useEffect } from 'react';

const TargetedMarketing = () => {
  const [marketingData, setMarketingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State quản lý việc hiển thị chi tiết (lưu trữ sản phẩm đang được chọn)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Từ chối truy cập! Bạn chưa đăng nhập.");

        const response = await fetch('http://localhost:5000/api/analytics/marketing-targets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi tải dữ liệu marketing');
        
        setMarketingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketingData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 rounded-xl">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-purple-400 font-bold animate-pulse">Đang trích xuất tệp khách hàng tiềm năng...</p>
      </div>
    );
  }

  if (error) return <div className="text-red-400 p-6 text-center m-4">⚠️ {error}</div>;

  // Xử lý dữ liệu từ file JSON
  const targetProducts = marketingData?.best_marketing_targets || [];
  const userDetails = marketingData?.user_product_detail || [];

  // Lọc sản phẩm tìm kiếm
  const filteredProducts = targetProducts.filter(prod => 
    prod.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prod.asin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lấy danh sách users cho sản phẩm đang được chọn
  const getTargetUsers = (asin) => {
    return userDetails.filter(user => user.asin === asin).sort((a, b) => b.hybrid_score - a.hybrid_score);
  };

  // ==========================================
  // HÀM XUẤT FILE CSV
  // ==========================================
  const handleExportCSV = () => {
    if (!selectedProduct) return;

    const users = getTargetUsers(selectedProduct.asin);
    if (users.length === 0) {
      alert("Chưa có dữ liệu khách hàng để xuất!");
      return;
    }

    const headers = ['STT', 'User_ID', 'Hybrid_Score', 'Rank'];
    const csvRows = users.map((user, index) => {
      return [
        index + 1,
        `User_${user.user_id}`,
        user.hybrid_score ? user.hybrid_score.toFixed(6) : 'N/A',
        user.rank || 'N/A'
      ].join(','); 
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Marketing_Targets_${selectedProduct.asin}.csv`); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="border-b border-slate-700 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-purple-400 flex items-center gap-3">
              <span>🎯</span> Chiến dịch Marketing Mục tiêu
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Xác định tệp khách hàng (User IDs) có xác suất mua cao nhất cho từng sản phẩm để tối ưu chi phí Ads/Email.</p>
          </div>
        </div>

        {/* =========================================================
            PHẦN 1: DANH SÁCH SẢN PHẨM (MASTER VIEW)
            ========================================================= */}
        {!selectedProduct && (
          <div className="animate-fade-in space-y-6">
            <div className="flex bg-slate-800 p-4 rounded-xl border border-slate-700">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm sản phẩm cần chạy quảng cáo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 text-xs font-bold uppercase border-b border-slate-700">
                      <th className="p-4 w-20">Ảnh</th>
                      <th className="p-4">Thông tin Sản phẩm</th>
                      <th className="p-4 w-32 text-center">Khách Hàng<br/>Mục Tiêu</th>
                      <th className="p-4 w-32 text-center">Điểm Tiềm Năng<br/>(Hybrid Score)</th>
                      <th className="p-4 w-40 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-sm">
                    {filteredProducts.map((prod, idx) => (
                      <tr key={prod.asin || idx} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center border border-slate-600">
                            <img src={prod.image_url || 'https://via.placeholder.com/50'} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-200 line-clamp-1">{prod.title}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="font-mono text-purple-400 bg-purple-900/20 px-1.5 rounded">{prod.asin}</span>
                            <span>{prod.brand || 'No Brand'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-black text-2xl text-cyan-400">{prod.target_user_count || prod.predicted_user_count || 0}</span>
                          <span className="block text-[10px] text-slate-500 uppercase">Users</span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-amber-400">
                          {prod.avg_hybrid_score ? prod.avg_hybrid_score.toFixed(5) : 'N/A'}
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => setSelectedProduct(prod)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg text-xs"
                          >
                            👁️ Lấy Tệp Khách
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PHẦN 2: CHI TIẾT TỆP KHÁCH HÀNG (DETAIL VIEW)
            ========================================================= */}
        {selectedProduct && (
          <div className="animate-fade-in space-y-6">
            {/* Thanh điều hướng quay lại */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold bg-slate-800 px-4 py-2 rounded-lg w-max border border-slate-700"
            >
              <span>⬅️</span> Quay lại danh sách sản phẩm
            </button>

            {/* Thông tin sản phẩm đang chạy chiến dịch */}
            <div className="bg-gradient-to-r from-purple-900/40 to-slate-800 p-6 rounded-2xl border border-purple-500/30 flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-xl p-2 flex-shrink-0 border-2 border-purple-500/50">
                <img src={selectedProduct.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-contain" alt="" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedProduct.title}</h2>
                <div className="flex gap-4 text-sm font-mono">
                  <span className="text-purple-400 bg-purple-900/40 px-2 py-1 rounded">Mã: {selectedProduct.asin}</span>
                  <span className="text-cyan-400 bg-cyan-900/40 px-2 py-1 rounded">Tệp: {selectedProduct.target_user_count || 0} Users</span>
                </div>
              </div>
            </div>

            {/* Bảng danh sách User ID Ẩn danh */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-slate-200">Danh sách User_ID mục tiêu</h3>
                
                {/* 🌟 NÚT XUẤT FILE ĐÃ GẮN SỰ KIỆN */}
                <button 
                  onClick={handleExportCSV}
                  className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded font-bold text-white transition-colors"
                >
                  📥 Xuất file CSV (Chạy Ads)
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-900 text-slate-400 text-xs font-bold uppercase shadow-md">
                    <tr>
                      <th className="p-4 w-20 text-center">#</th>
                      <th className="p-4">Mã Khách Hàng (User ID)</th>
                      <th className="p-4 text-center">Hybrid Score</th>
                      <th className="p-4 text-center">Xếp hạng (Rank)</th>
                      <th className="p-4 text-center">Trạng thái gửi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-sm">
                    {getTargetUsers(selectedProduct.asin).length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Chưa có dữ liệu người dùng cho sản phẩm này.</td></tr>
                    ) : (
                      getTargetUsers(selectedProduct.asin).map((user, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-4 font-mono font-bold text-blue-400 flex items-center gap-2">
                            <span>👤</span> User_{user.user_id}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-amber-400">
                            {user.hybrid_score ? user.hybrid_score.toFixed(6) : 'N/A'}
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-slate-700 px-2 py-1 rounded-full text-xs font-bold text-slate-300">
                              Top {user.rank || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-slate-500 italic text-xs">Chưa gửi</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TargetedMarketing;