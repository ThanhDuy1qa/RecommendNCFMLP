import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useHome } from '../hooks/useHome';

const Home = () => {
  const {
    categories = [],
    products = [],
    loading,
    hasMore,
    activeCategory,
    activeSearch,
    handleCategoryClick,
    loadMore,
    recommendations = [],
    loadingRecs,
  } = useHome();

  // =========================================================
  // STATE QUẢN LÝ TAB VÀ DỮ LIỆU XU HƯỚNG TỪ FILE JSON
  // =========================================================
  const [activeTab, setActiveTab] = useState('foryou'); 
  const [trendData, setTrendData] = useState({ trending: [], popular: [] });
  const [loadingTrends, setLoadingTrends] = useState(true);

  // 🌟 LOGIC MỚI: TỰ ĐỘNG CHUYỂN TAB NẾU KHÔNG CÓ GỢI Ý AI
  useEffect(() => {
    // Nếu đã load xong AI, mà mảng gợi ý rỗng, VÀ đang đứng ở tab foryou
    if (!loadingRecs && recommendations.length === 0 && activeTab === 'foryou') {
      setActiveTab('trending'); // Tự động đá văng sang tab Xu Hướng
    }
  }, [loadingRecs, recommendations.length, activeTab]);

  // Fetch dữ liệu Xu hướng & Bán chạy từ hệ thống Python (File JSON)
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/analytics/smart-catalog');
        const data = await response.json();
        if (response.ok) {
          const formatData = (items) => items.map(item => ({
            asin: item.asin,
            title: item.title,
            price: item.price ? `$${parseFloat(item.price).toFixed(2)}` : (item.price_clean ? `$${parseFloat(item.price_clean).toFixed(2)}` : "Liên hệ"),
            image: item.image_url || item.image_url_high || null,
            brand: item.brand || "N/A"
          }));

          setTrendData({
            trending: formatData(data.trending || []),
            popular: formatData(data.popular || [])
          });
        }
      } catch (err) {
        console.error("Lỗi tải xu hướng:", err);
      } finally {
        setLoadingTrends(false);
      }
    };
    fetchTrends();
  }, []);

  return (
    <div className="bg-slate-900 p-4 sm:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. BONG BÓNG DANH MỤC LỌC NHANH */}
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 mb-4 border-b border-slate-700 scrollbar-hide items-start">
          {categories.map((cat, index) => {
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

        {/* 2. THANH TAB ĐIỀU HƯỚNG THÔNG MINH */}
        <div className="flex overflow-x-auto gap-2 sm:gap-4 mb-8 pb-2 scrollbar-hide">
          
          {/* 🌟 LOGIC MỚI: CHỈ HIỂN THỊ NÚT TAB NÀY KHI ĐANG LOAD HOẶC ĐÃ CÓ DATA */}
          {(loadingRecs || recommendations.length > 0) && (
            <button
              onClick={() => setActiveTab('foryou')}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
                activeTab === 'foryou' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>🤖</span> Dành Cho Bạn
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('trending')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
              activeTab === 'trending' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span>🚀</span> Xu Hướng Mới
          </button>

          <button
            onClick={() => setActiveTab('popular')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
              activeTab === 'popular' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span>🔥</span> Đang Hot
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span>📦</span> Tất Cả Sản Phẩm
          </button>
        </div>

        {/* 3. KHU VỰC HIỂN THỊ LƯỚI SẢN PHẨM TÙY THEO TAB */}
        
        {/* --- TAB: DÀNH CHO BẠN (AI REC) --- */}
        {activeTab === 'foryou' && (
          <div className="animate-fade-in">
            {loadingRecs ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-400 mt-4 font-bold animate-pulse">AI đang phân tích sở thích của bạn...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 items-start">
                {recommendations.map((prod, index) => (
                  <ProductCard key={`ai-rec-${prod.asin}-${index}`} product={prod} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB: XU HƯỚNG MỚI --- */}
        {activeTab === 'trending' && (
          <div className="animate-fade-in">
            {loadingTrends ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 items-start">
                {trendData.trending.map((prod, index) => (
                  <ProductCard key={`trend-${prod.asin}-${index}`} product={prod} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB: ĐANG HOT --- */}
        {activeTab === 'popular' && (
          <div className="animate-fade-in">
            {loadingTrends ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 items-start">
                {trendData.popular.map((prod, index) => (
                  <ProductCard key={`pop-${prod.asin}-${index}`} product={prod} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB: TOÀN BỘ KHO HÀNG --- */}
        {activeTab === 'all' && (
          <div className="animate-fade-in">
            {loading && products.length === 0 ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 items-start">
                  {products.map((prod, index) => (
                    <ProductCard key={`all-${prod.asin}-${index}`} product={prod} />
                  ))}
                </div>
                {!loading && products.length === 0 && (activeSearch !== "" || activeCategory !== "") && (
                  <div className="text-slate-400 text-center py-10 bg-slate-800 block-none rounded-lg border border-slate-700 mt-4">
                    Không tìm thấy vật phẩm nào khớp với tiêu chí của bạn.
                  </div>
                )}
              </>
            )}

            <div className="mt-8 flex justify-center pb-12">
              {loading && products.length > 0 && (
                <div className="flex items-center gap-2 text-blue-400 font-bold animate-pulse">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> Đang tải thêm...
                </div>
              )}
              {!loading && hasMore && products.length > 0 && (
                <button 
                  onClick={loadMore}
                  className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-600 hover:border-blue-400 px-8 py-2.5 rounded-full font-semibold transition-all shadow-lg"
                >
                  Xem thêm sản phẩm
                </button>
              )}
              {!hasMore && products.length > 0 && (
                <div className="text-slate-500 font-medium">Bạn đã xem hết kho hàng!</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;