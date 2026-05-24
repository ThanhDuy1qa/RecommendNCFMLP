import { useState, useEffect } from 'react';

export const useAdminAiAnalytics = () => {
  const [activeTab, setActiveTab] = useState('products'); 
  const [scenariosSummary, setScenariosSummary] = useState([]);
  const [data, setData] = useState({ topProducts: [], userAnalytics: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  // State cho Bảng khách hàng (Giữ nguyên)
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); 
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [pagination, setPagination] = useState({ totalUsers: 0, totalPages: 1 });

  // =======================================================
  // 🌟 MỚI: STATE CHO PHÂN TRANG BẢNG XẾP HẠNG SẢN PHẨM (TOP)
  // =======================================================
  const [topPage, setTopPage] = useState(1);
  const topLimit = 10; // Mỗi trang hiển thị 10 sản phẩm (2 hàng)
  
  const topProductsRaw = data?.topProducts || [];
  const totalTopPages = Math.ceil(topProductsRaw.length / topLimit);
  // Cắt mảng hiển thị theo trang
  const paginatedTopProducts = topProductsRaw.slice((topPage - 1) * topLimit, topPage * topLimit);

  const handlePrevTop = () => setTopPage(p => Math.max(1, p - 1));
  const handleNextTop = () => setTopPage(p => Math.min(totalTopPages, p + 1));
  // =======================================================

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const cacheKey = `ai_analytics_p${page}_l${limit}_s${search}`;

    try {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);
        if (parsedData.pagination) setPagination(parsedData.pagination);
        setLoading(false);
        return; 
      }

      const res = await fetch(`http://localhost:5000/api/products/admin/ai-analytics?page=${page}&limit=${limit}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
        if (resData.pagination) setPagination(resData.pagination);
        sessionStorage.setItem(cacheKey, JSON.stringify(resData));
      } else {
        setError(resData.message || "Backend từ chối truy cập!");
      }
    } catch (err) {
      setError("Mất kết nối với máy chủ Backend!");
    } finally {
      setLoading(false);
    }
  };

  const fetchScenariosSummary = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const cacheKey = 'ai_ablation_summary';

    try {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        setScenariosSummary(JSON.parse(cachedData));
        setLoading(false);
        return; 
      }

      const res = await fetch('http://localhost:5000/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();

      if (res.ok && resData.ablation_summary) {
        const testResults = resData.ablation_summary.filter(item => item.split === 'test');
        const sortedModels = testResults.sort((a, b) => b.score - a.score);
        setScenariosSummary(sortedModels);
        sessionStorage.setItem(cacheKey, JSON.stringify(sortedModels));
      } else {
        setError("Không tìm thấy dữ liệu đánh giá mô hình!");
      }
    } catch (err) {
      setError("Mất kết nối với máy chủ Backend khi lấy biểu đồ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchAnalytics();
    } else {
      fetchScenariosSummary();
    }
  }, [activeTab, page, limit, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); 
    setSearch(searchInput);
  };

  return {
    activeTab, setActiveTab, scenariosSummary,
    data, loading, error, 
    searchInput, setSearchInput,
    page, setPage, limit, setLimit, pagination, handleSearchSubmit,
    
    // 🌟 TRẢ VỀ CÁC HÀM PHÂN TRANG TOP SẢN PHẨM MỚI
    topPage, totalTopPages, paginatedTopProducts, handlePrevTop, handleNextTop
  };
};