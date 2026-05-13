import { useState, useEffect } from 'react';

export const useMyProducts = () => {
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
        
        if (Array.isArray(data)) {
            setProducts(data);
        } else {
            console.error("Dữ liệu trả về không hợp lệ:", data);
            setProducts([]);
        }
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác!")) {
      return;
    }

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

  return { products, loading, handleDelete };
};