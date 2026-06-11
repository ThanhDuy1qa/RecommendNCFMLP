import { useState, useEffect, useMemo } from 'react';

export const useAdminAiAnalytics = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' hoặc 'scenarios'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State kiểm soát bộ lọc phân trang danh sách khách hàng
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // State kiểm soát phân trang Bảng xếp hạng sản phẩm (Top Items) bên trên
  const [topPage, setTopPage] = useState(1);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: activeSearch
        });

        // 🌟 ĐÃ SỬA: Thay thế url thành nhóm /api/analytics để xóa bỏ lỗi 404
        const res = await fetch(`http://localhost:5000/api/analytics/admin/ai-analytics?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Không thể tải dữ liệu phân tích AI');

        setData(json);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [page, limit, activeSearch]);

  // Biến phục vụ vẽ biểu đồ thuật toán ở Tab 2
  const scenariosSummary = useMemo(() => {
    return data?.scenariosSummary || [];
  }, [data]);

  // Xử lý sự kiện khi ấn nút Tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput);
  };

  // Logic tự động gom nhóm, đếm tần suất xuất hiện của các item để làm "Bảng xếp hạng sản phẩm đề xuất"
  const allTopRecommendedProducts = useMemo(() => {
    if (!data?.userAnalytics) return [];
    
    const freqMap = {};
    data.userAnalytics.forEach(user => {
      user.previewItems?.forEach(item => {
        if (!item.asin || item.asin === 'N/A') return;
        if (!freqMap[item.asin]) {
          freqMap[item.asin] = {
            asin: item.asin,
            title: item.title,
            image: item.image,
            count: 0
          };
        }
        freqMap[item.asin].count += 1;
      });
    });

    return Object.values(freqMap).sort((a, b) => b.count - a.count);
  }, [data]);

  // Phân trang Client-side cho khu vực ô Grid sản phẩm HOT bên trên (Mỗi trang hiện 5 sản phẩm)
  const totalTopPages = Math.ceil(allTopRecommendedProducts.length / 10) || 1;
  
  const paginatedTopProducts = useMemo(() => {
    const start = (topPage - 1) * 10;
    return allTopRecommendedProducts.slice(start, start + 10);
  }, [allTopRecommendedProducts, topPage]);

  const handleNextTop = () => {
    if (topPage < totalTopPages) setTopPage(prev => prev + 1);
  };

  const handlePrevTop = () => {
    if (topPage > 1) setTopPage(prev => prev - 1);
  };

  return {
    activeTab,
    setActiveTab,
    scenariosSummary,
    data,
    loading,
    error,
    searchInput,
    setSearchInput,
    page,
    setPage,
    limit,
    setLimit,
    pagination: data?.pagination || { totalUsers: 0, totalPages: 1 },
    handleSearchSubmit,
    topPage,
    totalTopPages,
    paginatedTopProducts,
    handlePrevTop,
    handleNextTop
  };
};