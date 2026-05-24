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
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 rounded-xl">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-cyan-400 font-bold animate-pulse">Đang phân tích biểu đồ ma trận xu hướng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 text-red-400 p-6 rounded-xl text-center m-4">
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
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Tiêu đề trang nghiệp vụ */}
        <div className="border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center gap-3">
            <span>📊</span> Đối Soát Lịch Sử & Nhu Cầu Dự Đoán
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            So sánh dữ liệu bán hàng thực tế trong quá khứ với hạng mục do AI dự đoán để nhận diện xu hướng tương lai.
          </p>
        </div>

        {/* Hệ thống thanh lựa chọn chuyển đổi 4 Tab Phân Nhóm */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800 p-2 rounded-2xl border border-slate-700">
          <button
            onClick={() => { setActiveSubTab('stable'); setSearchTerm(''); }}
            className={`p-4 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
              activeSubTab === 'stable' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-700/50 text-slate-400'
            }`}
          >
            <span className="text-xl">🔥</span>
            <span className="text-sm">Hot Ổn Định</span>
            <span className="text-[10px] opacity-80">Cả Lịch sử & AI đều hạng cao</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('future'); setSearchTerm(''); }}
            className={`p-4 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
              activeSubTab === 'future' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-700/50 text-slate-400'
            }`}
          >
            <span className="text-xl">🚀</span>
            <span className="text-sm">Xu Hướng Mới</span>
            <span className="text-[10px] opacity-80">Lịch sử thấp nhưng AI dự báo cao</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('historical'); setSearchTerm(''); }}
            className={`p-4 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
              activeSubTab === 'historical' ? 'bg-amber-600 text-white shadow-lg' : 'hover:bg-slate-700/50 text-slate-400'
            }`}
          >
            <span className="text-xl">⏳</span>
            <span className="text-sm">Chỉ Hot Quá Khứ</span>
            <span className="text-[10px] opacity-80">Lịch sử cao nhưng AI dự báo thấp</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('low'); setSearchTerm(''); }}
            className={`p-4 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
              activeSubTab === 'low' ? 'bg-slate-700 text-white shadow-lg' : 'hover:bg-slate-700/50 text-slate-400'
            }`}
          >
            <span className="text-xl">💤</span>
            <span className="text-sm">Ít Ưu Tiên</span>
            <span className="text-[10px] opacity-80">Cả Lịch sử & AI đều đánh giá thấp</span>
          </button>
        </div>

        {/* Thanh tìm kiếm nhanh nội bộ bảng dữ liệu */}
        <div className="flex justify-end bg-slate-800 p-4 rounded-xl border border-slate-700">
          <input
            type="text"
            placeholder="Tìm nhanh theo mã ASIN, Tên hoặc Thương hiệu sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Bảng kết quả đối soát ma trận dữ liệu hiển thị */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-xs font-bold uppercase border-b border-slate-700">
                  <th className="p-4 w-20">Ảnh</th>
                  <th className="p-4">Thông tin Sản phẩm</th>
                  {/* 🌟 ĐÃ SỬA: CHIA THÀNH 2 CỘT HẠNG ĐỂ SO SÁNH */}
                  <th className="p-4 w-32 text-center border-l border-slate-700">Hạng Lịch Sử</th>
                  <th className="p-4 w-32 text-center bg-cyan-900/20 border-l border-r border-slate-700">Hạng Dự Đoán (AI)</th>
                  <th className="p-4 w-28 text-center">Xu Hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
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
                      <tr key={prod.asin || idx} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-4">
                          <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden border border-slate-600">
                            <img src={prod.image_url || 'https://via.placeholder.com/50'} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-200 line-clamp-1" title={prod.title}>{prod.title}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="font-mono text-cyan-500">{prod.asin}</span>
                            <span>|</span>
                            <span>{prod.brand || 'N/A'}</span>
                          </div>
                        </td>

                        {/* HIỂN THỊ HẠNG LỊCH SỬ (DỮ LIỆU THỰC TẾ) */}
                        <td className="p-4 text-center border-l border-slate-700 font-mono text-slate-400">
                          {historyRank != null ? `#${historyRank}` : 'N/A'}
                          <div className="text-[10px] text-slate-500 mt-1">
                            {historyUsers != null ? `${historyUsers} lượt mua` : 'N/A'}
                          </div>
                        </td>

                        {/* HIỂN THỊ HẠNG DỰ ĐOÁN (DO AI TÍNH TOÁN) */}
                        <td className="p-4 text-center bg-cyan-900/10 border-l border-r border-slate-700 font-mono font-black text-cyan-400">
                          {predictedRank != null ? `#${predictedRank}` : 'N/A'}
                          <div className="text-[10px] text-cyan-600/70 mt-1">
                            Dự kiến {predictedUserCount != null ? Math.round(predictedUserCount) : 'N/A'} users
                          </div>
                        </td>

                        {/* HIỂN THỊ ICON MŨI TÊN XU HƯỚNG */}
                        <td className="p-4 text-center">
                          {isTrendingUp && (
                            <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold text-xs border border-emerald-500/30">
                              📈 Tăng hạng
                            </div>
                          )}
                          {isTrendingDown && (
                            <div className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-400 px-2 py-1 rounded font-bold text-xs border border-rose-500/30">
                              📉 Giảm nhiệt
                            </div>
                          )}
                          {!isTrendingUp && !isTrendingDown && (
                            <div className="inline-flex items-center gap-1 bg-slate-700 text-slate-400 px-2 py-1 rounded font-bold text-xs border border-slate-600">
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