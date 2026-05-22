import { useState, useEffect } from 'react';

export const useImportAdvisor = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' hoặc 'scenarios'
  const [loading, setLoading] = useState(true);
  
  // --- CÁC STATE QUẢN LÝ DỮ LIỆU ĐỘNG ---
  const [productsData, setProductsData] = useState([]);
  const [scenariosSummary, setScenariosSummary] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('users500_topk20_user_focus');
  const [selectedDecision, setSelectedDecision] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); 
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

  // 1. Gọi API lấy danh sách Sản phẩm khuyên nhập (TAB 1)
  const fetchProductsAdvice = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/seller/inventory-advice?page=${page}&limit=15&scenario=${selectedScenario}&decision=${selectedDecision}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setProductsData(resData.items);
        setPagination(resData.pagination);
      }
    } catch (err) {
      console.error("Lỗi tải khuyến nghị nhập hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Gọi API lấy dữ liệu So sánh Kịch bản AI (TAB 2)
  const fetchScenariosSummary = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/products/admin/scenario-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) setScenariosSummary(resData);
    } catch (err) {
      console.error("Lỗi tải báo cáo kịch bản:", err);
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt nạp dữ liệu khi thay đổi Tab hoặc thay đổi tiêu chí bộ lọc
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProductsAdvice();
    } else {
      fetchScenariosSummary();
    }
  }, [activeTab, page, selectedScenario, selectedDecision, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    productsData,
    scenariosSummary,
    selectedScenario,
    setSelectedScenario,
    selectedDecision,
    setSelectedDecision,
    searchInput,
    setSearchInput,
    page,
    setPage,
    pagination,
    handleSearchSubmit
  };
};