import React, { useState, useEffect } from 'react';

const TrendComparison = () => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quản lý Tab đang được lựa chọn (Mặc định là nhóm Ổn định)
  const [activeSubTab, setActiveSubTab] = useState('stable');
  // Ô tìm kiếm bộ lọc nhanh sản phẩm tại giao diện bảng
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Từ chối truy cập! Bạn chưa đăng nhập.");

        const response = await fetch('http://localhost:5000/api/analytics/compare', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi khi tải dữ liệu so sánh xu hướng');
        
        setTrendData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-sky-100 to-sky-50 rounded-3xl border border-sky-200 shadow-sm m-4 md:m-8">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sky-700 font-bold animate-pulse">Đang phân tích biểu đồ ma trận xu hướng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl text-center font-bold shadow-sm m-4 md:m-8">
        ⚠️ {error}
      </div>
    );
  }

  // Định nghĩa các tập dữ liệu tương ứng với từng Tab điều hướng
  const getActiveList = () => {
    switch(activeSubTab) {
      case 'stable': return trendData?.stable_history_and_model || [];
      case 'future': return trendData?.future_trend_by_model || [];
      case 'historical': return trendData?.historical_popular_only || [];
      case 'low': return trendData?.low_priority_watchlist || [];
      default: return [];
    }
  };

  const currentList = getActiveList();

  // Cơ chế lọc dữ liệu thời gian thực (Client-side Filter) khi gõ tìm kiếm
  const filteredProducts = currentList.filter(prod => 
    prod.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.asin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // 🌟 ĐÃ SỬA: Đổi nền tổng thể sang gradient Sky
    <div className="bg-gradient-to-br from-sky-200 via-sky-100 to-sky-50 min-h-screen p-4 sm:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TIÊU ĐỀ TRANG NGHIỆP VỤ */}
        <div className="bg-white/95 backdrop-blur border border-sky-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
              <span className="bg-sky-100 p-2 rounded-xl text-2xl shadow-sm">📊</span> Đối Soát Lịch Sử & Nhu Cầu Dự Đoán
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              So sánh dữ liệu bán hàng thực tế trong quá khứ với hạng mục do AI dự đoán để nhận diện xu hướng tương lai.
            </p>
          </div>
        </div>

        {/* HỆ THỐNG THANH LỰA CHỌN CHUYỂN ĐỔI 4 TAB PHÂN NHÓM */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-3xl border border-sky-200 shadow-sm">
          <button
            onClick={() => { setActiveSubTab('stable'); setSearchTerm(''); }}
            className={`p-4 rounded-2xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
              activeSubTab === 'stable' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600 border border-transparent hover:border-sky-100'
            }`}
          >
            <span className="text-2xl">🔥</span>
            <span className="text-sm">Hot Ổn Định</span>
            <span className={`text-[10px] ${activeSubTab === 'stable' ? 'text-blue-100' : 'text-slate-400'}`}>Lịch sử & AI đều cao</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('future'); setSearchTerm(''); }}
            className={`p-4 rounded-2xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
              activeSubTab === 'future' ? 'bg-emerald-500 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600 border border-transparent hover:border-sky-100'
            }`}
          >
            <span className="text-2xl">🚀</span>
            <span className="text-sm">Xu Hướng Mới</span>
            <span className={`text-[10px] ${activeSubTab === 'future' ? 'text-emerald-100' : 'text-slate-400'}`}>Lịch sử thấp, AI dự báo cao</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('historical'); setSearchTerm(''); }}
            className={`p-4 rounded-2xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
              activeSubTab === 'historical' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600 border border-transparent hover:border-sky-100'
            }`}
          >
            <span className="text-2xl">⏳</span>
            <span className="text-sm">Chỉ Hot Quá Khứ</span>
            <span className={`text-[10px] ${activeSubTab === 'historical' ? 'text-amber-100' : 'text-slate-400'}`}>Lịch sử cao, AI dự báo thấp</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('low'); setSearchTerm(''); }}
            className={`p-4 rounded-2xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
              activeSubTab === 'low' ? 'bg-slate-600 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600 border border-transparent hover:border-sky-100'
            }`}
          >
            <span className="text-2xl">💤</span>
            <span className="text-sm">Ít Ưu Tiên</span>
            <span className={`text-[10px] ${activeSubTab === 'low' ? 'text-slate-300' : 'text-slate-400'}`}>Cả Lịch sử & AI đều thấp</span>
          </button>
        </div>

        {/* THANH TÌM KIẾM NHANH NỘI BỘ BẢNG DỮ LIỆU */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-sky-200 shadow-sm gap-4">
          <div className="text-sm font-bold text-sky-700 bg-sky-50 px-4 py-2 rounded-xl border border-sky-100">
            Hiển thị: <span className="text-sky-900">{filteredProducts.length}</span> sản phẩm
          </div>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Tìm nhanh theo ASIN, Tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all shadow-sm"
            />
            <span className="absolute right-3 top-2.5 opacity-40">🔍</span>
          </div>
        </div>

        {/* BẢNG KẾT QUẢ ĐỐI SOÁT MA TRẬN DỮ LIỆU HIỂN THỊ */}
        <div className="bg-white rounded-3xl border border-sky-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sky-50/80 text-sky-800 text-xs font-bold uppercase border-b border-sky-200 tracking-wider">
                  <th className="p-4 w-20 text-center">Ảnh</th>
                  <th className="p-4">Thông tin Sản phẩm</th>
                  <th className="p-4 w-32 text-center border-l border-sky-100">Hạng Lịch Sử</th>
                  <th className="p-4 w-32 text-center bg-sky-100/50 border-l border-r border-sky-100 text-sky-900">Hạng AI Dự Đoán</th>
                  <th className="p-4 w-32 text-center">Xu Hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center text-slate-500 font-medium">
                      <span className="text-4xl block mb-3 opacity-50">🔍</span>
                      Không tìm thấy sản phẩm nào khớp với tiêu chí tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod, idx) => {
                    const historyRank = prod.history_rank ?? prod.historical_rank ?? null;
                    const historyUsers = prod.historical_unique_users ?? prod.historical_interactions ?? prod.avg_historical_unique_users ?? null;
                    const predictedRank = prod.predicted_rank ?? prod.predictedRank ?? null;
                    const predictedUserCount = prod.predicted_user_count ?? prod.predictedUserCount ?? null;

                    // Logic tính toán sự chênh lệch hạng (Hạng càng nhỏ càng tốt, VD: Hạng 1 tốt hơn Hạng 100)
                    const isTrendingUp = typeof historyRank === 'number' && typeof predictedRank === 'number' && predictedRank < historyRank;
                    const isTrendingDown = typeof historyRank === 'number' && typeof predictedRank === 'number' && predictedRank > historyRank;

                    return (
                      <tr key={prod.asin || idx} className="hover:bg-sky-50/40 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm mx-auto">
                            <img src={prod.image_url || 'https://via.placeholder.com/50'} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800 line-clamp-2" title={prod.title}>{prod.title || 'Sản phẩm công nghệ'}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="font-mono text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{prod.asin}</span>
                            <span>{prod.brand || 'N/A'}</span>
                          </div>
                        </td>

                        {/* HIỂN THỊ HẠNG LỊCH SỬ (DỮ LIỆU THỰC TẾ) */}
                        <td className="p-4 text-center border-l border-sky-100 font-mono text-slate-600">
                          {historyRank != null ? <span className="font-black text-slate-700">#{historyRank}</span> : 'N/A'}
                          <div className="text-[10px] text-slate-500 mt-1 font-sans">
                            {historyUsers != null ? `${historyUsers} lượt mua` : 'N/A'}
                          </div>
                        </td>

                        {/* HIỂN THỊ HẠNG DỰ ĐOÁN (DO AI TÍNH TOÁN) */}
                        <td className="p-4 text-center bg-sky-50/30 border-l border-r border-sky-100 font-mono">
                          {predictedRank != null ? <span className="font-black text-sky-600 text-base">#{predictedRank}</span> : 'N/A'}
                          <div className="text-[10px] text-sky-700/80 mt-1 font-sans font-medium">
                            Dự kiến: {predictedUserCount != null ? Math.round(predictedUserCount) : 'N/A'} users
                          </div>
                        </td>

                        {/* HIỂN THỊ ICON MŨI TÊN XU HƯỚNG */}
                        <td className="p-4 text-center">
                          {isTrendingUp && (
                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-lg font-bold text-xs border border-emerald-200 shadow-sm">
                              📈 Tăng hạng
                            </div>
                          )}
                          {isTrendingDown && (
                            <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2.5 py-1.5 rounded-lg font-bold text-xs border border-rose-200 shadow-sm">
                              📉 Giảm nhiệt
                            </div>
                          )}
                          {!isTrendingUp && !isTrendingDown && (
                            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg font-bold text-xs border border-slate-200 shadow-sm">
                              ➖ Giữ hạng
                            </div>
                          )}
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

export default TrendComparison;