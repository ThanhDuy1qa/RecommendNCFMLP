import { useState, useEffect } from 'react';
import { useTopSales } from './useTopSales';

export const useMyProducts = () => {
  // 1. Logic lấy danh sách sản phẩm
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/products/my-products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, []);

  // 2. Logic Xóa sản phẩm
  const handleDelete = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/delete/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message);
        setProducts(products.filter(p => p._id !== productId));
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến máy chủ!");
    }
  };

  // 3. Logic lấy Top Sales và xử lý Slider (Thanh trượt)
  const { topProducts, loadingTop } = useTopSales();
  const [startIdx, setStartIdx] = useState(0);

  const handleNext = () => {
    if (startIdx + 5 < (topProducts?.length || 0)) setStartIdx(prev => prev + 5);
  };

  const handlePrev = () => {
    if (startIdx - 5 >= 0) setStartIdx(prev => prev - 5);
  };

  const visibleTopProducts = (topProducts || []).slice(startIdx, startIdx + 5);

  // 4. Trả về tất cả cho giao diện
  return { 
    products, loading, handleDelete,
    topProducts: topProducts || [], loadingTop,
    startIdx, handleNext, handlePrev, visibleTopProducts
  };
};