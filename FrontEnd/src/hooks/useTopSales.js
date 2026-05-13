import { useState, useEffect } from 'react';

export const useTopSales = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    const fetchTopSales = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/products/seller/top-sales', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setTopProducts(data);
        }
      } catch (err) {
        console.error("Lỗi lấy top bán chạy:", err);
      } finally {
        setLoadingTop(false);
      }
    };
    fetchTopSales();
  }, []);

  return { topProducts, loadingTop };
};