import { useState, useEffect, useMemo } from 'react'; 
import { useLocation } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png'; 
import { formatProduct } from '../utils/productHelper'; // BỔ SUNG: Import hàm chuẩn hóa

export const useHome = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeSearch, setActiveSearch] = useState(""); 
  const [activeCategory, setActiveCategory] = useState(""); 

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [visibleRecsCount, setVisibleRecsCount] = useState(6);
  
  const location = useLocation();

  // 1. Lấy danh mục động từ Database
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

  // 2. Lấy danh sách sản phẩm chung
  const fetchProducts = async (pageNumber, searchKeyword, catFilter, isReset = false) => {
    if (loading) return; 
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/products?page=${pageNumber}&limit=45&search=${searchKeyword}&category=${encodeURIComponent(catFilter)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
        if (isReset) setProducts([]); 
      } else {
        setHasMore(true); 
        
        // ==========================================
        // ÁP DỤNG UTILS: Chuẩn hóa dữ liệu sản phẩm
        // ==========================================
        const safeData = data.map(prod => formatProduct(prod)).filter(p => p !== null);

        if (isReset) {
          setProducts(safeData); 
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

  // 3. Lấy sản phẩm gợi ý Fusion 
  useEffect(() => {
    const fetchRecommendations = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      
      const user = JSON.parse(storedUser);
      if (user.role !== 0) return;

      const reviewerId = user.username; 
      setLoadingRecs(true);
      
      try {
        const res = await fetch(`http://localhost:5000/api/products/recommendations/${reviewerId}`);
        if (!res.ok) throw new Error("Không thể lấy dữ liệu gợi ý từ server");
        
        const productsData = await res.json();
        if (productsData && productsData.length > 0) {
          // ==========================================
          // ÁP DỤNG UTILS: Chuẩn hóa dữ liệu gợi ý AI
          // ==========================================
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
  }, []); 

  // =========================================================
  // THUẬT TOÁN LỌC AI THEO DANH MỤC (ĐÃ KHÔI PHỤC LẠI BẢN FIX LỖI DẤU "&")
  // =========================================================
  const filteredRecommendations = useMemo(() => {
    if (!activeCategory) return recommendations;
    
    // Hàm chuẩn hóa chuỗi để so sánh chính xác các danh mục chứa ký tự đặc biệt như "Camera & Photo"
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

  // Các xử lý sự kiện
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
    setVisibleRecsCount(prev => prev + 6); 
  };

  return {
    categories,
    products, loading, hasMore, activeCategory, activeSearch,
    handleCategoryClick, loadMore,
    recommendations: filteredRecommendations, 
    loadingRecs,
    visibleRecsCount, loadMoreRecs
  };
};