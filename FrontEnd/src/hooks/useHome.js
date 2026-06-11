import { useState, useEffect, useMemo } from 'react'; 
import { useLocation } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png'; 
import { formatProduct } from '../utils/productHelper'; 
import { useAuth } from './useAuth'; 

export const useHome = () => {
  const { user } = useAuth(); 
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeSearch, setActiveSearch] = useState(""); 
  const [activeCategory, setActiveCategory] = useState(""); 

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [visibleRecsCount, setVisibleRecsCount] = useState(12);
  const [aiAlgo, setAiAlgo] = useState('hybrid');
  const [recommendationLimit, setRecommendationLimit] = useState('');

  // 🌟 ĐÃ SỬA: State mới lưu TOÀN BỘ dữ liệu Hot & Trending
  const [allHotProducts, setAllHotProducts] = useState([]);
  const [allTrendingProducts, setAllTrendingProducts] = useState([]);

  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json(); 

        if (Array.isArray(data)) {
            const formattedCategories = [
              { name: "Tất cả", value: "", img: "https://cdn-icons-png.flaticon.com/512/8332/8332096.png" },
              ...data.map(cat => ({ 
                  name: cat.name, value: cat.name, img: cat.image_url || defaultIcon 
              }))
            ];
            setCategories(formattedCategories);
        }
      } catch (err) {
        console.error("Lỗi load danh mục từ DB:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRealTrends = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch('http://localhost:5000/api/analytics/compare', { headers });

        if (res.ok) {
          const data = await res.json();

          const formatTrendItem = (item) => {
            let cleanPrice = 'Liên hệ';
            if (item.price !== undefined && item.price !== null) {
              const numericPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
              if (!isNaN(numericPrice)) cleanPrice = numericPrice.toFixed(2);
            }

            return {
              _id: item._id || item.item_id || item.asin,
              asin: item.asin,
              title: item.title || 'Chưa có tiêu đề',
              price: cleanPrice, 
              image: item.image_url_high || item.image_url || defaultIcon,
              brand: item.brand || 'N/A',
              main_cat: item.main_cat || 'Điện tử',
              avgRating: item.avgRating || item.avg_rating || 'N/A'
            };
          };

          if (data.stable_history_and_model && data.stable_history_and_model.length > 0) {
            setAllHotProducts(data.stable_history_and_model.map(formatTrendItem));
          }
          if (data.future_trend_by_model && data.future_trend_by_model.length > 0) {
            setAllTrendingProducts(data.future_trend_by_model.map(formatTrendItem));
          }
        }
      } catch (error) {
        console.warn("Không thể lấy dữ liệu Trend thực tế từ server.");
      }
    };
    fetchRealTrends();
  }, []);

  // 🌟 Tự động Lọc Hot Products theo Danh mục
  const filteredHotProducts = useMemo(() => {
    if (!activeCategory) return allHotProducts;
    const normCat = activeCategory.toLowerCase().replace(/&/g, '').replace(/\s+/g, ' ').trim();
    return allHotProducts.filter(prod => {
      if (!prod.main_cat) return false;
      const pCat = prod.main_cat.toLowerCase().replace(/&/g, '').replace(/\s+/g, ' ').trim();
      return pCat.includes(normCat) || normCat.includes(pCat);
    });
  }, [allHotProducts, activeCategory]);

  // 🌟 Tự động Lọc Trending Products theo Danh mục
  const filteredTrendingProducts = useMemo(() => {
    if (!activeCategory) return allTrendingProducts;
    const normCat = activeCategory.toLowerCase().replace(/&/g, '').replace(/\s+/g, ' ').trim();
    return allTrendingProducts.filter(prod => {
      if (!prod.main_cat) return false;
      const pCat = prod.main_cat.toLowerCase().replace(/&/g, '').replace(/\s+/g, ' ').trim();
      return pCat.includes(normCat) || normCat.includes(pCat);
    });
  }, [allTrendingProducts, activeCategory]);

  const fetchProducts = async (pageNumber, searchKeyword, catFilter, isReset = false) => {
    if (loading) return; 
    setLoading(true);
    try {
      const limit = 45;
      const url = `http://localhost:5000/api/products?page=${pageNumber}&limit=${limit}&search=${searchKeyword}&category=${encodeURIComponent(catFilter)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
        if (isReset) setProducts([]); 
      } else {
        setHasMore(data.length === limit); 
        const safeData = data.map(prod => formatProduct(prod)).filter(p => p !== null);

        if (isReset) {
          setProducts(safeData); 
          
          // Mượn tạm data kho hàng nếu mảng AI trống
          setAllHotProducts(prev => prev.length > 0 ? prev : safeData);
          setAllTrendingProducts(prev => prev.length > 0 ? prev : safeData);
        } else {
          setProducts(prevProducts => [...prevProducts, ...safeData]); 
        }
      }
    } catch (err) {
      console.error("Lỗi load sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      const rawLocalUser = localStorage.getItem('user');
      const activeUser = user || (rawLocalUser ? JSON.parse(rawLocalUser) : null);

      if (!activeUser || activeUser.role !== 0) {
        setRecommendations([]); 
        setLoadingRecs(false);  
        return;
      }

      const reviewerId = activeUser.username; 
      setLoadingRecs(true); 
      setVisibleRecsCount(12);
      
      try {
        const res = await fetch(`http://localhost:5000/api/products/recommendations/${reviewerId}?algo=${aiAlgo}`);
        if (!res.ok) throw new Error("Không thể lấy dữ liệu gợi ý từ server");
        
        const productsData = await res.json();
        if (productsData && productsData.length > 0) {
          const safeRecommendations = productsData.map(prod => formatProduct(prod)).filter(p => p !== null);
          setRecommendations(safeRecommendations);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        setRecommendations([]);
      } finally {
        setLoadingRecs(false); 
      }
    };
    
    fetchRecommendations();
  }, [user, aiAlgo]);

  const filteredRecommendations = useMemo(() => {
    if (!activeCategory) return recommendations;
    const normalizeStr = (str) => {
      if (!str) return "";
      return str.toLowerCase().replace(/&/g, '').replace(/\s+/g, ' ').trim();
    };
    const normalizedActiveCat = normalizeStr(activeCategory);
    return recommendations.filter(prod => {
      if (!prod.main_cat) return false;
      const normalizedMainCat = normalizeStr(prod.main_cat);
      return normalizedMainCat.includes(normalizedActiveCat) || normalizedActiveCat.includes(normalizedMainCat);
    });
  }, [recommendations, activeCategory]);

  const isRecommendationLimited = recommendationLimit !== '';
  const displayedRecommendations = useMemo(() => {
    if (isRecommendationLimited) {
      return filteredRecommendations.slice(0, Number(recommendationLimit));
    }
    return filteredRecommendations.slice(0, visibleRecsCount);
  }, [filteredRecommendations, recommendationLimit, visibleRecsCount]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchFromUrl = searchParams.get('search') || "";
    setActiveSearch(searchFromUrl);
    setPage(1);
    setProducts([]);
    fetchProducts(1, searchFromUrl, activeCategory, true);
  }, [location.search]);

  const handleCategoryClick = (catValue) => {
    const newCategory = activeCategory === catValue ? "" : catValue; 
    setActiveCategory(newCategory); 
    setPage(1); 
    setProducts([]); 
    fetchProducts(1, activeSearch, newCategory, true); 
  };

  const loadMore = () => {
    setPage(prev => {
      const next = prev + 1;
      fetchProducts(next, activeSearch, activeCategory, false);
      return next;
    });
  };

  const loadMoreRecs = () => {
    if (isRecommendationLimited) return; 
    setVisibleRecsCount(prev => prev + 12); 
  };

  return {
    aiAlgo, setAiAlgo,
    categories, products, loading, hasMore, activeCategory, activeSearch,
    
    // 🌟 ĐÃ SỬA: Xuất ra mảng cắt 4 phần tử + biến báo trạng thái
    hotProducts: filteredHotProducts.slice(0, 4),
    hasMoreHot: filteredHotProducts.length > 4,
    
    trendingProducts: filteredTrendingProducts.slice(0, 4),
    hasMoreTrending: filteredTrendingProducts.length > 4,
    
    handleCategoryClick, loadMore, 
    recommendations: filteredRecommendations, 
    loadingRecs,
    visibleRecsCount, loadMoreRecs,
    displayedRecommendations,
    recommendationLimit, 
    setRecommendationLimit,
    isRecommendationLimited
  };
};