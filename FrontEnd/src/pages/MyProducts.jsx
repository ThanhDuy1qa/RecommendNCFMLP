import React from 'react';
import { Link } from 'react-router-dom';
import defaultIcon from '../assets/no-image.png';
import { useMyProducts } from '../hooks/useMyProducts';

const MyProducts = () => {
  const {
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

    topProducts,
    loadingTop,
    startIdx,
    handleNext,
    handlePrev,
    visibleTopProducts,

    getCategoryImage,
    getSalesCount,
    
    // 🌟 BIẾN QUẢN LÝ BỘ LỌC DANH MỤC TỪ HOOK
    categories,
    selectedCategory,
    handleCategoryChange
  } = useMyProducts();

  // ==============================
  // HÀM MÀU SẮC LIGHT THEME MỚI
  // ==============================
  const getLightRowClass = (action) => {
    switch (action) {
      case 'priority_import_future_trend': return 'bg-emerald-50/60 hover:bg-emerald-100/60';
      case 'priority_import_stable_hot_item': return 'bg-blue-50/60 hover:bg-blue-100/60';
      case 'consider_import': return 'bg-amber-50/60 hover:bg-amber-100/60';
      case 'avoid_over_import_old_trend': return 'bg-rose-50/60 hover:bg-rose-100/60';
      default: return 'bg-white hover:bg-sky-50/40';
    }
  };

  // ==============================
  // RENDER XU HƯỚNG
  // ==============================
  const renderTrendBadge = (product) => {
    const trend = getProductTrend(product);

    if (trendLoading) {
      return <div className="text-[10px] text-slate-400 italic text-center">Đang tải...</div>;
    }

    if (trendError && !trend) {
      return <div className="text-[10px] text-slate-500 text-center border border-slate-200 bg-white shadow-sm px-2 py-2 rounded-lg font-medium">Chưa tải được</div>;
    }

    if (!trend) {
      return <div className="text-[10px] text-slate-500 text-center border border-slate-200 bg-slate-50 shadow-sm px-2 py-2 rounded-lg font-medium">Chưa có dữ liệu</div>;
    }

    const historyRank = trend.history_rank ?? trend.historical_rank ?? null;
    const predictedRank = trend.predicted_rank ?? trend.predictedRank ?? null;
    const historyUsers = trend.historical_unique_users ?? trend.historical_interactions ?? trend.avg_historical_unique_users ?? null;
    const predictedUserCount = trend.predicted_user_count ?? trend.predictedUserCount ?? null;

    return (
      <div className={`border px-2 py-2 rounded-xl text-center bg-white shadow-sm ${trend.trendClass}`}>
        <div className="text-[11px] font-black flex items-center justify-center gap-1 text-slate-800">
          <span>{trend.trendIcon}</span>
          <span>{trend.trendLabel}</span>
        </div>

        <div className="text-[10px] mt-1 opacity-90 font-mono font-bold text-slate-700">
          LS: {historyRank != null ? `#${historyRank}` : 'N/A'} → AI:{' '}
          <span className="text-sky-600">{predictedRank != null ? `#${predictedRank}` : 'N/A'}</span>
        </div>

        <div className="text-[10px] mt-0.5 opacity-80 font-medium text-slate-600">
          {historyUsers != null ? `${historyUsers} lượt cũ` : 'LS: N/A'}
        </div>

        <div className="text-[10px] mt-0.5 opacity-90 font-bold text-sky-700">
          {predictedUserCount != null ? `Dự kiến ${Math.round(predictedUserCount)} users` : 'AI users: N/A'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-sky-200 min-h-screen p-4 sm:p-6 text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-800 flex items-center gap-3">
              <span className="bg-sky-100 p-2 rounded-xl">📦</span> Quản lý Cửa Hàng Thông Minh
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Toàn bộ kho hàng của bạn đã được đính kèm dự báo từ Trí tuệ Nhân tạo.
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Link
              to="/seller/add-product"
              className="flex-1 sm:flex-none text-center bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-500/30 text-sm active:scale-95 flex items-center justify-center gap-2"
            >
              <span>➕</span> Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* TOP SẢN PHẨM */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-sky-800 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-lg">🔥</span> Top Sản Phẩm Bán Chạy Nhất
            </h2>

            {!loadingTop && topProducts.length > 5 && (
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={startIdx === 0}
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 transition-all shadow-sm ${
                    startIdx === 0
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : 'hover:bg-sky-50 hover:border-sky-300 text-sky-600 font-bold'
                  }`}
                >
                  &#8592;
                </button>

                <button
                  onClick={handleNext}
                  disabled={startIdx + 5 >= topProducts.length}
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 transition-all shadow-sm ${
                    startIdx + 5 >= topProducts.length
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : 'hover:bg-sky-50 hover:border-sky-300 text-sky-600 font-bold'
                  }`}
                >
                  &#8594;
                </button>
              </div>
            )}
          </div>

          {loadingTop ? (
            <div className="animate-pulse bg-sky-50/50 h-40 rounded-2xl border border-sky-100 shadow-sm"></div>
          ) : topProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {visibleTopProducts.map((topProd, index) => {
                const salesCount = getSalesCount(topProd);

                return (
                  <div
                    key={topProd.asin || topProd.item_id || index}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
                  >
                    <div>
                      <div className="absolute top-0 left-0 bg-gradient-to-br from-amber-300 to-amber-500 text-white font-black text-sm px-3 py-1 rounded-br-xl z-10 shadow-sm">
                        #{startIdx + index + 1}
                      </div>

                      <div className="h-28 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2 mb-3 mt-4">
                        <img
                          src={topProd.image || topProd.image_url || defaultIcon}
                          alt=""
                          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.target.src = defaultIcon; }}
                        />
                      </div>

                      <h3 className="text-xs font-bold text-slate-800 line-clamp-2 mb-1 group-hover:text-sky-600 transition-colors" title={topProd.title}>
                        {topProd.title}
                      </h3>

                      <div className="flex items-center gap-1.5 mb-2">
                        {getCategoryImage(topProd.main_cat) ? (
                          <img src={getCategoryImage(topProd.main_cat)} alt="" className="w-4 h-4 rounded-full object-cover bg-slate-100 border border-slate-200 p-0.5" />
                        ) : (
                          <span className="text-[10px]">📁</span>
                        )}
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          {topProd.main_cat || 'Chưa phân loại'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2 border-t border-slate-100 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-emerald-600 font-black">
                          {topProd.price ? `$${topProd.price}` : 'Liên hệ'}
                        </span>
                        <span className="text-amber-500 font-bold">
                          ⭐ {topProd.avgRating || topProd.avg_rating || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                        <span className="text-amber-700 font-bold">🛒 Lượt mua</span>
                        <span className="text-amber-600 font-black">
                          {salesCount != null ? salesCount.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-500 italic text-sm font-medium text-center p-4 bg-slate-50 rounded-xl">
              Chưa có đủ dữ liệu tương tác để thống kê Top sản phẩm.
            </div>
          )}
        </div>

        {/* TIÊU ĐỀ + BỘ LỌC KÉP */}
        <div className="bg-white rounded-3xl border border-sky-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-sky-100 bg-white">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span className="bg-sky-100 p-2 rounded-lg">📋</span> Toàn Bộ Danh Sách Phân Tích
                </h2>

                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Đang hiển thị <span className="font-bold text-sky-600">{filteredProducts.length}</span> / {products.length} sản phẩm
                  {trendLoading && (
                    <span className="ml-2 text-sky-600 font-bold animate-pulse">
                      | Đang tải xu hướng...
                    </span>
                  )}
                </p>

                {trendError && (
                  <p className="text-xs text-rose-500 mt-1 font-bold">
                    ⚠️ Không tải được dữ liệu xu hướng: {trendError}
                  </p>
                )}
              </div>

              {/* 🌟 GIAO DIỆN BỘ LỌC DANH MỤC TÍCH HỢP */}
              <div className="w-full md:w-auto">
                <select 
                  value={selectedCategory} 
                  onChange={handleCategoryChange}
                  className="w-full md:w-56 bg-slate-50 border border-slate-200 text-sky-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:border-sky-500 outline-none cursor-pointer shadow-sm appearance-none"
                >
                  <option value="">📁 Tất cả danh mục</option>
                  {categories?.map((cat, idx) => (
                    <option key={cat._id || idx} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
              <div className="flex flex-nowrap gap-2 text-xs min-w-max pt-1">
                {filterButtons.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-4 py-2 rounded-xl border font-bold transition-all whitespace-nowrap shadow-sm ${
                      filter.className
                    } ${
                      activeFilter === filter.key
                        ? 'ring-1 ring-offset-1 ring-offset-white ring-sky-500 scale-[1.02] bg-sky-50 border-sky-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={`Lọc sản phẩm: ${filter.label}`}
                  >
                    <span>{filter.icon}</span>{' '}
                    <span>{filter.label}</span>{' '}
                    <span className={`ml-1 ${activeFilter === filter.key ? 'text-sky-700' : 'text-slate-400'}`}>
                      ({getCount(filter.key)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BẢNG */}
          {loading ? (
            <div className="text-center py-16 flex flex-col items-center bg-white">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-sky-600 font-bold animate-pulse">Đang đồng bộ dữ liệu...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-16 text-center">
              <span className="text-6xl block mb-4 animate-bounce">📭</span>
              <p className="text-slate-500 font-medium text-lg">Bạn chưa có sản phẩm nào trong kho hàng.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-16 text-center">
              <span className="text-6xl block mb-4">🔍</span>
              <p className="text-slate-500 font-medium text-lg">Không có sản phẩm nào thuộc danh mục / bộ lọc này.</p>
              <button
                onClick={() => { setActiveFilter('all'); handleCategoryChange({target: {value: ''}}); }}
                className="mt-6 bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                Xóa bộ lọc - Xem tất cả
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                <thead className="bg-sky-50/80 text-sky-800 text-xs font-bold uppercase border-b-2 border-sky-200 tracking-wider">
                  <tr>
                    <th className="p-4 w-[80px] text-center">Ảnh</th>
                    <th className="p-4 w-[31%]">Thông tin sản phẩm</th>
                    <th className="p-4 w-[140px] text-center border-l border-sky-100">Danh mục</th>
                    <th className="p-4 w-[100px] text-right border-l border-sky-100">Giá</th>
                    <th className="p-4 w-[180px] text-center border-l border-sky-100">Xu hướng</th>
                    <th className="p-4 w-[210px] text-center border-l border-sky-100">AI Marketing</th>
                    <th className="p-4 w-[150px] min-w-[150px] text-center border-l border-sky-100">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className={`border-b border-sky-100 transition-colors ${getLightRowClass(product.ai_inventory_action)}`}
                    >
                      {/* Ảnh */}
                      <td className="p-4">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1 border border-slate-200 shadow-sm mx-auto relative group">
                          <img
                            src={product.image_url_high || product.image_url || defaultIcon}
                            alt=""
                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                            onError={(e) => { e.target.src = defaultIcon; }}
                          />
                        </div>
                      </td>

                      {/* Thông tin sản phẩm */}
                      <td className="p-4">
                        <div className="font-bold text-slate-800 line-clamp-2 mb-1 text-sm leading-snug hover:text-sky-600 transition-colors" title={product.title}>
                          {product.title}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="font-mono text-[10px] text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md font-bold shadow-sm">
                            Mã: {product.item_id || product.asin}
                          </span>

                          {product.brand && (
                            <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium max-w-[140px] truncate shadow-sm">
                              Brand: {product.brand}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Danh mục */}
                      <td className="p-4 text-center border-l border-sky-100/50">
                        <span
                          className="bg-white text-slate-600 text-[11px] font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5 border border-slate-200 shadow-sm max-w-[125px]"
                          title={product.main_cat || 'Chưa phân loại'}
                        >
                          {getCategoryImage(product.main_cat) ? (
                            <img
                              src={getCategoryImage(product.main_cat)}
                              alt="cat"
                              className="w-4 h-4 rounded-full object-cover"
                            />
                          ) : (
                            '📁'
                          )}
                          <span className="truncate">
                            {product.main_cat || 'Chưa phân loại'}
                          </span>
                        </span>
                      </td>

                      {/* Giá */}
                      <td className="p-4 text-right font-black text-emerald-600 font-mono text-base border-l border-sky-100/50">
                        {product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'N/A'}
                      </td>

                      {/* Xu hướng */}
                      <td className="p-4 border-l border-sky-100/50">
                        {renderTrendBadge(product)}
                      </td>

                      {/* AI Marketing */}
                      <td className="p-4 border-l border-sky-100/50">
                        <div className="grid grid-cols-1 gap-2">
                          <div
                            className="flex items-center justify-between gap-2 text-sky-800 font-bold bg-white px-3 py-2 rounded-xl border border-sky-200 shadow-sm"
                            title="Số lượng khách hàng tiềm năng AI quét được"
                          >
                            <span className="text-xs flex items-center gap-1 text-slate-500">
                              👥 Khách
                            </span>
                            <span className="text-sm whitespace-nowrap text-sky-600">
                              {product.ai_predicted_users > 0 ? product.ai_predicted_users.toLocaleString() : '0'} users
                            </span>
                          </div>

                          {product.ai_is_marketing ? (
                            <button
                              onClick={() => handleGoToMarketingTargets(product)}
                              className="w-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 text-xs px-3 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                              title="Sản phẩm này có tệp khách hàng mục tiêu để chạy quảng cáo."
                            >
                              <span>🎯</span>
                              <span>Chiến dịch Ads</span>
                            </button>
                          ) : (
                            <div className="w-full text-center text-[11px] text-slate-400 font-medium border border-slate-200 bg-white px-3 py-2 rounded-xl shadow-sm">
                              Chưa có tệp Ads
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="p-4 border-l border-sky-100/50 relative z-20">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            // 🌟 ĐÃ ĐỔI SANG ASIN
                            to={`/seller/edit-product/${product.asin || product.item_id}`}
                            className="w-9 h-9 flex items-center justify-center text-sky-600 hover:text-white bg-sky-50 hover:bg-sky-600 rounded-xl transition-colors text-sm font-bold border border-sky-200 shadow-sm"
                            title="Sửa sản phẩm"
                          >
                            ✏️
                          </Link>

                          <button
                            // 🌟 ĐÃ ĐỔI SANG ASIN
                            onClick={() => handleDelete(product.asin || product.item_id)}
                            className="w-9 h-9 flex items-center justify-center text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl transition-colors text-sm font-bold border border-rose-200 shadow-sm"
                            title="Xóa sản phẩm"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProducts;