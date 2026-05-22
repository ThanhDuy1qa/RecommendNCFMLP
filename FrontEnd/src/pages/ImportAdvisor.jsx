import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useImportAdvisor } from '../hooks/useImportAdvisor';

const ImportAdvisor = () => {
  const {
    activeTab, setActiveTab,
    loading,
    productsData,
    scenariosSummary,
    selectedScenario, setSelectedScenario,
    selectedDecision, setSelectedDecision,
    searchInput, setSearchInput,
    page, setPage,
    pagination,
    handleSearchSubmit
  } = useImportAdvisor();

  return (
    <div className="bg-slate-900 min-h-screen p-4 md:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* THANH THIẾT LẬP TAB ĐIỀU HƯỚNG */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-blue-400">📈 Trợ Lý Quyết Định Nhập Hàng</h1>
            <p className="text-xs text-slate-400 mt-1">Tối ưu hóa tồn kho dựa trên dự báo nhu cầu thị trường từ ma trận thuật toán AI.</p>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              📦 Sản Phẩm Cần Nhập
            </button>
            <button 
              onClick={() => setActiveTab('scenarios')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'scenarios' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              📊 So Sánh Mô Hình
            </button>
          </div>
        </div>

        {/* ====================================================
            TAB 1: HIỂN THỊ CHI TIẾT SẢN PHẨM KHUYẾN NGHỊ NHẬP
            ==================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* THANH BỘ LỌC ĐIỀU KHIỂN ĐỘNG */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Mô hình kịch bản AI</label>
                <select 
                  value={selectedScenario} 
                  onChange={e => { setSelectedScenario(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-xs p-2.5 font-bold rounded-lg outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="users500_topk20_user_focus">users500_topk20_user_focus (Best)</option>
                  <option value="users300_topk20_balanced">users300_topk20_balanced</option>
                  <option value="users300_topk20_user_focus">users300_topk20_user_focus</option>
                  <option value="users300_topk10_user_focus">users300_topk10_user_focus</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Mức độ ưu tiên nhập</label>
                <select 
                  value={selectedDecision} 
                  onChange={e => { setSelectedDecision(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-xs p-2.5 font-bold rounded-lg outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Tất cả mức độ</option>
                  <option value="HIGH_PRIORITY_IMPORT">🔴 HIGH (Ưu tiên nhập gấp)</option>
                  <option value="MEDIUM_PRIORITY_IMPORT">🟡 MEDIUM (Nhập cầm chừng)</option>
                  <option value="LOW_PRIORITY">🟢 LOW (Hạn chế rủi ro)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Tìm kiếm sản phẩm</label>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input 
                    type="text" placeholder="Tìm kiếm tên sản phẩm, hãng hoặc mã AI ID..."
                    value={searchInput} onChange={e => setSearchInput(e.target.value)}
                    className="flex-grow bg-slate-900 border border-slate-600 rounded-lg text-xs px-3 py-2.5 text-white outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 text-xs font-bold rounded-lg transition-colors">Tìm kiếm</button>
                </form>
              </div>
            </div>

            {/* DANH SÁCH SẢN PHẨM HIỂN THỊ DẠNG GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative min-h-[200px]">
              {loading && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center text-sm font-bold text-blue-400">⏳ Hệ thống đang kết nối cơ sở dữ liệu thật...</div>}
              
              {productsData.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500 font-medium">Không tìm thấy sản phẩm khuyến nghị nào khớp với bộ lọc.</div>
              ) : (
                productsData.map((prod) => (
                  <div key={prod._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between hover:border-slate-500 transition-all relative group shadow-xl">
                    <span className="absolute top-2 left-2 w-6 h-6 bg-slate-900 border border-slate-700 text-blue-400 text-[11px] font-black rounded-full flex items-center justify-center shadow-md">
                      #{prod.user_based_inventory_rank}
                    </span>
                    
                    <div className="w-full h-28 bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3">
                      <img src={prod.image_url || 'https://via.placeholder.com/120'} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" alt="" />
                    </div>

                    <div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black block text-center mb-2 border ${
                        prod.inventory_decision === 'HIGH_PRIORITY_IMPORT' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        prod.inventory_decision === 'MEDIUM_PRIORITY_IMPORT' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      }`}>
                        {prod.inventory_decision === 'HIGH_PRIORITY_IMPORT' ? '🔥 NHẬP GẤP' : prod.inventory_decision === 'MEDIUM_PRIORITY_IMPORT' ? '⚠️ NHẬP CẦM CHỪNG' : '⏹️ HẠN CHẾ RỦI RO'}
                      </span>
                      <h4 className="text-xs font-bold line-clamp-2 text-slate-200 mb-1 leading-snug">{prod.title}</h4>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1">Hãng: <span className="text-white uppercase">{prod.brand}</span></p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-700/60 text-[11px] space-y-1.5 bg-slate-900/40 p-2 rounded-lg font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Khách dự kiến:</span>
                        <span className="text-purple-400 font-bold text-xs">{prod.predicted_user_count} User</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Điểm số AI:</span>
                        <span className="text-yellow-400 font-bold text-xs">{prod.user_based_inventory_score.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* PHÂN TRANG DANH SÁCH KHUYẾN NGHỊ */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4 border-t border-slate-800">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(p - 1, 1))} 
                  className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; Trang trước
                </button>
                <span className="text-xs text-slate-400 font-mono">Trang {page} / {pagination.totalPages}</span>
                <button 
                  disabled={page === pagination.totalPages} 
                  onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))} 
                  className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Trang sau &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            TAB 2: BIỂU ĐỒ SO SÁNH 12 KỊCH BẢN THUẬT TOÁN AI
            ==================================================== */}
        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in relative min-h-[400px]">
            {loading && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center text-sm font-bold text-blue-400">⏳ Đang tải mô hình đối soát...</div>}

            {/* CỘT TRÁI: BIỂU ĐỒ TRỰC QUAN RECHARTS */}
            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Đánh Giá Chất Lượng Kịch Bản Thuật Toán
              </h3>
              
              <div className="w-full h-[400px] min-h-[400px] overflow-hidden">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={scenariosSummary} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="scenario" 
                      angle={-15} 
                      textAnchor="end" 
                      interval={0} 
                      height={70} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    />
                    <YAxis domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: 8, fontSize: 12 }} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Bar dataKey="final_user_based_score" name="Điểm Tổng Hợp Kịch Bản" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg_stability_jaccard" name="Độ Ổn Định Jaccard" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CỘT PHẢI: BẢNG XẾP HẠNG THUẬT TOÁN ĐỐI SOÁT */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-slate-700 bg-slate-900/40">
                <h3 className="text-sm font-black text-slate-200">🏆 Bảng Xếp Hạng Thuật Toán</h3>
              </div>
              <div className="divide-y divide-slate-700 flex-grow overflow-y-auto max-h-[380px] text-xs font-mono">
                {scenariosSummary.map((scen) => (
                  <div key={scen.scenario} className={`p-4 flex justify-between items-center transition-colors ${scen.final_rank === 1 ? 'bg-blue-600/10' : 'hover:bg-slate-700/30'}`}>
                    <div>
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        {scen.final_rank === 1 && <span>🥇</span>}
                        <span className={scen.final_rank === 1 ? "text-blue-400 font-black" : "text-slate-300"}>{scen.scenario}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Tập Train: {scen.top_n_users} users | K= {scen.top_k_per_user}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-white text-sm">{scen.final_user_based_score ? scen.final_user_based_score.toFixed(4) : "0.0000"}</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-1">Hạng #{scen.final_rank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ImportAdvisor;