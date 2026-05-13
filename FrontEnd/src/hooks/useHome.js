import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png'; 

const importedIcons = import.meta.glob('../assets/categories/*.{png,jpg,jpeg,svg}', { eager: true });
const CATEGORY_IMAGES = {};
for (const path in importedIcons) {
  const fileNameWithExt = path.split('/').pop(); 
  const categoryName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.')); 
  const iconData = importedIcons[path];
  CATEGORY_IMAGES[categoryName] = typeof iconData === 'string' ? iconData : (iconData?.default || iconData);
}

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
  
  const [visibleRecsCount, setVisibleRecsCount] = useState(9);
  
  const location = useLocation();
// Lấy hình danh mục 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/categories');
        const data = await res.json(); 

        if (Array.isArray(data)) {
            const formattedCategories = [
              { name: "Tất cả", value: "", img: "https://cdn-icons-png.flaticon.com/512/8332/8332096.png" },
              ...data.map(cat => {
                const cleanName = cat.replace(/&amp;/g, '&'); 
                const matchedImage = CATEGORY_IMAGES[cleanName] || defaultIcon;
                return { name: cleanName, value: cat, img: matchedImage };
              })
            ];
            setCategories(formattedCategories);
        } else {
            console.error("Dữ liệu danh mục không hợp lệ:", data);
        }
      } catch (err) {
        console.error("Lỗi load danh mục từ DB:", err);
      }
    };
    fetchCategories();
  }, []);

// Lấy danh sách sản phẩm theo trang, tìm kiếm và lọc danh mục
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
        if (isReset) {
          setProducts(data); 
        } else {
          setProducts(prevProducts => [...prevProducts, ...data]); 
        }
      }
    } catch (err) {
      console.error("Lỗi load sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };
// Danh sách sản phẩm gợi ý 
  // Danh sách sản phẩm gợi ý từ kiến trúc Fusion (lấy trực tiếp từ MongoDB)
// Danh sách sản phẩm gợi ý từ kiến trúc Fusion (lấy trực tiếp từ MongoDB)
  useEffect(() => {
    const fetchRecommendations = async () => {
      // 1. SỬA LỖI KEY: Lấy đúng 'user' từ LocalStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      
      // (Tùy chọn) Chỉ gọi API AI nếu người đăng nhập là Khách hàng (Role 0)
      if (user.role !== 0) return;

      // 2. SỬA LỖI ID: Mã Amazon (A0220159ZRNBTRKLG08H) nằm ở trường username
      const reviewerId = user.username; 
      
      setLoadingRecs(true);
      
      try {
        console.log("⚡ Đang lấy gợi ý Fusion từ MongoDB cho:", reviewerId);
        
        // GỌI TRỰC TIẾP SANG NODE.JS (Cổng 5000)
        const res = await fetch(`http://localhost:5000/api/products/recommendations/${reviewerId}`);
        
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu gợi ý từ server");
        }
        
        const productsData = await res.json();

        if (productsData && productsData.length > 0) {
          console.log("✅ Đã nhận danh sách gợi ý:", productsData.length, "sản phẩm");
          setRecommendations(productsData);
        } else {
          console.log("⚠️ Khách hàng này chưa có dữ liệu gợi ý trong bảng Recommendations.");
          setRecommendations([]);
        }
      } catch (error) {
        console.error("❌ Lỗi load gợi ý AI:", error.message);
        setRecommendations([]);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, []); // Chỉ chạy 1 lần khi component mount
//Xử lý tìm kiếm header
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchFromUrl = searchParams.get('search') || "";
    
    setActiveSearch(searchFromUrl);
    setPage(1);
    setProducts([]);
    fetchProducts(1, searchFromUrl, activeCategory, true);
  }, [location.search]);
// Xử lý click lại vào danh mục
  const handleCategoryClick = (catValue) => {
    const newCategory = activeCategory === catValue ? "" : catValue; 
    setActiveCategory(newCategory); 
    setPage(1); 
    setProducts([]); 
    fetchProducts(1, activeSearch, newCategory, true); 
  };
// Xử lý load thêm sản phẩm 
  const loadMore = () => {
    setPage(prev => {
      const next = prev + 1;
      fetchProducts(next, activeSearch, activeCategory, false);
      return next;
    });
  };
// Load thêm sản phẩm gợi ý
  const loadMoreRecs = () => {
    setVisibleRecsCount(prev => prev + 9); 
  };

  return {
    categories,
    products, loading, hasMore, activeCategory, activeSearch,
    handleCategoryClick, loadMore,
    recommendations, loadingRecs ,
    visibleRecsCount, loadMoreRecs
  };
};