import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useHome } from '../hooks/useHome';

const Home = () => {
  const navigate = useNavigate();
  const {
    categories = [],
    products = [],
    hotProducts = [], 
    hasMoreHot,
    trendingProducts = [], 
    hasMoreTrending,
    loading,
    hasMore,

    activeCategory,
    activeSearch,

    handleCategoryClick,
    loadMore,

    recommendations = [],
    displayedRecommendations = [],

    loadingRecs,
    aiAlgo,
    setAiAlgo,

    visibleRecsCount,
    loadMoreRecs,

    recommendationLimit,
    setRecommendationLimit,
    isRecommendationLimited
  } = useHome();

  return (
    <div className="bg-gradient-to-br from-sky-200 via-sky-100 to-sky-50 p-4 sm:p-6 min-h-screen">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ==========================================
              SIDEBAR BÊN TRÁI: DANH MỤC SẢN PHẨM
              ========================================== */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white/95 backdrop-blur border border-sky-200 rounded-3xl shadow-sm p-5 lg:sticky lg:top-24">
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
                    🗂️
                  </span>
                  Danh mục
                </h2>

                {activeCategory && (
                  <button
                    onClick={() => handleCategoryClick(activeCategory)}
                    className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-2.5 py-1 rounded-full transition-all"
                  >
                    Bỏ lọc
                  </button>
                )}
              </div>

              <div className="max-h-[520px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {categories.map((cat, index) => {
                  const isActive = activeCategory === cat.value;

                  return (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(cat.value)}
                      className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-sky-400 hover:bg-sky-50'
                      }`}
                      title={cat.name}
                    >
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center p-1.5 shrink-0 ${
                          isActive
                            ? 'bg-white'
                            : 'bg-slate-50 border border-slate-100'
                        }`}
                      >
                        <img
                          src={cat.img}
                          alt={cat.name}
                          className="max-w-full max-h-full object-contain rounded-full"
                        />
                      </span>

                      <span
                        className={`text-xs font-bold line-clamp-2 ${
                          isActive ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </aside>

          {/* ==========================================
              NỘI DUNG BÊN PHẢI (GỢI Ý & KHO HÀNG)
              ========================================== */}
          <main className="flex-1 min-w-0">

            {/* 🌟 LOGIC HIỂN THỊ: NẾU ĐANG TÌM KIẾM SẼ ẨN 3 KHU VỰC ĐẦU */}
            {activeSearch ? (
              <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-sky-200 animate-fadeIn">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                  <span>🔍</span> Kết quả tìm kiếm cho: <span className="text-sky-600">"{activeSearch}"</span>
                </h2>
                <p className="text-slate-500 mt-2 font-medium">
                  Danh sách các sản phẩm khớp với từ khóa của bạn.
                </p>
              </div>
            ) : (
              <>
                {/* 1. KHU VỰC GỢI Ý AI */}
                {(loadingRecs || recommendations.length > 0) && (
                  <section className="mb-12 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                          <span className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
                            ✨
                          </span>
                          Gợi ý dành cho bạn
                        </h2>

                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          Danh sách sản phẩm được đề xuất bởi các mô hình Hybrid, AE, NCF và MLP
                        </p>
                      </div>
                    </div>

                    {/* CHỌN THUẬT TOÁN + SỐ LƯỢNG */}
                    <div className="flex flex-wrap items-center gap-3 mb-6 bg-white shadow-sm p-2 rounded-xl border border-sky-200 w-max max-w-full">
                      <span className="text-xs text-slate-700 font-bold ml-2 mr-1 uppercase">
                        Thuật toán:
                      </span>

                      <button
                        onClick={() => setAiAlgo('hybrid')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          aiAlgo === 'hybrid'
                            ? 'bg-amber-400 text-slate-900 shadow-md'
                            : 'text-slate-700 hover:bg-amber-50 border border-transparent hover:border-amber-200'
                        }`}
                      >
                        Hybrid
                      </button>

                      <button
                        onClick={() => setAiAlgo('ae')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          aiAlgo === 'ae'
                            ? 'bg-sky-600 text-white shadow-md'
                            : 'text-slate-700 hover:bg-sky-50 border border-transparent hover:border-sky-300'
                        }`}
                      >
                        AE
                      </button>

                      <button
                        onClick={() => setAiAlgo('ncf')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          aiAlgo === 'ncf'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200'
                        }`}
                      >
                        NCF
                      </button>

                      <button
                        onClick={() => setAiAlgo('mlp')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          aiAlgo === 'mlp'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'text-slate-700 hover:bg-purple-50 border border-transparent hover:border-purple-200'
                        }`}
                      >
                        MLP
                      </button>

                      <div className="h-6 w-px bg-slate-200 mx-1"></div>

                      <span className="text-xs text-slate-700 font-bold uppercase">
                        Số lượng:
                      </span>

                      <select
                        value={recommendationLimit}
                        onChange={(e) => setRecommendationLimit(e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-sky-200 bg-white text-slate-700 hover:bg-sky-50 focus:outline-none focus:border-sky-500 transition-all cursor-pointer"
                      >
                        <option value="">Mặc định</option>
                        <option value="10">10 sản phẩm</option>
                        <option value="20">20 sản phẩm</option>
                        <option value="50">50 sản phẩm</option>
                        <option value="100">100 sản phẩm</option>
                      </select>
                    </div>

                    {loadingRecs ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-sky-200 shadow-sm">
                        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sky-700 mt-4 font-bold animate-pulse">
                          AI đang phân tích sở thích của bạn...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-start">
                          {displayedRecommendations.map((prod, index) => (
                            <ProductCard
                              key={`ai-rec-${prod.asin}-${index}`}
                              product={prod}
                            />
                          ))}
                        </div>

                        {!isRecommendationLimited && recommendations.length > visibleRecsCount && (
                          <div className="mt-8 flex justify-center">
                            <button
                              onClick={loadMoreRecs}
                              className="bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 hover:border-sky-400 px-8 py-2.5 rounded-full font-bold transition-all shadow-sm"
                            >
                              Xem thêm gợi ý
                            </button>
                          </div>
                        )}

                        {!isRecommendationLimited && recommendations.length > 0 && recommendations.length <= visibleRecsCount && (
                          <div className="mt-8 text-center text-slate-600 font-medium">
                            Bạn đã xem hết danh sách gợi ý!
                          </div>
                        )}

                        {isRecommendationLimited && (
                          <div className="mt-8 text-center text-slate-600 font-medium">
                            Đang hiển thị {displayedRecommendations.length} / {recommendations.length} sản phẩm gợi ý.
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}

                {/* 2. KHU VỰC SẢN PHẨM HOT */}
                {hotProducts.length > 0 && !loading && (
                  <section className="mb-12 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-t border-sky-200 pt-8">
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                          <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">🔥</span>
                          Sản phẩm HOT
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Sản phẩm có lượt bán và quan tâm cao nhất tuần qua</p>
                      </div>
                      {hasMoreHot && (
                        <button 
                          onClick={() => navigate(`/collection/hot${activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : ''}`)}
                          className="text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2 rounded-xl transition-colors shadow-sm active:scale-95"
                        >
                          Xem Top Bán Chạy &rarr;
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-start">
                      {hotProducts.map((prod, index) => (
                        <ProductCard key={`hot-${prod.asin}-${index}`} product={prod} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. KHU VỰC XU HƯỚNG MỚI */}
                {trendingProducts.length > 0 && !loading && (
                  <section className="mb-12 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-t border-sky-200 pt-8">
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                          <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">🚀</span>
                          Xu Hướng Mới
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Các mặt hàng tiềm năng đang thịnh hành</p>
                      </div>
                      {hasMoreTrending && (
                        <button 
                          onClick={() => navigate(`/collection/trending${activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : ''}`)}
                          className="text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-colors shadow-sm active:scale-95"
                        >
                          Khám phá thêm &rarr;
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-start">
                      {trendingProducts.map((prod, index) => (
                        <ProductCard key={`trend-${prod.asin}-${index}`} product={prod} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* 4. KHU VỰC SẢN PHẨM TRONG KHO (HOẶC KẾT QUẢ TÌM KIẾM) */}
            <section>
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 ${!activeSearch ? 'border-t border-sky-200 pt-8' : ''}`}>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <span className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center">
                      📦
                    </span>
                    {/* Tự động đổi tiêu đề nếu đang tìm kiếm */}
                    {activeSearch ? 'Sản phẩm tìm thấy' : 'Sản phẩm trong kho'}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {activeSearch ? 'Kết quả từ hệ thống' : 'Toàn bộ sản phẩm hiện có trong hệ thống'}
                  </p>
                </div>
              </div>

              {loading && products.length === 0 ? (
                <div className="flex justify-center py-20 bg-white rounded-3xl border border-sky-200 shadow-sm">
                  <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-start">
                    {products.map((prod, index) => (
                      <ProductCard
                        key={`all-${prod.asin}-${index}`}
                        product={prod}
                      />
                    ))}
                  </div>

                  {!loading && products.length === 0 && (activeSearch !== '' || activeCategory !== '') && (
                    <div className="text-slate-600 text-center py-10 bg-white shadow-sm rounded-2xl border border-sky-200 mt-4 font-medium">
                      Không tìm thấy sản phẩm nào khớp với tiêu chí của bạn.
                    </div>
                  )}
                </>
              )}

              <div className="mt-8 flex justify-center pb-12">
                {loading && products.length > 0 && (
                  <div className="flex items-center gap-2 text-sky-700 font-bold animate-pulse">
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang tải thêm...
                  </div>
                )}

                {!loading && hasMore && products.length > 0 && (
                  <button
                    onClick={loadMore}
                    className="bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 hover:border-sky-400 px-8 py-2.5 rounded-full font-bold transition-all shadow-sm"
                  >
                    Xem thêm sản phẩm
                  </button>
                )}

                {!hasMore && products.length > 0 && (
                  <div className="text-slate-600 font-medium">
                    Bạn đã xem hết kho hàng!
                  </div>
                )}
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;