import React from 'react';
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
    // 🌟 ĐÃ SỬA: Cải tiến toàn bộ background sang Sky Light Theme đồng bộ hệ thống
    <div className="bg-gradient-to-br from-sky-200 via-sky-100 to-sky-50 min-h-screen p-4 md:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER BAR BIẾN ĐỔI SANG SKY WHITE CONTAINER */}
        <div className="bg-white/95 backdrop-blur rounded-3xl p-6 border border-sky-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-2">
              <span className="bg-sky-100 p-2 rounded-xl text-2xl shadow-sm">🧠</span> Trung Tâm Phân Tích Thuật Toán AI
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-2">Quản lý ma trận phân phối gợi ý cá nhân hóa và đối soát hiệu năng mô hình toán học.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto shrink-0">
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'products' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}
            >
              👥 Phân Phối Gợi Ý
            </button>
            <button 
              onClick={() => setActiveTab('scenarios')}
              className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'scenarios' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}
            >
              📊 Đánh Giá Thuật Toán
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl text-center font-bold shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* TAB 1: KHU VỰC PHÂN PHỐI GỢI Ý MA TRẬN */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* GRID BẢNG XẾP HẠNG SẢN PHẨM */}
            <div className="bg-white p-6 rounded-3xl border border-sky-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <span className="bg-rose-50 p-1 rounded-md text-sm">🔥</span> Bảng Xếp Hạng Sản Phẩm Được AI Đề Xuất Nhiều Nhất
                </h2>
                
                {totalTopPages > 1 && (
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200 shadow-sm">
                    <button 
                      onClick={handlePrevTop} disabled={topPage === 1}
                      className="text-slate-500 hover:text-sky-600 disabled:opacity-30 px-2 font-black transition-colors"
                    >
                      &larr;
                    </button>
                    <span className="text-xs font-bold text-slate-700">
                      Trang {topPage} / {totalTopPages}
                    </span>
                    <button 
                      onClick={handleNextTop} disabled={topPage === totalTopPages}
                      className="text-slate-500 hover:text-sky-600 disabled:opacity-30 px-2 font-black transition-colors"
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(!paginatedTopProducts || paginatedTopProducts.length === 0) ? (
                  <div className="col-span-full text-center text-slate-400 py-12 font-medium bg-slate-50 rounded-2xl border border-dashed">Hệ thống đang tổng hợp dữ liệu...</div>
                ) : (
                  paginatedTopProducts.map((prod, idx) => {
                    const actualRank = (topPage - 1) * 10 + idx + 1;
                    
                    return (
                      <div key={prod.asin} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between group hover:border-sky-400 hover:bg-white hover:shadow-md transition-all relative pt-9">
                        <span className="absolute top-2 left-2 w-6 h-6 bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-black rounded-full flex items-center justify-center z-10">
                          #{actualRank}
                        </span>

                        <span className="absolute top-2 right-2 border text-[10px] font-bold px-2 py-0.5 rounded-md z-10 bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
                          👥 {prod.count || 0} hits
                        </span>
                        
                        <div className="w-full h-24 bg-white rounded-xl p-2 border border-slate-100 flex items-center justify-center overflow-hidden mb-3 shadow-sm">
                          <img src={prod.image || 'https://via.placeholder.com/100'} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" alt="" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 line-clamp-2 mb-1 group-hover:text-sky-700 transition-colors" title={prod.title}>{prod.title}</h4>
                          <p className="text-[10px] font-mono text-sky-600 font-bold">{prod.asin}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* THANH ĐIỀU KHIỂN TABLE */}
            <div className="bg-white p-4 rounded-3xl border border-sky-200 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="text-sm text-sky-800 font-bold bg-sky-50 px-4 py-2 rounded-xl border border-sky-200 shadow-sm">
                  Tổng cộng: <span className="text-sky-600 font-black">{pagination?.totalUsers?.toLocaleString() || 0}</span> đối tượng khách hàng
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-600 font-bold uppercase">
                  Hiển thị:
                  <select 
                    value={limit} 
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-sky-500 font-bold cursor-pointer shadow-sm text-sm"
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
                  type="text" placeholder="Tìm kiếm theo AI ID, Tên, Email..."
                  value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:bg-white w-full md:w-80 shadow-sm transition-all"
                />
                <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md shadow-sky-500/20 active:scale-95">Tìm</button>
              </form>
            </div>

            {/* BẢNG CHỨA MA TRẬN TOP 5 SẢN PHẨM ĐỀ XUẤT */}
            <div className="bg-white rounded-3xl border border-sky-200 shadow-sm overflow-hidden relative">
              {loading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-10 font-bold text-sky-700 text-sm">⏳ Đang đồng bộ ma trận dữ liệu từ Mô hình...</div>}

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-sky-50/80 text-sky-800 text-xs font-bold uppercase border-b border-sky-200 tracking-wider">
                      <th className="p-4 w-28">AI ID</th>
                      <th className="p-4 w-1/4">Khách Hàng</th>
                      <th className="p-4 w-40">Amazon ID</th>
                      <th className="p-4">Mặt hàng AI đề xuất tương ứng (Top 5 Đề xuất)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100 text-sm">
                    {(!data?.userAnalytics || data.userAnalytics.length === 0) ? (
                      <tr><td colSpan="4" className="p-16 text-center text-slate-400 font-medium">Không tìm thấy dữ liệu khách hàng phù hợp mục tiêu.</td></tr>
                    ) : (
                      data.userAnalytics.map((user) => (
                        <tr key={user.aiUserId} className="hover:bg-sky-50/40 transition-colors">
                          <td className="p-4 font-mono font-black text-sky-700">#{user.aiUserId}</td>
                          <td className="p-4 text-slate-800 font-bold">
                            {user.name}
                            <div className="text-xs text-slate-400 font-normal mt-0.5">{user.email}</div>
                          </td>
                          <td className="p-4 text-xs font-mono text-amber-600 font-bold">{user.amazonId}</td>
                          <td className="p-4 flex gap-2.5">
                            {user.previewItems?.map((item, i) => (
                              <div key={i} className="relative group/tooltip">
                                <div className="w-11 h-11 rounded-xl border border-slate-200 bg-white object-contain cursor-pointer shadow-sm hover:border-sky-500 p-1 flex items-center justify-center overflow-hidden transition-colors">
                                  <img src={item.image || 'https://via.placeholder.com/40'} alt="" className="max-h-full max-w-full object-contain" />
                                </div>
                                {/* TOOLTIP HOVER CAO CẤP */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 bg-white border border-sky-200 text-xs text-slate-800 p-3 rounded-2xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                  <p className="font-bold text-slate-800 line-clamp-2">{item.title}</p>
                                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                    <span className="text-[10px] font-mono text-sky-600 font-bold">ASIN: {item.asin}</span>
                                    <span className="text-rose-600 font-black">{item.price}</span>
                                  </div>
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

              {/* PHÂN TRANG CONTAINER */}
              {pagination && pagination.totalPages > 0 && (
                <div className="p-4 border-t border-sky-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Trang <span className="font-black text-slate-800">{page}</span> / <span className="font-black text-slate-800">{pagination.totalPages}</span>
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-4 py-2 bg-white text-slate-700 rounded-xl border border-slate-300 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      &larr; Trang trước
                    </button>
                    <button 
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                      className="px-4 py-2 bg-white text-slate-700 rounded-xl border border-slate-300 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      Trang sau &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BIỂU ĐỒ ABLATION STUDY ĐÁNH GIÁ MÔ HÌNH */}
        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn relative min-h-[400px]">
            {loading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex justify-center items-center text-sm font-bold text-sky-700">⏳ Đang tính toán dữ liệu kiểm thử...</div>}

            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-sky-200 shadow-sm">
              <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
                <span className="bg-sky-50 p-1 rounded-md text-sm">📊</span> Biểu Đồ So Sánh Sức Mạnh Thuật Toán (Ablation Study)
              </h3>
              <div className="w-full h-[400px] min-h-[400px] overflow-hidden">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart width={600} height={400} data={scenariosSummary || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="method" angle={-12} textAnchor="end" interval={0} height={80} tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis domain={[0, 'auto']} tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: 16, fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                    
                    {/* Đổi màu các cột Bar sang tone xanh tươi sáng của Sky Theme */}
                    <Bar dataKey="score" name="Model Score" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="HR@20" name="Hit Ratio (HR@20)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="N@20" name="NDCG (N@20)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BẢNG XẾP HẠNG BÊN PHẢI ĐƯỢC CHUẨN HÓA MÀU SẮC */}
            <div className="bg-white rounded-3xl border border-sky-200 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-sky-100 bg-sky-50/50">
                <h3 className="text-sm font-black text-sky-900 flex items-center gap-1.5">🏆 Bảng Xếp Hạng Hiệu Năng Mô Hình</h3>
              </div>
              <div className="divide-y divide-sky-50 flex-grow overflow-y-auto max-h-[380px] text-xs font-mono custom-scrollbar">
                {(!scenariosSummary || scenariosSummary.length === 0) ? (
                  <div className="p-4 text-center text-slate-400 font-medium">Đang chờ nạp cấu trúc...</div>
                ) : (
                  scenariosSummary.map((model, index) => {
                    const rank = index + 1;
                    return (
                      <div key={model.method} className={`p-4 flex justify-between items-center transition-colors ${rank === 1 ? 'bg-sky-50/60 border-l-4 border-sky-500' : 'hover:bg-slate-50'}`}>
                        <div>
                          <div className="font-bold flex items-center gap-1.5 mb-1">
                            {rank === 1 && <span className="text-lg">🥇</span>}
                            {rank === 2 && <span className="text-lg">🥈</span>}
                            {rank === 3 && <span className="text-lg">🥉</span>}
                            {rank > 3 && <span className="w-5 inline-block text-center text-slate-400">#{rank}</span>}
                            
                            <span className={rank === 1 ? "text-sky-800 font-black text-sm font-sans" : "text-slate-700 font-sans font-medium"}>
                              {model.method}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 ml-6 font-medium">
                            Fusion: {model.fusion}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-800 text-sm">
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