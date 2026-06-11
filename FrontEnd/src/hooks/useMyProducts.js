import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopSales } from './useTopSales';

export const useMyProducts = () => {
  const navigate = useNavigate();

  // ==============================
  // STATE SẢN PHẨM + DANH MỤC
  // ==============================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌟 THÊM: STATE CHO DANH MỤC ĐANG CHỌN
  const [selectedCategory, setSelectedCategory] = useState('');

  // ==============================
  // STATE FILTER + XU HƯỚNG
  // ==============================
  const [activeFilter, setActiveFilter] = useState('all');
  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState(null);

  // ==============================
  // LẤY SẢN PHẨM + DANH MỤC
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [prodRes, catRes] = await Promise.all([
          fetch('http://localhost:5000/api/products/my-products', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch('http://localhost:5000/api/categories')
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (Array.isArray(prodData)) {
          setProducts(prodData);
        }

        if (Array.isArray(catData)) {
          setCategories(catData);
        }
      } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🌟 THÊM: HÀM ĐỔI DANH MỤC
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // ==============================
  // LẤY DỮ LIỆU XU HƯỚNG
  // ==============================
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setTrendLoading(true);
        setTrendError(null);

        const token = localStorage.getItem('token');

        if (!token) {
          setTrendError('Chưa đăng nhập nên không tải được xu hướng.');
          return;
        }

        const response = await fetch(
          'http://localhost:5000/api/analytics/compare',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Không tải được dữ liệu so sánh xu hướng.'
          );
        }

        setTrendData(data);
      } catch (error) {
        console.warn('Lỗi tải dữ liệu xu hướng:', error.message);
        setTrendError(error.message);
      } finally {
        setTrendLoading(false);
      }
    };

    fetchTrendData();
  }, []);

  // ==============================
  // LẤY ẢNH DANH MỤC
  // ==============================
  const getCategoryImage = (catName) => {
    if (!catName || categories.length === 0) return null;

    const matchedCat = categories.find(
      (category) => category.name?.toLowerCase() === catName.toLowerCase()
    );

    return matchedCat ? matchedCat.image || matchedCat.image_url : null;
  };

  // ==============================
  // XÓA SẢN PHẨM
  // ==============================
  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(
        `http://localhost:5000/api/products/delete/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert('✅ ' + data.message);
        setProducts((prev) => prev.filter((product) => product._id !== productId));
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('❌ Lỗi kết nối đến máy chủ!');
    }
  };

  // ==============================
  // TOP SALES + SLIDER
  // ==============================
  const { topProducts, loadingTop } = useTopSales();
  const [startIdx, setStartIdx] = useState(0);

  const handleNext = () => {
    if (startIdx + 5 < (topProducts?.length || 0)) {
      setStartIdx((prev) => prev + 5);
    }
  };

  const handlePrev = () => {
    if (startIdx - 5 >= 0) {
      setStartIdx((prev) => prev - 5);
    }
  };

  const visibleTopProducts = (topProducts || []).slice(startIdx, startIdx + 5);

  // ==============================
  // MAP XU HƯỚNG THEO ASIN / ITEM_ID
  // ==============================
  const trendMap = useMemo(() => {
    if (!trendData) return {};

    const map = {};

    const addToMap = (list, trendType, trendLabel, trendIcon, trendClass) => {
      (list || []).forEach((item) => {
        const keys = [item.asin, item.item_id, item.product_id]
          .filter((value) => value !== undefined && value !== null && value !== '')
          .map((value) => String(value));

        keys.forEach((key) => {
          map[key] = {
            ...item,
            trendType,
            trendLabel,
            trendIcon,
            trendClass
          };
        });
      });
    };

    addToMap(
      trendData.stable_history_and_model,
      'stable',
      'Hot ổn định',
      '🔥',
      'border-blue-400/50 bg-blue-500/10 text-blue-300'
    );

    addToMap(
      trendData.future_trend_by_model,
      'future',
      'Xu hướng mới',
      '🚀',
      'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
    );

    addToMap(
      trendData.historical_popular_only,
      'historical',
      'Hot quá khứ',
      '⏳',
      'border-amber-400/50 bg-amber-500/10 text-amber-300'
    );

    addToMap(
      trendData.low_priority_watchlist,
      'low',
      'Ít ưu tiên',
      '💤',
      'border-slate-500/50 bg-slate-700/60 text-slate-300'
    );

    return map;
  }, [trendData]);

  const getProductTrend = (product) => {
    const possibleKeys = [product.asin, product.item_id, product.product_id]
      .filter((value) => value !== undefined && value !== null && value !== '')
      .map((value) => String(value));

    for (const key of possibleKeys) {
      if (trendMap[key]) {
        return trendMap[key];
      }
    }

    return null;
  };

  // ==============================
  // LẤY LƯỢT MUA / TƯƠNG TÁC
  // ==============================
  const getSalesCount = (product) => {
    return (
      product.totalSales ??
      product.total_sold ??
      product.sold_count ??
      product.purchase_count ??
      product.order_count ??
      product.sales_count ??
      product.buy_count ??
      product.interaction_count ??
      product.historical_unique_users ??
      product.historical_interactions ??
      product.review_count ??
      product.rating_count ??
      null
    );
  };

  // ==============================
  // LỌC SẢN PHẨM (ĐÃ THÊM LOGIC LỌC DANH MỤC)
  // ==============================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Lọc theo danh mục trước
      if (selectedCategory && product.main_cat !== selectedCategory) {
        return false;
      }

      // 2. Sau đó lọc theo AI
      const trend = getProductTrend(product);

      if (activeFilter === 'all') return true;
      if (activeFilter === 'priority_import') return product.ai_inventory_action === 'priority_import';
      if (activeFilter === 'marketing') return product.ai_is_marketing;
      if (activeFilter === 'stable') return trend?.trendType === 'stable';
      if (activeFilter === 'future') return trend?.trendType === 'future';
      if (activeFilter === 'historical') return trend?.trendType === 'historical';
      if (activeFilter === 'low') return trend?.trendType === 'low';

      return true;
    });
  }, [products, activeFilter, trendMap, selectedCategory]);

  const getCount = (filterType) => {
    // Thu hẹp danh sách theo danh mục hiện tại trước khi đếm
    let baseList = products;
    if (selectedCategory) {
      baseList = products.filter(p => p.main_cat === selectedCategory);
    }

    if (filterType === 'all') return baseList.length;

    if (filterType === 'priority_import') {
      return baseList.filter((product) => product.ai_inventory_action === 'priority_import').length;
    }

    if (filterType === 'marketing') {
      return baseList.filter((product) => product.ai_is_marketing).length;
    }

    if (['stable', 'future', 'historical', 'low'].includes(filterType)) {
      return baseList.filter((product) => getProductTrend(product)?.trendType === filterType).length;
    }

    return 0;
  };

  // ==============================
  // MÀU DÒNG
  // ==============================
  const getRowHighlightClass = (action) => {
    if (action === 'priority_import') {
      return 'bg-emerald-500/10 border-l-4 border-emerald-400/80 hover:bg-emerald-500/20';
    }

    return 'bg-slate-800 border-l-4 border-slate-600/60 hover:bg-slate-700/50';
  };

  // ==============================
  // FILTER BUTTONS
  // ==============================
  const filterButtons = [
    {
      key: 'all',
      label: 'Tất cả',
      icon: '📋',
      className:
        'border-slate-500/50 bg-slate-700/50 text-slate-200 hover:bg-slate-600'
    },
    {
      key: 'priority_import',
      label: 'Ưu tiên nhập/chạy Ads',
      icon: '🚀',
      className:
        'border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
    },
    {
      key: 'marketing',
      label: 'Có tệp Ads',
      icon: '🎯',
      className:
        'border-purple-400/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
    },
    {
      key: 'stable',
      label: 'Hot ổn định',
      icon: '🔥',
      className:
        'border-blue-400/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
    },
    {
      key: 'future',
      label: 'Xu hướng mới',
      icon: '🚀',
      className:
        'border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
    },
    {
      key: 'historical',
      label: 'Hot quá khứ',
      icon: '⏳',
      className:
        'border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
    },
    {
      key: 'low',
      label: 'Ít ưu tiên',
      icon: '💤',
      className:
        'border-slate-500/50 bg-slate-700/50 text-slate-300 hover:bg-slate-600'
    }
  ];

  // ==============================
  // ĐIỀU HƯỚNG ADS
  // ==============================
  const handleGoToMarketingTargets = (product) => {
    navigate('/seller/marketing-targets', {
      state: {
        autoSelectAsin: product.item_id || product.asin
      }
    });
  };

  const sellerCategories = useMemo(() => {
    // 1. Quét lấy tất cả tên danh mục (main_cat), bỏ qua các sản phẩm chưa có danh mục
    const allCatNames = products.map(p => p.main_cat).filter(Boolean);
    
    // 2. Dùng Set để lọc bỏ trùng lặp và sắp xếp theo bảng chữ cái
    const uniqueCatNames = [...new Set(allCatNames)].sort();
    
    // 3. Map thành mảng object { name: '...' } để khớp với cấu trúc UI đang dùng
    return uniqueCatNames.map(name => ({ name }));
  }, [products]);

  return {
    products,
    loading,

    activeFilter,
    setActiveFilter,

    filteredProducts,
    filterButtons,
    getCount,

    trendLoading,
    trendError,
    getProductTrend,

    handleDelete,
    handleGoToMarketingTargets,

    topProducts: topProducts || [],
    loadingTop,
    startIdx,
    handleNext,
    handlePrev,
    visibleTopProducts,

    getCategoryImage,
    getSalesCount,
    getRowHighlightClass,
    
    // 🌟 TRẢ VỀ CÁC BIẾN QUẢN LÝ DANH MỤC ĐỂ GIAO DIỆN SỬ DỤNG
    categories: sellerCategories,
    selectedCategory,
    handleCategoryChange
  };
};