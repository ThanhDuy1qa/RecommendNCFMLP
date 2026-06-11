import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReviewItem from '../components/ReviewItem'; 
import defaultImg from '../assets/no-image.png';
import { useProductDetail } from '../hooks/useProductDetail'; 
import { useCart } from '../hooks/useCart'; 

const ProductDetail = () => {
  // 🌟 Kéo thêm các biến phân trang từ Hook ra
  const { 
    product, reviews, totalReviews, loading, loadingMore, 
    hasMoreReviews, loadMoreReviews, imageUrl, validDescription, formatPrice 
  } = useProductDetail();
  
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleBuyNow = () => {
    addToCart(product); 
    navigate('/cart');  
  };

  if (loading) return <div className="text-slate-800 text-center p-10 mt-20 font-bold animate-pulse">Đang tải dữ liệu...</div>;
  if (!product) return <div className="text-slate-800 text-center p-10 mt-20 font-bold">Không tìm thấy sản phẩm!</div>;

  return (
    <div className="min-h-screen bg-sky-200 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        <Link to="/" className="text-sky-700 hover:text-sky-800 font-semibold mb-6 inline-block bg-white px-4 py-2 rounded-lg border border-sky-300 hover:bg-sky-50 transition-colors shadow-sm">
          &larr; Quay lại Kho Điện Tử
        </Link>

        {/* --- THÔNG TIN SẢN PHẨM (GIỮ NGUYÊN) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-sky-200 p-6 md:p-10 flex flex-col md:flex-row gap-8 mb-10">
          
          <div className="w-full md:w-1/3 bg-sky-100 border border-sky-200 p-4 rounded-xl flex items-center justify-center min-h-[300px]">
            <img 
              src={imageUrl} 
              alt={product.title || "Sản phẩm"} 
              className="max-w-full max-h-[400px] object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = defaultImg; }} 
            />
          </div>

          <div className="w-full md:w-2/3 flex flex-col">
            <div className="text-xs text-sky-700 mb-3 font-mono uppercase tracking-widest bg-sky-50 inline-block px-3 py-1.5 rounded w-fit border border-sky-200 font-bold">
              {product.brand || "NO BRAND"} | ASIN: {product.asin || product.item_id}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 leading-tight">
              {product.title || "Sản phẩm chưa cập nhật tiêu đề"}
            </h1>
            
            <div className="text-3xl text-rose-500 font-mono font-bold mb-8">
              {formatPrice(product.price)}
            </div>

            {/* NHÓM NÚT BẤM (GIỮ NGUYÊN) */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => addToCart(product)}
                disabled={!product.price} 
                className={`flex-1 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 border
                  ${product.price 
                    ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-600 hover:text-white active:scale-95' 
                    : 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'}`}
              >
                🛒 Thêm vào Giỏ
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={!product.price}
                className={`flex-1 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2
                  ${product.price 
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-slate-800 shadow-blue-500/30 active:scale-95' 
                    : 'bg-slate-200 text-slate-700 cursor-not-allowed hidden'}`}s
              >
                💳 Mua Ngay
              </button>
            </div>

            <div className="flex-grow space-y-6">
              {/* DANH MỤC */}
              {Array.isArray(product.category) && product.category.length > 0 && (
                <div>
                  <h3 className="text-sm text-slate-700 mb-2 uppercase font-bold">Danh mục:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.category.map((cat, idx) => (
                      <span key={idx} className="bg-sky-50 border border-sky-200 text-sky-700 px-3 py-1 rounded-full text-xs font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ĐẶC ĐIỂM NỔI BẬT */}
              {Array.isArray(product.feature) && product.feature.length > 0 && (
                <div>
                  <h3 className="text-sm text-slate-700 mb-2 uppercase font-bold">Đặc điểm nổi bật:</h3>
                  <ul className="list-disc list-outside ml-4 text-slate-700 text-sm space-y-2 bg-sky-50 p-4 rounded-lg border border-sky-200 leading-relaxed">
                    {product.feature.map((feat, idx) => (
                      typeof feat === 'string' && feat.trim() !== "" && <li key={idx} className="pl-1">{feat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* MÔ TẢ */}
              {validDescription && (
                <div>
                  <h3 className="text-sm text-slate-700 mb-2 uppercase font-bold">Mô tả sản phẩm:</h3>
                  <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-sky-50 p-4 rounded-lg border border-sky-200">
                    <div dangerouslySetInnerHTML={{ __html: validDescription }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- ĐÁNH GIÁ KHÁCH HÀNG (ĐÃ CẬP NHẬT PHÂN TRANG) --- */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-sky-200 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⭐</span> Đánh giá từ khách hàng
            </span>
            {/* Hiển thị tổng số lượng đánh giá */}
            <span className="text-sm font-normal text-slate-700">
              Tổng số: <span className="font-bold text-sky-600">{totalReviews.toLocaleString()}</span> đánh giá
            </span>
          </h2>
          
          {reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review, index) => (
                  <ReviewItem key={review._id || index} review={review} />
                ))}
              </div>
              
              {/* 🌟 Nút Tải Thêm Đánh Giá */}
              {hasMoreReviews && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={loadMoreReviews}
                    disabled={loadingMore}
                    className="bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 hover:border-sky-400 px-8 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore && <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>}
                    {loadingMore ? 'Đang tải...' : 'Xem thêm đánh giá'}
                  </button>
                </div>
              )}
              
              {!hasMoreReviews && reviews.length > 0 && (
                <div className="mt-8 text-center text-slate-500 italic">Đã hiển thị toàn bộ đánh giá.</div>
              )}
            </>
          ) : (
            <div className="text-slate-600 bg-sky-50 p-8 rounded-xl border border-sky-200 text-center italic">
              Sản phẩm này hiện chưa có bài đánh giá nào.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}; 

export default ProductDetail;