import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import defaultImg from '../assets/no-image.png';

export const useProductDetail = () => {
  const { asin } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // gọi api song song để lấy chi tiết sản phẩm và đánh giá cùng lúc, tránh phải chờ 2 lần
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
// Xử lý logic chọn ảnh hiển thị: ưu tiên imageURLHighRes > imageURL > default
  const imageUrl = useMemo(() => {
    if (!product) return defaultImg;
    if (Array.isArray(product.imageURLHighRes) && product.imageURLHighRes.length > 0) return product.imageURLHighRes;
    if (Array.isArray(product.imageURL) && product.imageURL.length > 0) return product.imageURL;
    return defaultImg;
  }, [product]);
// Kiểm tra xem description có phải là một mảng hợp lệ không, nếu không trả về null để component xử lý hiển thị "Không có mô tả"
  const validDescription = useMemo(() => {
    if (!product || !product.description || !Array.isArray(product.description)) return null;
    const validDesc = product.description.find(desc => typeof desc === 'string' && desc.trim() !== "");
    return validDesc || null;
  }, [product]);

  return {
    product,
    reviews,
    loading,
    imageUrl,
    validDescription
  };
};