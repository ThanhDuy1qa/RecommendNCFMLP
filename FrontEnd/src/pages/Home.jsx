import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import defaultIcon from '../assets/no-image.png'; 

// 1. TỰ ĐỘNG ĐỌC ẢNH (Bỏ cờ import: 'default' để lấy toàn bộ Object, an toàn hơn)
const importedIcons = import.meta.glob('../assets/categories/*.{png,jpg,jpeg,svg}', { eager: true });

const CATEGORY_IMAGES = {};
for (const path in importedIcons) {
  const fileNameWithExt = path.split('/').pop(); 
  const categoryName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.')); 
  
  // ĐÃ SỬA: Cách lấy ảnh an toàn 100% cho mọi phiên bản Vite
  // Nếu nó trả về chuỗi thì lấy chuỗi, nếu trả về Object thì lấy .default
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

const CATEGORIES = [
  // Icon cứng cho nút "Tất cả" (Đảm bảo đường link này không bị chặn)
  { name: "Tất cả", value: "", img: "https://cdn-icons-png.flaticon.com/512/8332/8332096.png" },
  
  ...RAW_CATEGORIES.map(cat => {
    // Nếu trong Database có tên là "Camera &amp; Photo" (do lỗi Amazon), ta sửa thành "Camera & Photo"
    const cleanName = cat.replace(/&amp;/g, '&'); 
    
    // Tìm ảnh trong từ điển. Chú ý: Tên file ảnh dưới máy bạn phải KHỚP CHÍNH XÁC với chữ cleanName này!
    // Ví dụ: "All Beauty.png", "Camera & Photo.png" (có dấu cách)
    const matchedImage = CATEGORY_IMAGES[cleanName] || defaultIcon;
    
    return {
      name: cleanName,
      value: cat, 
      img: matchedImage 
    };
  })
];

// ... (Phần const Home = () => { ... } giữ nguyên hoàn toàn bên dưới)

const Home = () => {
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

  // ĐÃ SỬA: Lắng nghe URL xem Header có gửi từ khóa Search xuống không
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


  return (
    <div className="bg-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ĐÃ XÓA KHỐI THANH TÌM KIẾM Ở ĐÂY VÌ ĐÃ CHUYỂN QUA FILE HEADER */}

        {/* BONG BÓNG DANH MỤC */}
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 mb-6 border-b border-slate-700 scrollbar-hide items-start">
          {CATEGORIES.map((cat, index) => {
            const isActive = activeCategory === cat.value; 
            
            return (
              <div 
                key={index} 
                onClick={() => handleCategoryClick(cat.value)}
                className="flex flex-col items-center cursor-pointer min-w-[70px] sm:min-w-[90px] group"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center p-2 shadow-lg transition-all duration-300 group-hover:scale-110 
                  ${isActive ? 'ring-4 ring-blue-500 shadow-blue-500/50' : 'ring-2 ring-slate-600 group-hover:ring-blue-300'}`}
                >
                  <img src={cat.img} alt={cat.name} className="max-w-full max-h-full object-contain rounded-full" />
                </div>
                
                <span className={`text-[10px] sm:text-xs text-center mt-2 transition-colors duration-300 line-clamp-2
                  ${isActive ? 'text-blue-400 font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}
                >
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* LOADING & LƯỚI SẢN PHẨM */}
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <p className="text-blue-400 mt-6 font-bold text-lg animate-pulse">Đang lật tung kho hàng...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9 gap-2 sm:gap-3 items-start">
              {products.map((prod, index) => (
                <ProductCard key={`${prod.asin}-${index}`} product={prod} />
              ))}
            </div>

            {!loading && products.length === 0 && (activeSearch !== "" || activeCategory !== "") && (
              <div className="text-slate-400 text-center py-10 bg-slate-800 rounded-lg border border-slate-700 mt-4">
                Không tìm thấy vật phẩm nào khớp với tiêu chí của bạn.
              </div>
            )}
          </>
        )}

        {/* --- ĐÃ SỬA: KHU VỰC NÚT XEM THÊM VÀ LOADING DƯỚI ĐÁY --- */}
        <div className="mt-8 mb-4 flex justify-center">
          {/* Nếu ĐANG TẢI thêm thì hiện vòng xoay nhỏ gọn */}
          {loading && products.length > 0 && (
            <div className="flex items-center gap-2 text-blue-400 font-bold animate-pulse">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              Đang tải thêm...
            </div>
          )}

          {/* Nếu KHÔNG TẢI và CÒN HÀNG thì hiện nút bấm */}
          {!loading && hasMore && products.length > 0 && (
            <button 
              onClick={() => {
                setPage(prev => {
                  const next = prev + 1;
                  fetchProducts(next, activeSearch, activeCategory, false);
                  return next;
                });
              }}
              className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-600 hover:border-blue-400 px-8 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-blue-500/20"
            >
              Xem thêm sản phẩm
            </button>
          )}

          {/* Nếu HẾT HÀNG thì báo hết */}
          {!hasMore && products.length > 0 && (
            <div className="text-slate-500 font-medium">
              Bạn đã xem hết toàn bộ kho hàng!
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;