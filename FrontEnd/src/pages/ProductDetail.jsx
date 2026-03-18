import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewItem from '../components/ReviewItem'; 
import defaultImg from '../assets/no-image.png'; // <-- Đã thêm ảnh local

const ProductDetail = () => {
  const { asin } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, reviewRes] = await Promise.all([
          fetch(`http://localhost:5000/api/products/${asin}`),
          fetch(`http://localhost:5000/api/reviews/${asin}`)
        ]);

        if (!productRes.ok) throw new Error("Lỗi mạng hoặc không tìm thấy");
        
        const productData = await productRes.json();
        setProduct(productData);

        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData);
        }
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asin]);

  if (loading) return <div className="text-white text-center p-10 mt-20 font-bold">Đang tải dữ liệu...</div>;
  if (!product) return <div className="text-white text-center p-10 mt-20 font-bold">Không tìm thấy sản phẩm!</div>;

  // Sử dụng ảnh local nếu không có ảnh từ DB
  const imageUrl = (Array.isArray(product.imageURLHighRes) && product.imageURLHighRes.length > 0) 
    ? product.imageURLHighRes 
    : (Array.isArray(product.imageURL) && product.imageURL.length > 0) 
      ? product.imageURL 
      : defaultImg;

  const getValidDescription = () => {
    if (!product || !product.description || !Array.isArray(product.description)) {
        return null; 
    }
    const validDesc = product.description.find(desc => typeof desc === 'string' && desc.trim() !== "");
    return validDesc || null;
  };
  
  const validDescription = getValidDescription();

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold mb-6 inline-block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          &larr; Quay lại Kho Điện Tử
        </Link>

        {/* --- THÔNG TIN SẢN PHẨM --- */}
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 md:p-10 flex flex-col md:flex-row gap-8 mb-10">
          
          <div className="w-full md:w-1/3 bg-white p-4 rounded flex items-center justify-center min-h-[300px]">
            <img 
              src={imageUrl} 
              alt={product.title || "Sản phẩm"} 
              className="max-w-full max-h-[400px] object-contain"
              onError={(e) => { e.target.src = defaultImg; }} // <-- Bắt lỗi bằng ảnh local
            />
          </div>

          <div className="w-full md:w-2/3">
            <div className="text-xs text-blue-400 mb-2 font-mono uppercase tracking-widest bg-blue-900/30 inline-block px-2 py-1 rounded">
              {product.brand || "NO BRAND"} | ASIN: {product.asin}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              {product.title || "Sản phẩm chưa cập nhật tiêu đề"}
            </h1>
            
            <div className="text-3xl text-yellow-400 font-mono font-bold mb-6">
              {product.price || "Liên hệ"}
            </div>

            {Array.isArray(product.category) && product.category.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">Danh mục:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.category.map((cat, idx) => (
                    <span key={idx} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(product.feature) && product.feature.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">Đặc điểm nổi bật:</h3>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 bg-slate-900/50 p-4 rounded-lg">
                  {product.feature.map((feat, idx) => (
                    typeof feat === 'string' && feat.trim() !== "" && <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}

            {validDescription && (
              <div>
                <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">Mô tả sản phẩm:</h3>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
                  <div dangerouslySetInnerHTML={{ __html: validDescription }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- ĐÁNH GIÁ KHÁCH HÀNG --- */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
            ⭐ Đánh giá từ khách hàng ({reviews.length})
          </h2>
          
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review, index) => (
                <ReviewItem key={review._id || index} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-slate-400 bg-slate-800 p-8 rounded-lg border border-slate-700 text-center italic">
              Sản phẩm này hiện chưa có bài đánh giá nào.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;