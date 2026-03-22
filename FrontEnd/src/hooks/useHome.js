import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png'; 

// ==============================================================
// 1. TỰ ĐỘNG ĐỌC ẢNH VÀ CHUẨN BỊ DANH MỤC
// ==============================================================
const importedIcons = import.meta.glob('../assets/categories/*.{png,jpg,jpeg,svg}', { eager: true });

const CATEGORY_IMAGES = {};
for (const path in importedIcons) {
  const fileNameWithExt = path.split('/').pop(); 
  const categoryName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.')); 
  const iconData = importedIcons[path];
  CATEGORY_IMAGES[categoryName] = typeof iconData === 'string' ? iconData : (iconData?.default || iconData);
}

const RAW_CATEGORIES = [
  "All Beauty", "All Electronics", "Amazon Devices", "Amazon Fire TV", "Amazon Home", "Apple Products", 
  "Appliances", "Arts, Crafts & Sewing", "Automotive", "Baby", "Books", 
  "Camera & Photo", "Car Electronics", "Cell Phones & Accessories", "Computers", 
  "GPS & Navigation", "Grocery", "Health & Personal Care", "Home Audio & Theater", 
  "Industrial & Scientific", "Movies & TV", "Musical Instruments", "Office Products", 
  "Pet Supplies", "Portable Audio & Accessories", "Software", "Sports & Outdoors", 
  "Tools & Home Improvement", "Toys & Games", "Video Games"
];

// Export cái mảng này ra để tí nữa UI lấy dùng vẽ Bong bóng
export const CATEGORIES = [
  { name: "Tất cả", value: "", img: "https://cdn-icons-png.flaticon.com/512/8332/8332096.png" },
  ...RAW_CATEGORIES.map(cat => {
    const cleanName = cat.replace(/&amp;/g, '&'); 
    const matchedImage = CATEGORY_IMAGES[cleanName] || defaultIcon;
    return { name: cleanName, value: cat, img: matchedImage };
  })
];

// ==============================================================
// 2. HOOK LOGIC (STATE & API)
// ==============================================================
export const useHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [activeSearch, setActiveSearch] = useState(""); 
  const [activeCategory, setActiveCategory] = useState(""); 

  const location = useLocation();

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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchFromUrl = searchParams.get('search') || "";
    
    setActiveSearch(searchFromUrl);
    setPage(1);
    setProducts([]);
    fetchProducts(1, searchFromUrl, activeCategory, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return {
    products, loading, hasMore, activeCategory, activeSearch,
    handleCategoryClick, loadMore
  };
};