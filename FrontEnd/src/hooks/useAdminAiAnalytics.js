import { useState, useEffect } from 'react';

export const useAdminAiAnalytics = () => {
  const [activeTab, setActiveTab] = useState('products'); 
  const [scenariosSummary, setScenariosSummary] = useState([]);
  const [data, setData] = useState({ topProducts: [], userAnalytics: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // BỔ SUNG: State bắt lỗi để không bị trắng trang

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); 
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [pagination, setPagination] = useState({ totalUsers: 0, totalPages: 1 });

  // Gọi API 1: Phân phối gợi ý
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/admin/ai-analytics?page=${page}&limit=${limit}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
        if (resData.pagination) setPagination(resData.pagination);
      } else {
        setError(resData.message || "Backend từ chối truy cập (Kiểm tra lại Role Admin)!");
      }
    } catch (err) {
      setError("Mất kết nối với máy chủ Backend!");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API 2: Lấy dữ liệu biểu đồ
  const fetchScenariosSummary = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/products/admin/scenario-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setScenariosSummary(resData);
      } else {
        setError(resData.message || "Lỗi tải kịch bản thuật toán từ Server!");
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
    activeTab, setActiveTab,
    scenariosSummary,
    data, loading, error, // Trả về biến error
    searchInput, setSearchInput,
    page, setPage, limit, setLimit,
    pagination, handleSearchSubmit
  };
};