import React, { useState, useEffect } from 'react';

const SmartCatalog = () => {
  const [catalogData, setCatalogData] = useState({ trending: [], popular: [], recommended: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quản lý bộ lọc đang kích hoạt
  const [activeFilter, setActiveFilter] = useState('recommended');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/analytics/smart-catalog');
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Lỗi tải danh mục sản phẩm');
        setCatalogData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-600 font-bold animate-pulse">AI đang chuẩn bị không gian mua sắm...</p>
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-8 text-center bg-red-50 font-bold">⚠️ {error}</div>;

  // Quyết định danh sách sản phẩm hiển thị dựa trên bộ lọc
  let currentProducts = [];
  let badgeConfig = { text: '', color: '' };

  switch (activeFilter) {
    case 'trending':
      currentProducts = catalogData.trending;
      badgeConfig = { text: '🚀 Xu Hướng Mới', color: 'bg-emerald-500 text-white' };
      break;
    case 'popular':
      currentProducts = catalogData.popular;
      badgeConfig = { text: '🔥 Đang Hot', color: 'bg-rose-500 text-white' };
      break;
    case 'recommended':
    default:
      currentProducts = catalogData.recommended;
      badgeConfig = { text: '🧠 AI Gợi ý', color: 'bg-indigo-500 text-white' };
      break;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* Banner / Header của Cửa hàng */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Khám Phá Cửa Hàng Thông Minh
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Trải nghiệm mua sắm được cá nhân hóa và định hướng bởi Trí tuệ Nhân tạo. Tìm đúng thứ bạn cần, trước cả khi bạn biết mình cần nó.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* THANH BỘ LỌC (SMART FILTERS) */}
        <div className="flex flex-wrap justify-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveFilter('recommended')}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'recommended' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🧠</span> Gợi Ý Cho Bạn
          </button>
          
          <button
            onClick={() => setActiveFilter('trending')}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'trending' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🚀</span> Xu Hướng Mới
          </button>
          
          <button
            onClick={() => setActiveFilter('popular')}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'popular' 
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🔥</span> Đang Được Yêu Thích
          </button>
        </div>

        {/* THÔNG KÊ KẾT QUẢ */}
        <div className="text-gray-500 font-medium text-sm flex justify-between items-center px-2">
          <span>Tìm thấy <strong className="text-gray-900">{currentProducts.length}</strong> sản phẩm phù hợp.</span>
        </div>

        {/* LƯỚI SẢN PHẨM (PRODUCT GRID) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {currentProducts.map((prod, idx) => {
            // Xử lý giá tiền (Vì dữ liệu có thể khuyết giá)
            const price = prod.price || prod.price_clean;
            const displayPrice = price ? `$${parseFloat(price).toFixed(2)}` : 'Liên hệ';
            
            return (
              <div 
                key={prod.asin || idx} 
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                {/* Khu vực Hình ảnh & Badge */}
                <div className="relative aspect-square p-4 bg-white flex items-center justify-center overflow-hidden">
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm z-10 ${badgeConfig.color}`}>
                    {badgeConfig.text}
                  </span>
                  
                  <img 
                    src={prod.image_url || 'https://via.placeholder.com/300?text=No+Image'} 
                    alt={prod.title} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Khu vực Thông tin */}
                <div className="p-4 flex flex-col flex-1 border-t border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {prod.brand || 'Thương hiệu đối tác'}
                  </p>
                  <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-snug flex-1" title={prod.title}>
                    {prod.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-400 text-xs">★★★★☆</span>
                    <span className="text-gray-400 text-[10px]">(Đã kiểm duyệt)</span>
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div className="font-black text-lg text-blue-600">
                      {displayPrice}
                    </div>
                    <button className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 p-2 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {currentProducts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            Không có sản phẩm nào trong danh mục này.
          </div>
        )}

      </div>
    </div>
  );
};

export default SmartCatalog;