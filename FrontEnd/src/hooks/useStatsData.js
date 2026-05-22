import { useState, useEffect, useMemo } from 'react';

export const useStatsData = () => {
  const [stats, setStats] = useState({ 
    totalProducts: 0, 
    totalReviews: 0, 
    totalUsers: 0, 
    avgRating: "0.00", 
    reviewsByTime: [], 
    allCategories: [], 
    ratingDistribution: [], 
    verifiedPurchases: [], 
    topBrands: [], 
    status: "ready" 
  });
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [catLimit, setCatLimit] = useState(5);
  const [catSort, setCatSort] = useState('desc'); 
  const [timeMode, setTimeMode] = useState('year'); 
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  // Hàm lấy dữ liệu thống kê từ server
  const fetchStats = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('http://localhost:5000/api/analytics/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi kết nối Server");
      setStats(data);
    } catch (err) { 
      setErrorMsg(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // Khởi tạo lấy data lần đầu
  useEffect(() => { 
    fetchStats(); 
  }, []);

  // Tự động refresh dữ liệu mỗi 5s nếu backend đang trong trạng thái "calculating"
  useEffect(() => {
    let intervalId = null;
    if (stats.status === "calculating") {
      intervalId = setInterval(() => fetchStats(), 5000); 
    }
    return () => clearInterval(intervalId);
  }, [stats.status]);

  // Hàm xử lý khi người dùng click vào nút "Tính toán lại"
  const handleRecalculate = async () => {
    const confirm = window.confirm("Hệ thống sẽ chạy 7 Module AI phân tích lại toàn bộ Data. Quá trình này khá tốn thời gian. Tiếp tục?");
    if (!confirm) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/analytics/recalculate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      fetchStats(); 
    } catch (err) { 
      alert("Lỗi kết nối Server!"); 
    }
  };

  // Dữ liệu đã được xử lý sẵn cho biểu đồ Danh mục
  const catChartData = useMemo(() => {
    if (!stats.allCategories || stats.allCategories.length === 0) return [];
    let data = [...stats.allCategories];
    data.sort((a, b) => catSort === 'asc' ? a.count - b.count : b.count - a.count);
    return data.slice(0, catLimit);
  }, [stats.allCategories, catLimit, catSort]);

  // Xử lý dữ liệu cho biểu đồ theo thời gian
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

  // Tạo danh sách năm có sẵn để hiển thị trong dropdown filter
  const availableYears = useMemo(() => {
    if (!stats.reviewsByTime) return [];
    return Array.from(new Set(stats.reviewsByTime.map(item => item.year))).sort();
  }, [stats.reviewsByTime]);

  return {
    stats, loading, errorMsg,
    catLimit, setCatLimit, catSort, setCatSort,
    timeMode, setTimeMode, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth,
    handleRecalculate, catChartData, timeChartData, availableYears
  };
};