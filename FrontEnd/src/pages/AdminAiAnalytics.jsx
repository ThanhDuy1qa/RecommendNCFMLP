import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'; 
import { useAdminAiAnalytics } from '../hooks/useAdminAiAnalytics'; 

const AdminAiAnalytics = () => {
  const {
    activeTab, setActiveTab, scenariosSummary, 
    data, loading, error, 
    searchInput, setSearchInput,
    page, setPage, limit, setLimit,
    pagination, handleSearchSubmit,
    topPage, totalTopPages, paginatedTopProducts, handlePrevTop, handleNextTop
  } = useAdminAiAnalytics();

  return (
    <div className="bg-slate-900 min-h-screen p-4 md:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BAR & MENU TAB */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-blue-400 flex items-center gap-2">
              <span>🧠</span> Trung Tâm Phân Tích Thuật Toán AI
            </h1>
            <p className="text-xs text-slate-400 mt-1">Quản lý ma trận phân phối gợi ý và đối soát hiệu năng mô hình.</p>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 w-full">
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                👥 Phân Phối Gợi Ý
              </button>
              <button 
                onClick={() => setActiveTab('scenarios')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'scenarios' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                📊 Đánh Giá Thuật Toán
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl text-center font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* TAB 1: PHÂN PHỐI GỢI Ý & DANH SÁCH KHÁCH HÀNG */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* TOP 10 SẢN PHẨM */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🔥</span> Bảng Xếp Hạng Sản Phẩm Được AI Đề Xuất
                </h2>
                
                {/* 🌟 MỚI: NÚT ĐIỀU HƯỚNG TỚI LÙI CHO TOP SẢN PHẨM */}
                {totalTopPages > 1 && (
                  <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-1.5 border border-slate-700 shadow-inner">
                    <button 
                      onClick={handlePrevTop} disabled={topPage === 1}
                      className="text-slate-400 hover:text-white disabled:opacity-30 px-2 text-lg font-black transition-colors"
                    >
                      &larr;
                    </button>
                    <span className="text-xs font-bold text-slate-300">
                      Trang {topPage} / {totalTopPages}
                    </span>
                    <button 
                      onClick={handleNextTop} disabled={topPage === totalTopPages}
                      className="text-slate-400 hover:text-white disabled:opacity-30 px-2 text-lg font-black transition-colors"
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {(!paginatedTopProducts || paginatedTopProducts.length === 0) ? (
                  <div className="col-span-full text-center text-slate-500 py-4">Đang chờ dữ liệu...</div>
                ) : (
                  paginatedTopProducts.map((prod, idx) => {
                    // Tính toán thứ hạng thực tế (VD: Trang 2 thì bắt đầu từ #11)
                    const actualRank = (topPage - 1) * 10 + idx + 1;
                    
                    return (
                      <div key={prod.asin} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col justify-between group hover:border-blue-500/50 transition-all relative pt-8">
                        
                        {/* HUY HIỆU THỨ HẠNG (Góc trái) */}
                        <span className="absolute top-2 left-2 w-6 h-6 bg-blue-600/20 text-blue-400 border border-blue-500/40 text-[10px] font-black rounded-full flex items-center justify-center z-10">
                          #{actualRank}
                        </span>

                        {/* 🌟 THAY ĐỔI: Hiển thị số người dùng được gợi ý */}
<span className="absolute top-2 right-2 border text-[10px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-md bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
    
    {/* Kiểm tra xem prod.count có tồn tại không */}
    {prod.count ? (
      <>👥 {Number(prod.count).toLocaleString()} users</>
    ) : (
      <>👥 0 users</>
    )}
</span>
                        <div className="w-full h-24 bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3">
                          <img src={prod.image || 'https://via.placeholder.com/100'} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" alt="" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">{prod.title}</h4>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* THANH ĐIỀU KHIỂN: THÔNG TIN TỔNG SỐ, CHỌN LIMIT VÀ TÌM KIẾM */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-md">
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="text-sm text-slate-300 font-semibold bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
                  Tổng cộng: <span className="text-blue-400 font-black">{pagination?.totalUsers?.toLocaleString() || 0}</span> đối tượng
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  Hiển thị:
                  <select 
                    value={limit} 
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1); // Reset về trang 1 khi đổi số lượng hiển thị
                    }}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-white outline-none focus:border-blue-500 font-bold"
                  >
                    <option value={15}>15 dòng</option>
                    <option value={30}>30 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:w-auto">
                <input 
                  type="text" placeholder="Tìm kiếm AI ID, Tên, Email..."
                  value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500 min-w-[260px] w-full"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg">Tìm</button>
              </form>
            </div>

            {/* BẢNG DỮ LIỆU & PHÂN TRANG */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
              {loading && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-10 font-bold text-blue-400 text-sm">⏳ Đang nạp ma trận...</div>}

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 text-xs font-bold uppercase border-b border-slate-700">
                      <th className="p-4">AI ID</th>
                      <th className="p-4">Khách Hàng</th>
                      <th className="p-4">Amazon ID</th>
                      <th className="p-4">Mặt hàng AI đề xuất (Top 5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-sm">
                    {(!data?.userAnalytics || data.userAnalytics.length === 0) ? (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">Không tìm thấy dữ liệu phù hợp.</td></tr>
                    ) : (
                      data.userAnalytics.map((user) => (
                        <tr key={user.aiUserId} className="hover:bg-slate-700/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-blue-400">#{user.aiUserId}</td>
                          <td className="p-4 text-white font-semibold">
                            {user.name}
                            <div className="text-xs text-slate-500 font-normal">{user.email}</div>
                          </td>
                          <td className="p-4 text-xs font-mono text-orange-400">{user.amazonId}</td>
                          <td className="p-4 flex gap-2">
                            {user.previewItems?.map((item, i) => (
                              <div key={i} className="relative group/tooltip">
                                <img 
                                  src={item.image || 'https://via.placeholder.com/40'} 
                                  alt="sp" 
                                  className="w-10 h-10 rounded border border-slate-600 bg-white object-contain cursor-pointer"
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-600 text-xs text-white p-2 rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                  <p className="font-bold line-clamp-2">{item.title}</p>
                                  <p className="text-blue-400 mt-1 font-mono">ASIN: {item.asin}</p>
                                  <p className="text-green-400 mt-1 font-bold">{item.price}</p>
                                </div>
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* THANH PHÂN TRANG (PAGINATION) */}
              {pagination && pagination.totalPages > 0 && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-sm text-slate-400">
                    Trang <span className="font-bold text-white">{page}</span> / <span className="font-bold text-white">{pagination.totalPages}</span>
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 hover:bg-slate-700 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-all"
                    >
                      &larr; Trước
                    </button>
                    <button 
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 hover:bg-slate-700 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-all"
                    >
                      Sau &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BIỂU ĐỒ ĐÁNH GIÁ THUẬT TOÁN (Giữ nguyên) */}
        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in relative min-h-[400px]">
            {loading && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center text-sm font-bold text-blue-400">⏳ Đang tải mô hình...</div>}

            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Đánh Giá Sức Mạnh Thuật Toán (Ablation Study)
              </h3>
              <div className="w-full h-[400px] min-h-[400px] overflow-hidden">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart width={600} height={400} data={scenariosSummary || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="method" angle={-15} textAnchor="end" interval={0} height={80} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis domain={[0, 'auto']} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: 8, fontSize: 12 }} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                    
                    <Bar dataKey="score" name="Model Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="HR@20" name="Hit Ratio (HR@20)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="N@20" name="NDCG (N@20)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-slate-700 bg-slate-900/40">
                <h3 className="text-sm font-black text-slate-200">🏆 Bảng Xếp Hạng Mô Hình</h3>
              </div>
              <div className="divide-y divide-slate-700 flex-grow overflow-y-auto max-h-[380px] text-xs font-mono custom-scrollbar">
                {(!scenariosSummary || scenariosSummary.length === 0) ? (
                  <div className="p-4 text-center text-slate-500">Đang chờ dữ liệu...</div>
                ) : (
                  scenariosSummary.map((model, index) => {
                    const rank = index + 1;
                    return (
                      <div key={model.method} className={`p-4 flex justify-between items-center transition-colors ${rank === 1 ? 'bg-blue-600/10' : 'hover:bg-slate-700/30'}`}>
                        <div>
                          <div className="font-bold flex items-center gap-1.5 mb-1">
                            {rank === 1 && <span className="text-lg">🥇</span>}
                            {rank === 2 && <span className="text-lg">🥈</span>}
                            {rank === 3 && <span className="text-lg">🥉</span>}
                            {rank > 3 && <span className="w-5 inline-block text-center text-slate-500">#{rank}</span>}
                            
                            <span className={rank === 1 ? "text-blue-400 font-black text-sm" : "text-slate-300"}>
                              {model.method}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 ml-6">
                            Fusion: {model.fusion}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-white text-sm">
                            {model.score ? model.score.toFixed(4) : "0.0000"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAiAnalytics;