import { useState, useEffect } from 'react';
import { useCart } from './useCart';

export const useOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      let orderUrl = `http://localhost:5000/api/orders/history?page=1&limit=50`;
      if (activeSearch) orderUrl += `&search=${encodeURIComponent(activeSearch)}`;
      if (activeTab !== 'Tất cả') orderUrl += `&status=${encodeURIComponent(activeTab)}`;
      if (timeFilter) orderUrl += `&timeFilter=${encodeURIComponent(timeFilter)}`;

      const [ordersRes, reviewsRes] = await Promise.all([
        fetch(orderUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/reviews/my-history', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const ordersData = await ordersRes.json();
      const reviewsData = await reviewsRes.json();
      
      if (ordersRes.ok) setOrders(ordersData.orders || ordersData || []); 
      if (reviewsRes.ok) setMyReviews(reviewsData);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab, activeSearch, timeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const handleBuyAgain = (item) => {
    addToCart(item);
  };

  // 🌟 TRẢ RA fetchAllData ĐỂ COMPONENT GỌI LẠI KHI SUBMIT MODAL THÀNH CÔNG
  return {
    orders, myReviews, loading, fetchAllData,
    activeTab, setActiveTab, search, setSearch, timeFilter, setTimeFilter, handleSearchSubmit, handleBuyAgain
  };
};