import { useState, useEffect, useMemo } from 'react';

// ĐÂY LÀ NƠI CHỨA TOÀN BỘ CHẤT XÁM (LOGIC)
export const useStatsData = () => {
  const [stats, setStats] = useState({ 
    totalProducts: 0, totalReviews: 0, totalUsers: 0, avgRating: "0.00", 
    reviewsByTime: [], allCategories: [], ratingDistribution: [], verifiedPurchases: [], topBrands: [], status: "ready" 
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [catLimit, setCatLimit] = useState(5);
  const [catSort, setCatSort] = useState('desc'); 
  const [timeMode, setTimeMode] = useState('year'); 
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const fetchStats = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('http://localhost:5000/api/analytics/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi kết nối Server");
      setStats(data);
    } catch (err) { setErrorMsg(err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    let intervalId = null;
    if (stats.status === "calculating") intervalId = setInterval(() => fetchStats(), 5000); 
    return () => clearInterval(intervalId);
  }, [stats.status]);

  const handleRecalculate = async () => {
    const confirm = window.confirm("Hệ thống sẽ chạy 7 Module AI phân tích lại toàn bộ Data. Quá trình này khá tốn thời gian. Tiếp tục?");
    if (!confirm) return;
    try {
      const res = await fetch('http://localhost:5000/api/analytics/recalculate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      fetchStats(); 
    } catch (err) { alert("Lỗi kết nối Server!"); }
  };

  const catChartData = useMemo(() => {
    if (!stats.allCategories || stats.allCategories.length === 0) return [];
    let data = [...stats.allCategories];
    data.sort((a, b) => catSort === 'asc' ? a.count - b.count : b.count - a.count);
    return data.slice(0, catLimit);
  }, [stats.allCategories, catLimit, catSort]);

  const timeChartData = useMemo(() => {
    if (!stats.reviewsByTime || stats.reviewsByTime.length === 0) return [];
    const grouped = {};
    stats.reviewsByTime.forEach(item => {
      if (selectedYear !== 'All' && item.year.toString() !== selectedYear) return;
      if (timeMode === 'day' && selectedMonth !== 'All' && item.month.toString() !== selectedMonth) return;
      let key = timeMode === 'year' ? item.year.toString() 
              : timeMode === 'month' ? `${item.year}-${String(item.month).padStart(2, '0')}` 
              : `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + item.count;
    });
    return Object.keys(grouped).sort().map(k => ({ time: k, count: grouped[k] }));
  }, [stats.reviewsByTime, timeMode, selectedYear, selectedMonth]);

  const availableYears = useMemo(() => {
    if (!stats.reviewsByTime) return [];
    return Array.from(new Set(stats.reviewsByTime.map(item => item.year))).sort();
  }, [stats.reviewsByTime]);

  // Cuối cùng, trả về (Export) tất cả những gì UI cần dùng
  return {
    stats, loading, errorMsg,
    catLimit, setCatLimit, catSort, setCatSort,
    timeMode, setTimeMode, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth,
    handleRecalculate, catChartData, timeChartData, availableYears
  };
};