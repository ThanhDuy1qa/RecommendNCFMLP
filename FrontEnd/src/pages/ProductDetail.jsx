import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReviewItem from '../components/ReviewItem'; 
import defaultImg from '../assets/no-image.png';
import { useProductDetail } from '../hooks/useProductDetail'; 
import { useCart } from '../hooks/useCart'; 

const ProductDetail = () => {
  const { product, reviews, loading, imageUrl, validDescription, formatPrice } = useProductDetail();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleBuyNow = () => {
    addToCart(product); 
    navigate('/cart');  
  };

  if (loading) return <div className="text-white text-center p-10 mt-20 font-bold animate-pulse">Đang tải dữ liệu...</div>;
  if (!product) return <div className="text-white text-center p-10 mt-20 font-bold">Không tìm thấy sản phẩm!</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold mb-6 inline-block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 transition-colors">
          &larr; Quay lại Kho Điện Tử
        </Link>

        {/* --- THÔNG TIN SẢN PHẨM --- */}
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 md:p-10 flex flex-col md:flex-row gap-8 mb-10">
          
          {/* CỘT HÌNH ẢNH */}
          <div className="w-full md:w-1/3 bg-white p-4 rounded-xl flex items-center justify-center min-h-[300px] shadow-inner">
            <img 
              src={imageUrl} 
              alt={product.title || "Sản phẩm"} 
              className="max-w-full max-h-[400px] object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = defaultImg; }} 
            />
          </div>

          {/* CỘT THÔNG TIN */}
          <div className="w-full md:w-2/3 flex flex-col">
            <div className="text-xs text-blue-400 mb-3 font-mono uppercase tracking-widest bg-blue-900/30 inline-block px-3 py-1.5 rounded w-fit border border-blue-900/50">
              {product.brand || "NO BRAND"} | ASIN: {product.asin || product.item_id}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              {product.title || "Sản phẩm chưa cập nhật tiêu đề"}
            </h1>
            
            <div className="text-3xl text-yellow-400 font-mono font-bold mb-8">
              {formatPrice(product.price)}
            </div>

            {/* NHÓM NÚT BẤM (Nằm ở trên để KH dễ thấy) */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => addToCart(product)}
                disabled={!product.price} 
                className={`flex-1 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 border
                  ${product.price 
                    ? 'bg-slate-800 border-blue-500 text-blue-400 hover:bg-slate-700 active:scale-95' 
                    : 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed'}`}
              >
                🛒 Thêm vào Giỏ
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={!product.price}
                className={`flex-1 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2
                  ${product.price 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 active:scale-95' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed hidden'}`}
              >
                💳 Mua Ngay
              </button>
            </div>

            <div className="flex-grow space-y-6">
              {/* DANH MỤC */}
              {Array.isArray(product.category) && product.category.length > 0 && (
                <div>
                  <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">Danh mục:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.category.map((cat, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ĐẶC ĐIỂM NỔI BẬT */}
              {Array.isArray(product.feature) && product.feature.length > 0 && (
                <div>
                  <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">Đặc điểm nổi bật:</h3>
                  <ul className="list-disc list-outside ml-4 text-slate-300 text-sm space-y-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    {product.feature.map((feat, idx) => (
                      typeof feat === 'string' && feat.trim() !== "" && <li key={idx} className="pl-1">{feat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* MÔ TẢ */}
              {validDescription && (
                <div>
                  <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">Mô tả sản phẩm:</h3>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <div dangerouslySetInnerHTML={{ __html: validDescription }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- ĐÁNH GIÁ KHÁCH HÀNG --- */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-3 flex items-center gap-2">
            <span>⭐</span> Đánh giá từ khách hàng ({reviews.length})
          </h2>
          
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review, index) => (
                <ReviewItem key={review._id || index} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-slate-400 bg-slate-800 p-8 rounded-xl border border-slate-700 text-center italic shadow-inner">
              Sản phẩm này hiện chưa có bài đánh giá nào.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}; 

export default ProductDetail;