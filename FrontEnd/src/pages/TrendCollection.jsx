import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import defaultIcon from '../assets/no-image.png'; 

const TrendCollection = () => {
  const { type } = useParams(); 
  const navigate = useNavigate();
  
  // 🌟 MỚI: Lấy thông số danh mục truyền qua URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = searchParams.get('category') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isHot = type === 'hot';
  const pageConfig = {
    title: isHot ? '🔥 Top Sản Phẩm Bán Chạy' : '🚀 Xu Hướng Mới Nổi',
    desc: isHot ? 'Danh sách các mặt hàng đang có lượt quan tâm cao nhất.' : 'Những mặt hàng tiềm năng được AI dự đoán sẽ bùng nổ.',
    color: isHot ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
  };

  useEffect(() => {
    const fetchFullList = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('http://localhost:5000/api/analytics/compare', { headers });

        if (res.ok) {
          const data = await res.json();
          const targetArray = isHot ? data.stable_history_and_model : data.future_trend_by_model;
          
          if (targetArray) {
            const formattedData = targetArray.map(item => {
              let cleanPrice = 'Liên hệ';
              if (item.price !== undefined && item.price !== null) {
                const numericPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
                if (!isNaN(numericPrice)) {
                  cleanPrice = numericPrice.toFixed(2);
                }
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
            });
            setProducts(formattedData);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu collection:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFullList();
  }, [type, isHot]);

  // 🌟 MỚI: Tự động lọc danh sách dựa trên categoryFilter lấy từ URL
  const filteredProducts = useMemo(() => {
    if (!categoryFilter) return products;
    const normCat = categoryFilter.toLowerCase().replace(/&/g, '').replace(/\s+/g, ' ').trim();
    return products.filter(prod => {
      if (!prod.main_cat) return false;
      const pCat = prod.main_cat.toLowerCase().replace(/&/g, '').replace(/\s+/g, ' ').trim();
      return pCat.includes(normCat) || normCat.includes(pCat);
    });
  }, [products, categoryFilter]);

  return (
    <div className="bg-gradient-to-br from-sky-200 via-sky-100 to-sky-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="mb-4 text-sm font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-colors border border-sky-200"
            >
              &larr; Quay lại
            </button>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800">
              {pageConfig.title} 
              {/* Nếu có lọc danh mục thì hiện tên danh mục lên header */}
              {categoryFilter && <span className="text-sky-600"> - {categoryFilter}</span>}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">{pageConfig.desc}</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl border font-black text-lg shadow-sm ${pageConfig.color}`}>
            Tổng: {filteredProducts.length} SP
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-sky-200">
            <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sky-700 font-bold mt-4 animate-pulse">Đang nạp danh sách...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-sky-200 shadow-sm">
            <span className="text-6xl block mb-4">📭</span>
            <p className="text-slate-500 font-medium text-lg">Không có sản phẩm nào thuộc danh mục này lọt top xu hướng.</p>
            <button onClick={() => navigate(-1)} className="mt-6 text-sky-700 font-bold hover:bg-sky-50 bg-white border border-sky-200 px-6 py-2 rounded-xl transition-all shadow-sm">
              &larr; Trở về trang trước
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((prod, index) => (
              <ProductCard key={index} product={prod} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TrendCollection;