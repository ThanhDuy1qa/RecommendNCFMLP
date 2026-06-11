import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import defaultImg from '../assets/no-image.png';

export const useProductDetail = () => {
  const { asin } = useParams();
  const [product, setProduct] = useState(null);
  
  // 🌟 ĐÃ SỬA: Thêm các state quản lý phân trang Đánh giá
  const [reviews, setReviews] = useState([]); 
  const [totalReviews, setTotalReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setPage(1); // Đặt lại trang 1 khi đổi sản phẩm
      try {
        const [productRes, reviewRes] = await Promise.all([
          fetch(`http://localhost:5000/api/products/${asin}`),
          // 🌟 Gọi API kèm limit 10 bài đánh giá cho trang đầu
          fetch(`http://localhost:5000/api/reviews/${asin}?page=1&limit=10`)
        ]);

        if (!productRes.ok) throw new Error("Lỗi mạng hoặc không tìm thấy sản phẩm");
        
        const productData = await productRes.json();
        setProduct(productData);

        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          // 🌟 Đón lõng dữ liệu theo chuẩn JSON mới của Backend
          setReviews(reviewData.reviews || []);
          setTotalReviews(reviewData.total || 0);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asin]);

  // 🌟 MỚI: Hàm tải thêm đánh giá
  const loadMoreReviews = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`http://localhost:5000/api/reviews/${asin}?page=${nextPage}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setReviews(prev => [...prev, ...(data.reviews || [])]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Lỗi tải thêm đánh giá:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMoreReviews = reviews.length < totalReviews;

  // Xử lý logic chọn ảnh hiển thị: ưu tiên imageURLHighRes > imageURL > default
  const imageUrl = useMemo(() => {
    if (!product) return defaultImg;
    const highRes = product.imageURLHighRes || product.image_url_high;
    const normalRes = product.imageURL || product.image_url;

    if (Array.isArray(highRes) && highRes.length > 0) return highRes[0];
    if (typeof highRes === 'string' && highRes.trim() !== '') return highRes;
    
    if (Array.isArray(normalRes) && normalRes.length > 0) return normalRes[0];
    if (typeof normalRes === 'string' && normalRes.trim() !== '') return normalRes;

    return defaultImg;
  }, [product]);

  // Kiểm tra xem description có hợp lệ không
  const validDescription = useMemo(() => {
    if (!product || !product.description) return null;
    
    if (Array.isArray(product.description)) {
        const validDesc = product.description.find(desc => typeof desc === 'string' && desc.trim() !== "");
        return validDesc || null;
    }
    
    if (typeof product.description === 'string' && product.description.trim() !== "") {
        return product.description;
    }

    return null;
  }, [product]);

  // Hàm xử lý giá thông minh
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    const priceStr = String(price);
    return priceStr.includes('$') ? priceStr : `$${priceStr}`;
  };

  return {
    product,
    reviews,
    totalReviews,     // Truyền ra ngoài
    loading,
    loadingMore,      // Truyền ra ngoài
    hasMoreReviews,   // Truyền ra ngoài
    loadMoreReviews,  // Truyền ra ngoài
    imageUrl,
    validDescription,
    formatPrice
  };
};