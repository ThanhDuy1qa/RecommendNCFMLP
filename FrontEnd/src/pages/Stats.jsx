import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { useStatsData } from '../hooks/useStatsData'; // Import "Não bộ" vào đây

const COLORS_RATING = ['#10b981', '#84cc16', '#eab308', '#f97316', '#ef4444']; 
const COLORS_VERIFIED = ['#3b82f6', '#64748b']; 
const COLORS_BRANDS = ['#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1'];

const ChartSkeleton = () => (
  <div className="h-[300px] w-full flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="text-slate-400 animate-pulse text-sm">Đang nạp Big Data...</p>
  </div>
);

const Stats = () => {
  // Lấy tất cả mọi thứ ra từ Hook (Code cực kỳ sạch sẽ)
  const {
    stats, loading, errorMsg,
    catLimit, setCatLimit, catSort, setCatSort,
    timeMode, setTimeMode, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth,
    handleRecalculate, catChartData, timeChartData, availableYears
  } = useStatsData();

  return (
    <div className="bg-slate-900 min-h-screen p-4 sm:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-700 pb-4 gap-4">
          <h1 className="text-3xl font-bold text-blue-400">Hệ Thống Phân Tích Dữ Liệu Lớn (BI Dashboard)</h1>
          <button onClick={handleRecalculate} disabled={stats.status === "calculating"} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg ${stats.status === "calculating" ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/30 border border-indigo-500'}`}>
            <svg className={`w-5 h-5 ${stats.status === "calculating" ? 'animate-spin text-slate-500' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {stats.status === "calculating" ? "Đang chạy 7 Module ngầm..." : "🔄 Cập nhật Data Mới"}
          </button>
        </div>

        {loading ? ( <div className="text-center py-20 text-blue-400 animate-pulse">Đang kết nối Server...</div> ) : errorMsg ? ( <div className="text-center text-red-400 bg-slate-800 p-8 rounded-xl">{errorMsg}</div> ) : (
          <>
            {/* THẺ TỔNG QUAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center"><div className="text-4xl mb-3">📦</div><h2 className="text-slate-400 text-xs font-bold uppercase mb-2">Tổng Sản Phẩm</h2><p className="text-3xl font-bold text-blue-400">{stats.totalProducts?.toLocaleString() || 0}</p></div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center"><div className="text-4xl mb-3">👥</div><h2 className="text-slate-400 text-xs font-bold uppercase mb-2">Khách Hàng (Users)</h2><p className="text-3xl font-bold text-purple-400">{stats.status === "calculating" ? "..." : stats.totalUsers?.toLocaleString() || 0}</p></div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center"><div className="text-4xl mb-3">💬</div><h2 className="text-slate-400 text-xs font-bold uppercase mb-2">Lượt Đánh Giá</h2><p className="text-3xl font-bold text-green-400">{stats.totalReviews?.toLocaleString() || 0}</p></div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center relative overflow-hidden">{stats.status === "calculating" && <div className="absolute inset-0 border-2 border-yellow-500 rounded-2xl animate-pulse opacity-50"></div>}<div className="text-4xl mb-3">⭐</div><h2 className="text-slate-400 text-xs font-bold uppercase mb-2">Điểm Trung Bình</h2><p className="text-3xl font-bold text-yellow-400">{stats.status === "calculating" ? "..." : stats.avgRating} <span className="text-xl text-yellow-600">/ 5</span></p></div>
            </div>

            {/* KHU VỰC BIỂU ĐỒ - HÀNG 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-lg font-bold text-slate-200">📈 Tương tác theo Thời gian</h3>
                  <div className="flex flex-wrap gap-2">
                    <select value={timeMode} onChange={(e) => { setTimeMode(e.target.value); setSelectedYear('All'); setSelectedMonth('All'); }} className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-300">
                      <option value="year">Năm</option><option value="month">Tháng</option><option value="day">Ngày</option>
                    </select>
                    {(timeMode === 'month' || timeMode === 'day') && (
                      <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-300">
                        <option value="All">Tất cả năm</option>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    )}
                    {timeMode === 'day' && selectedYear !== 'All' && (
                      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-300">
                        <option value="All">Cả năm</option>{Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeChartData}>
                        <defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={10} minTickGap={20} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(v)} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#fff' }} formatter={(v) => [v.toLocaleString(), "Đánh giá"]} />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-lg font-bold text-slate-200">📊 Phân bố Danh mục</h3>
                  <div className="flex gap-2">
                    <select value={catSort} onChange={(e) => setCatSort(e.target.value)} className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-300">
                      <option value="desc">Nhiều nhất</option><option value="asc">Ít nhất</option>
                    </select>
                    <select value={catLimit} onChange={(e) => setCatLimit(Number(e.target.value))} className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-300">
                      <option value={5}>Top 5</option><option value={10}>Top 10</option><option value={20}>Top 20</option>
                    </select>
                  </div>
                </div>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[300px] w-full overflow-y-auto custom-scrollbar pr-2">
                    <ResponsiveContainer width="100%" height={catLimit > 10 ? catLimit * 30 : 300}>
                      <BarChart data={catChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(v)} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                        <Tooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#fff' }} formatter={(v) => [v.toLocaleString(), "SP"]} />
                        <Bar dataKey="count" fill={catSort === 'desc' ? "#8b5cf6" : "#f59e0b"} radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* KHU VỰC 3 BIỂU ĐỒ - HÀNG 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center">
                <h3 className="text-lg font-bold text-slate-200 mb-2 w-full text-center">🌟 Tỷ lệ Đánh giá</h3>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.ratingDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="count">
                          {(stats.ratingDistribution || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_RATING[index % COLORS_RATING.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#fff' }} formatter={(v) => v.toLocaleString()} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center">
                <h3 className="text-lg font-bold text-slate-200 mb-2 w-full text-center">🛡️ Xác thực Mua hàng</h3>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.verifiedPurchases || []} cx="50%" cy="50%" innerRadius={0} outerRadius={80} paddingAngle={2} dataKey="count">
                          {(stats.verifiedPurchases || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_VERIFIED[index % COLORS_VERIFIED.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#fff' }} formatter={(v) => v.toLocaleString()} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="text-lg font-bold text-slate-200 mb-2 w-full text-center">🏷️ Top Thương hiệu</h3>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.topBrands || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} axisLine={false}/>
                        <Tooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#fff' }} formatter={(v) => [v.toLocaleString(), "SP"]} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                          {(stats.topBrands || []).map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS_BRANDS[index % COLORS_BRANDS.length]} /> ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;