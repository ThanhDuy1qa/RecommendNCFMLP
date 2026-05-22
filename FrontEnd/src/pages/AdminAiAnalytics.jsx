import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'; 
// Lưu ý đường dẫn import không cần đuôi .js để tương thích mọi cấu hình Vite/React
import { useAdminAiAnalytics } from '../hooks/useAdminAiAnalytics'; 

const AdminAiAnalytics = () => {
  const {
    activeTab, setActiveTab, scenariosSummary, 
    data, loading, error, // Đã lấy ra biến error
    searchInput, setSearchInput,
    page, setPage, limit, setLimit,
    pagination, handleSearchSubmit
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
            <Link to="/admin/dashboard" className="text-slate-400 hover:text-white text-xs underline transition-colors">
              &larr; Về trang Quản trị
            </Link>
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

        {/* HIỂN THỊ KHUNG BÁO LỖI NẾU CÓ */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl text-center font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* ====================================================
            TAB 1: PHÂN PHỐI GỢI Ý & DANH SÁCH KHÁCH HÀNG
            ==================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🔥</span> Sản Phẩm Xuất Hiện Nhiều Nhất (Top 10)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {(!data?.topProducts || data.topProducts.length === 0) ? (
                  <div className="col-span-full text-center text-slate-500 py-4">Đang chờ dữ liệu...</div>
                ) : (
                  data.topProducts.map((prod, idx) => (
                    <div key={prod.asin} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col justify-between group hover:border-blue-500/50 transition-all relative">
                      <span className="absolute top-2 left-2 w-5 h-5 bg-blue-600/20 text-blue-400 border border-blue-500/40 text-[10px] font-black rounded-full flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div className="w-full h-24 bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3">
                        <img src={prod.image || 'https://via.placeholder.com/100'} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" alt="" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">{prod.title}</h4>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
                <input 
                  type="text" placeholder="Tìm kiếm AI ID..."
                  value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500 min-w-[260px]"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Tìm</button>
              </form>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
              {loading && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-10 font-bold text-blue-400 text-sm">⏳ Đang nạp ma trận...</div>}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 text-xs font-bold uppercase border-b border-slate-700">
                      <th className="p-4">AI ID</th>
                      <th className="p-4">Khách Hàng</th>
                      <th className="p-4">Amazon ID</th>
                      <th className="p-4">Mặt hàng AI đề xuất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-sm">
                    {(!data?.userAnalytics || data.userAnalytics.length === 0) ? (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">Không có dữ liệu.</td></tr>
                    ) : (
                      data.userAnalytics.map((user) => (
                        <tr key={user.aiUserId} className="hover:bg-slate-700/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-blue-400">#{user.aiUserId}</td>
                          <td className="p-4 text-white font-semibold">{user.name}</td>
                          <td className="p-4 text-xs font-mono text-orange-400">{user.amazonId}</td>
                          <td className="p-4 flex gap-2">
                            {user.previewItems?.map((item, i) => (
                              <img key={i} src={item.image || 'https://via.placeholder.com/40'} alt="sp" className="w-8 h-8 rounded border border-slate-600 bg-white"/>
                            ))}
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

        {/* ====================================================
            TAB 2: BIỂU ĐỒ ĐÁNH GIÁ THUẬT TOÁN (ĐÃ ÉP KÍCH THƯỚC TRÁNH LỖI)
            ==================================================== */}
        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in relative min-h-[400px]">
            {loading && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center text-sm font-bold text-blue-400">⏳ Đang tải mô hình...</div>}

            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Đánh Giá Hiệu Năng Kịch Bản
              </h3>
              
              {/* Đã bổ sung fallback width=600 height=400 trực tiếp vào BarChart */}
              <div className="w-full h-[400px] min-h-[400px] overflow-hidden">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart width={600} height={400} data={scenariosSummary || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="scenario" angle={-15} textAnchor="end" interval={0} height={70} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: 8, fontSize: 12 }} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Bar dataKey="final_user_based_score" name="Điểm Tổng Hợp" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg_stability_jaccard" name="Độ Ổn Định Jaccard" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-slate-700 bg-slate-900/40">
                <h3 className="text-sm font-black text-slate-200">🏆 Bảng Xếp Hạng Thuật Toán</h3>
              </div>
              <div className="divide-y divide-slate-700 flex-grow overflow-y-auto max-h-[380px] text-xs font-mono">
                {(!scenariosSummary || scenariosSummary.length === 0) ? (
                  <div className="p-4 text-center text-slate-500">Đang chờ dữ liệu...</div>
                ) : (
                  scenariosSummary.map((scen) => (
                    <div key={scen.scenario} className={`p-4 flex justify-between items-center transition-colors ${scen.final_rank === 1 ? 'bg-blue-600/10' : 'hover:bg-slate-700/30'}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          {scen.final_rank === 1 && <span>🥇</span>}
                          <span className={scen.final_rank === 1 ? "text-blue-400 font-black" : "text-slate-300"}>{scen.scenario}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-white text-sm">{scen.final_user_based_score ? scen.final_user_based_score.toFixed(4) : "0.00"}</div>
                      </div>
                    </div>
                  ))
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