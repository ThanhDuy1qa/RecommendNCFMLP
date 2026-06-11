import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { useStatsData } from '../hooks/useStatsData'; 

const COLORS_RATING = ['#10b981', '#84cc16', '#eab308', '#f97316', '#ef4444']; 
const COLORS_PRICE = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
const COLORS_BRANDS = ['#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1'];

// Cấu hình UI chung cho Tooltip của biểu đồ nền sáng
const tooltipStyle = { 
  backgroundColor: '#ffffff', 
  borderColor: '#bae6fd', 
  borderRadius: '12px', 
  color: '#334155', 
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  fontWeight: 'bold'
};

const ChartSkeleton = () => (
  <div className="h-[300px] w-full flex flex-col items-center justify-center bg-sky-50/50 rounded-2xl border border-dashed border-sky-200">
    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="text-sky-700 animate-pulse text-sm font-bold">Đang nạp Big Data...</p>
  </div>
);

const Stats = () => {
  const {
    stats, loading, errorMsg,
    catLimit, setCatLimit, catSort, setCatSort,
    timeMode, setTimeMode, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth,
    handleRecalculate, catChartData, timeChartData, availableYears,
    prodLimit, setProdLimit, prodSort, setProdSort, prodChartData,
    userLimit, setUserLimit, userChartData,
    purchasesByDayOfWeek
  } = useStatsData();

  return (
    <div className="bg-sky-200 min-h-screen p-4 sm:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-sky-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm">
              📈
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-sky-800">Hệ Thống Phân Tích (BI Dashboard)</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Phân tích dữ liệu lớn và hành vi người dùng toàn sàn</p>
            </div>
          </div>
          
          <button 
            onClick={handleRecalculate} 
            disabled={stats.status === "calculating"} 
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm
              ${stats.status === "calculating" 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/30 active:scale-95'}`}
          >
            {stats.status === "calculating" ? (
               <><div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> Đang chạy 7 Module ngầm...</>
            ) : "🔄 Cập nhật Data Mới"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sky-700 animate-pulse font-bold text-xl bg-white rounded-3xl border border-sky-200 shadow-sm">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Đang kết nối Server...
          </div>
        ) : errorMsg ? (
          <div className="text-center text-rose-600 bg-rose-50 border border-rose-200 p-8 rounded-3xl font-bold shadow-sm">{errorMsg}</div>
        ) : (
          <>
            {/* HÀNG 1: 4 THẺ TỔNG QUAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow hover:border-sky-300">
                <div className="text-4xl mb-3 bg-sky-50 p-3 rounded-2xl">📦</div>
                <h2 className="text-slate-500 text-xs font-bold uppercase mb-2">Tổng Sản Phẩm</h2>
                <p className="text-3xl font-black text-sky-600">{stats.totalProducts?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow hover:border-purple-300">
                <div className="text-4xl mb-3 bg-purple-50 p-3 rounded-2xl">👥</div>
                <h2 className="text-slate-500 text-xs font-bold uppercase mb-2">Khách Hàng (Users)</h2>
                <p className="text-3xl font-black text-purple-600">{stats.status === "calculating" ? "..." : stats.totalUsers?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow hover:border-emerald-300">
                <div className="text-4xl mb-3 bg-emerald-50 p-3 rounded-2xl">💬</div>
                <h2 className="text-slate-500 text-xs font-bold uppercase mb-2">Lượt Đánh Giá</h2>
                <p className="text-3xl font-black text-emerald-600">{stats.totalReviews?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow hover:border-amber-300">
                <div className="text-4xl mb-3 bg-amber-50 p-3 rounded-2xl">⭐</div>
                <h2 className="text-slate-500 text-xs font-bold uppercase mb-2">Điểm Trung Bình</h2>
                <p className="text-3xl font-black text-amber-500">{stats.status === "calculating" ? "..." : stats.avgRating} <span className="text-xl text-slate-400 font-bold">/ 5</span></p>
              </div>
            </div>

            {/* HÀNG 2: THỜI GIAN & DANH MỤC */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* Tương tác theo thời gian */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-sky-100 pb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-sky-100 p-1.5 rounded-lg">📈</span> Tương tác theo Thời gian
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <select value={timeMode} onChange={(e) => { setTimeMode(e.target.value); setSelectedYear('All'); setSelectedMonth('All'); }} className="bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-50 outline-none focus:border-sky-500 cursor-pointer shadow-sm">
                      <option value="year">Năm</option>
                      <option value="month">Tháng</option>
                      <option value="day">Ngày</option>
                    </select>
                    {(timeMode === 'month' || timeMode === 'day') && (
                      <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-50 outline-none focus:border-sky-500 cursor-pointer shadow-sm">
                        <option value="All">Tất cả năm</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    )}
                    {timeMode === 'day' && selectedYear !== 'All' && (
                      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-50 outline-none focus:border-sky-500 cursor-pointer shadow-sm">
                        <option value="All">Cả năm</option>
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[300px] w-full flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeChartData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickMargin={10} minTickGap={20} fontWeight="bold" />
                        <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(v)} />
                        <Tooltip cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={tooltipStyle} formatter={(v) => [v.toLocaleString(), "Đánh giá"]} />
                        <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Phân bố danh mục */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-sky-100 pb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 p-1.5 rounded-lg">📊</span> Phân bố Danh mục
                  </h3>
                  <div className="flex gap-2">
                    <select value={catSort} onChange={(e) => setCatSort(e.target.value)} className="bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-50 outline-none focus:border-sky-500 cursor-pointer shadow-sm">
                      <option value="desc">Nhiều nhất</option>
                      <option value="asc">Ít nhất</option>
                    </select>
                    <select value={catLimit} onChange={(e) => setCatLimit(Number(e.target.value))} className="bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-50 outline-none focus:border-sky-500 cursor-pointer shadow-sm">
                      <option value={5}>Top 5</option>
                      <option value={10}>Top 10</option>
                      <option value={20}>Top 20</option>
                    </select>
                  </div>
                </div>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[300px] w-full overflow-y-auto custom-scrollbar pr-2 flex-grow">
                    <ResponsiveContainer width="100%" height={Math.max(catChartData.length * 35, 300)}>
                      <BarChart data={catChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={11} fontWeight="bold" tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(v)} />
                        <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} fontWeight="bold" width={110} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={tooltipStyle} formatter={(v) => [v.toLocaleString(), "Sản phẩm"]} />
                        <Bar dataKey="count" fill={catSort === 'desc' ? "#8b5cf6" : "#f59e0b"} radius={[0, 6, 6, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* HÀNG 3: BẢNG XẾP HẠNG (NẰM CHUNG 1 HÀNG 50/50) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              
              {/* Biểu đồ 1: Sản phẩm bán chạy nhất (HÀNG NGANG) */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-sky-100 pb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-rose-100 p-1.5 rounded-lg">🏆</span> Bảng xếp hạng Sản Phẩm
                  </h3>
                  <div className="flex gap-2">
                    <select value={prodSort} onChange={(e) => setProdSort(e.target.value)} className="bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-50 outline-none focus:border-sky-500 cursor-pointer shadow-sm">
                      <option value="desc">Nhiều nhất</option>
                      <option value="asc">Ít nhất</option>
                    </select>
                    <select value={prodLimit} onChange={(e) => setProdLimit(Number(e.target.value))} className="bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-50 outline-none focus:border-sky-500 cursor-pointer shadow-sm">
                      <option value={5}>Top 5</option>
                      <option value={10}>Top 10</option>
                      <option value={20}>Top 20</option>
                      <option value={50}>Top 50</option>
                    </select>
                  </div>
                </div>

                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="w-full overflow-y-auto custom-scrollbar pr-2 flex-grow" style={{ maxHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height={Math.max(prodChartData.length * 45, 300)}>
                      <BarChart data={prodChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={11} fontWeight="bold" tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(v)} />
                        <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} fontWeight="bold" width={180} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={tooltipStyle} formatter={(v) => [v.toLocaleString(), "Đánh giá"]} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={22}>
                          {prodChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#f97316'][index % 5]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Biểu đồ 2: Khách hàng mua nhiều nhất (CỘT ĐỨNG) */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-sky-100 pb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-purple-100 p-1.5 rounded-lg">👑</span> Khách Hàng Năng Nổ
                  </h3>
                  <div className="flex gap-2">
                    <select value={userLimit} onChange={(e) => setUserLimit(Number(e.target.value))} className="bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-50 outline-none focus:border-sky-500 cursor-pointer shadow-sm">
                      <option value={5}>Top 5</option>
                      <option value={10}>Top 10</option>
                      <option value={20}>Top 20</option>
                      <option value={50}>Top 50</option>
                    </select>
                  </div>
                </div>

                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="w-full overflow-x-auto custom-scrollbar pb-2 flex-grow" style={{ height: '400px' }}>
                    <div style={{ minWidth: `${Math.max(userChartData.length * 50, 300)}px`, width: '100%', height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userChartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={11} fontWeight="bold" tickMargin={5} angle={-45} textAnchor="end" height={60} />
                          <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(v)} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={tooltipStyle} formatter={(v) => [v.toLocaleString(), "Đánh giá"]} />
                          <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={50}>
                            {userChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#8b5cf6', '#ec4899', '#f43f5e', '#d946ef', '#a855f7'][index % 5]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* HÀNG 4: 4 BIỂU ĐỒ PHÂN TÍCH NHỎ (CHIA 4 CỘT) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full pb-8">
              
              {/* Tỷ lệ Đánh giá */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center w-full overflow-hidden">
                <h3 className="text-lg font-black text-slate-800 mb-4 w-full text-center border-b border-sky-100 pb-3">🌟 Tỷ lệ Đánh giá</h3>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[250px] w-full flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.ratingDistribution || []} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="count">
                          {(stats.ratingDistribution || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_RATING[index % COLORS_RATING.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => v.toLocaleString()} />
                        <Legend verticalAlign="bottom" height={80} wrapperStyle={{ fontSize: '12px', color: '#475569', fontWeight: 'bold' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Biểu đồ Phân khúc Giá Sản phẩm */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center w-full overflow-hidden">
                <h3 className="text-lg font-black text-slate-800 mb-4 w-full text-center border-b border-sky-100 pb-3">💰 Phân khúc Giá</h3>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[250px] w-full flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={stats.priceDistribution || []} 
                          cx="50%" cy="45%" 
                          innerRadius={50} outerRadius={80} 
                          paddingAngle={4} 
                          dataKey="count"
                        >
                          {(stats.priceDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_PRICE[index % COLORS_PRICE.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => v.toLocaleString() + " Sản phẩm"} />
                        <Legend verticalAlign="bottom" height={80} wrapperStyle={{ fontSize: '12px', color: '#475569', fontWeight: 'bold' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Mua sắm theo ngày trong tuần */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center w-full overflow-hidden">
                <h3 className="text-lg font-black text-slate-800 mb-4 w-full text-center border-b border-sky-100 pb-3">📅 Tương tác trong tuần</h3>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[250px] w-full flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={purchasesByDayOfWeek || []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" tickMargin={5} angle={-45} textAnchor="end" height={50} />
                        <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(v)} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={tooltipStyle} formatter={(v) => [v.toLocaleString(), "Tương tác"]} />
                        <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]}>
                          {(purchasesByDayOfWeek || []).map((entry, index) => <Cell key={`cell-${index}`} fill={['#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#f59e0b'][index % 7]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top Thương hiệu */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-sky-200 shadow-sm flex flex-col items-center w-full overflow-hidden">
                <h3 className="text-lg font-black text-slate-800 mb-4 w-full text-center border-b border-sky-100 pb-3">🏷️ Top Thương hiệu</h3>
                {stats.status === "calculating" ? <ChartSkeleton /> : (
                  <div className="h-[250px] w-full flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.topBrands || []} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} fontWeight="bold" width={70} tickLine={false} axisLine={false}/>
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={tooltipStyle} formatter={(v) => [v.toLocaleString(), "SP"]} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                          {(stats.topBrands || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_BRANDS[index % COLORS_BRANDS.length]} /> )}
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