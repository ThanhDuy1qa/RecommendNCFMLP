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
        const [productRes, reviewRes] = await Promise.all([
          fetch(`http://localhost:5000/api/products/${asin}`),
          fetch(`http://localhost:5000/api/reviews/${asin}`)
        ]);

        if (!productRes.ok) throw new Error("Lỗi mạng hoặc không tìm thấy sản phẩm");
        
        const productData = await productRes.json();
        setProduct(productData);

        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asin]);

  // Xử lý logic chọn ảnh hiển thị: ưu tiên imageURLHighRes > imageURL > default
  const imageUrl = useMemo(() => {
    if (!product) return defaultImg;
    // Kiểm tra cấu trúc dữ liệu mới nhất (thường là image_url hoặc imageURL)
    const highRes = product.imageURLHighRes || product.image_url_high;
    const normalRes = product.imageURL || product.image_url;

    if (Array.isArray(highRes) && highRes.length > 0) return highRes[0]; // Lấy ảnh đầu tiên nếu là mảng
    if (typeof highRes === 'string' && highRes.trim() !== '') return highRes;
    
    if (Array.isArray(normalRes) && normalRes.length > 0) return normalRes[0];
    if (typeof normalRes === 'string' && normalRes.trim() !== '') return normalRes;

    return defaultImg;
  }, [product]);

  // Kiểm tra xem description có hợp lệ không
  const validDescription = useMemo(() => {
    if (!product || !product.description) return null;
    
    // Xử lý nếu description là mảng
    if (Array.isArray(product.description)) {
        const validDesc = product.description.find(desc => typeof desc === 'string' && desc.trim() !== "");
        return validDesc || null;
    }
    
    // Xử lý nếu description là chuỗi (string)
    if (typeof product.description === 'string' && product.description.trim() !== "") {
        return product.description;
    }

    return null;
  }, [product]);

  // Hàm xử lý giá thông minh (Được chuyển từ Component sang Hook)
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    const priceStr = String(price);
    return priceStr.includes('$') ? priceStr : `$${priceStr}`;
  };

  return {
    product,
    reviews,
    loading,
    imageUrl,
    validDescription,
    formatPrice
  };
};