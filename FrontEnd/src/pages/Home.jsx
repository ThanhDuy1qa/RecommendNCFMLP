import React from 'react';
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
    visibleRecsCount,
    loadMoreRecs
  } = useHome();

  return (
    <div className="bg-slate-900 p-4 sm:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* =========================================================
            1. BONG BÓNG DANH MỤC (GIỮ NGUYÊN ĐẦU TRANG)
            ========================================================= */}
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 mb-6 border-b border-slate-700 scrollbar-hide items-start">
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

        {/* =========================================================
            KHU VỰC GỢI Ý DÀNH RIÊNG CHO AI LÊN ĐẦU TRANG
            ========================================================= */}
        {loadingRecs && (
          <div className="flex items-center gap-3 text-indigo-400 font-bold animate-pulse mt-4 mb-8">
            <span className="text-2xl">🤖</span> AI đang phân tích sở thích của bạn...
          </div>
        )}

        {!loadingRecs && recommendations.length > 0 && (
          <div className="mt-4 mb-8 bg-slate-800/50 p-6 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
            
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 flex items-center gap-3 relative z-10">
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">✨</span> 
              Gợi ý dành riêng cho bạn
            </h2>
            
            {/* ĐÃ SỬA: Đổi sang lg:grid-cols-6 để xếp vừa vặn 6 sản phẩm 1 hàng ngang */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 items-start relative z-10">
              {recommendations.slice(0, visibleRecsCount).map((prod, index) => (
                <ProductCard key={`ai-rec-${prod.asin}-${index}`} product={prod} />
              ))}
            </div>

            {/* NÚT XEM THÊM DÀNH RIÊNG CHO AI */}
            {visibleRecsCount < recommendations.length && (
              <div className="mt-8 flex justify-center relative z-10">
                <button 
                  onClick={loadMoreRecs}
                  className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 hover:border-indigo-400 px-8 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/5"
                >
                  Xem thêm gợi ý
                </button>
              </div>
            )}
          </div>
        )}
        {/* =========================================================
            3. LOADING VÀ LƯỚI SẢN PHẨM CHUNG CỦA SÀN
            ========================================================= */}
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
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
              <div className="text-slate-400 text-center py-10 bg-slate-800 block-none rounded-lg border border-slate-700 mt-4">
                Không tìm thấy vật phẩm nào khớp với tiêu chí của bạn.
              </div>
            )}
          </>
        )}

        {/* NÚT XEM THÊM SẢN PHẨM CHUNG DƯỚI ĐÁY TRANG */}
        <div className="mt-8 mb-12 flex justify-center pb-12">
          {loading && products.length > 0 && (
            <div className="flex items-center gap-2 text-blue-400 font-bold animate-pulse">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              Đang tải thêm...
            </div>
          )}

          {!loading && hasMore && products.length > 0 && (
            <button 
              onClick={loadMore}
              className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-600 hover:border-blue-400 px-8 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-blue-500/20"
            >
              Xem thêm sản phẩm
            </button>
          )}

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